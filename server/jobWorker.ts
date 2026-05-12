import { db } from "./db";
import { backgroundJobs, jobIdempotencyKeys } from "@shared/schema";
import { eq, and, lt, or, lte, sql, gt } from "drizzle-orm";
import logger from "./logger";
import { withRetry, recordMetric } from "./resilience";
import { createLogicalBackup, cleanupOldBackups, simulateRestoreTest } from "./backupService";
import * as crypto from "crypto";

const SERVICE = "JobWorker";
const POLL_INTERVAL_MS = 60000;
const STALE_JOB_TIMEOUT_MS = 30 * 60 * 1000;
const WORKER_LOCK_ID = 123456789;
const IDEMPOTENCY_EXPIRY_HOURS = 24;

let isRunning = false;
let pollTimeout: NodeJS.Timeout | null = null;
let hasWorkerLock = false;
let lockHealthCheckInterval: NodeJS.Timeout | null = null;

function generateIdempotencyKey(jobType: string, payload: unknown): string {
  const payloadStr = JSON.stringify(payload || {});
  const hash = crypto.createHash('sha256').update(`${jobType}:${payloadStr}`).digest('hex');
  return `${jobType}:${hash.substring(0, 32)}`;
}

async function checkIdempotency(idempotencyKey: string): Promise<{ isDuplicate: boolean; cachedResult?: unknown }> {
  try {
    const [existing] = await db.select()
      .from(jobIdempotencyKeys)
      .where(
        and(
          eq(jobIdempotencyKeys.idempotencyKey, idempotencyKey),
          gt(jobIdempotencyKeys.expiresAt, new Date())
        )
      )
      .limit(1);
    
    if (existing) {
      if (existing.status === "completed") {
        return { isDuplicate: true, cachedResult: existing.result };
      }
      if (existing.status === "pending") {
        return { isDuplicate: true };
      }
    }
    
    return { isDuplicate: false };
  } catch (error) {
    logger.warn(SERVICE, "Idempotency check failed, proceeding", { error: String(error) });
    return { isDuplicate: false };
  }
}

async function registerIdempotencyKey(idempotencyKey: string, jobType: string, jobId: number): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + IDEMPOTENCY_EXPIRY_HOURS);
    
    await db.insert(jobIdempotencyKeys).values({
      idempotencyKey,
      jobType,
      jobId,
      status: "pending",
      expiresAt,
    }).onConflictDoNothing();
  } catch (error) {
    logger.warn(SERVICE, "Failed to register idempotency key", { error: String(error) });
  }
}

async function completeIdempotencyKey(idempotencyKey: string, result: unknown, success: boolean): Promise<void> {
  try {
    await db.update(jobIdempotencyKeys)
      .set({
        status: success ? "completed" : "failed",
        result: result as Record<string, unknown>,
      })
      .where(eq(jobIdempotencyKeys.idempotencyKey, idempotencyKey));
  } catch (error) {
    logger.warn(SERVICE, "Failed to complete idempotency key", { error: String(error) });
  }
}

async function cleanupExpiredIdempotencyKeys(): Promise<number> {
  try {
    const result = await db.delete(jobIdempotencyKeys)
      .where(lt(jobIdempotencyKeys.expiresAt, new Date()))
      .returning();
    
    if (result.length > 0) {
      logger.debug(SERVICE, `Cleaned up ${result.length} expired idempotency keys`);
    }
    return result.length;
  } catch (error) {
    logger.warn(SERVICE, "Failed to cleanup idempotency keys", { error: String(error) });
    return 0;
  }
}

async function tryAcquireWorkerLock(): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT pg_try_advisory_lock(${WORKER_LOCK_ID}) as acquired`);
    const acquired = (result.rows[0] as any)?.acquired === true;
    if (acquired) {
      hasWorkerLock = true;
      logger.info(SERVICE, "Acquired distributed worker lock");
      startLockHealthCheck();
    }
    return acquired;
  } catch (error) {
    logger.error(SERVICE, "Failed to acquire worker lock", { error: String(error) });
    return false;
  }
}

function startLockHealthCheck(): void {
  if (lockHealthCheckInterval) return;
  lockHealthCheckInterval = setInterval(async () => {
    if (!hasWorkerLock || !isRunning) {
      if (lockHealthCheckInterval) {
        clearInterval(lockHealthCheckInterval);
        lockHealthCheckInterval = null;
      }
      return;
    }
    try {
      const result = await db.execute(sql`
        SELECT EXISTS(
          SELECT 1 FROM pg_locks 
          WHERE locktype = 'advisory' 
          AND objid = ${WORKER_LOCK_ID}
          AND granted = true
        ) as has_lock
      `);
      const stillHasLock = (result.rows[0] as any)?.has_lock === true;
      if (!stillHasLock) {
        logger.warn(SERVICE, "Lost worker lock! Stopping processing.");
        hasWorkerLock = false;
        if (pollTimeout) {
          clearTimeout(pollTimeout);
          pollTimeout = null;
        }
        scheduleStandbyCheck();
      }
    } catch (error) {
      logger.error(SERVICE, "Lock health check failed", { error: String(error) });
    }
  }, 30000);
}

async function releaseWorkerLock(): Promise<void> {
  if (lockHealthCheckInterval) {
    clearInterval(lockHealthCheckInterval);
    lockHealthCheckInterval = null;
  }
  if (!hasWorkerLock) return;
  try {
    await db.execute(sql`SELECT pg_advisory_unlock(${WORKER_LOCK_ID})`);
    hasWorkerLock = false;
    logger.info(SERVICE, "Released distributed worker lock");
  } catch (error) {
    logger.error(SERVICE, "Failed to release worker lock", { error: String(error) });
  }
}

async function tryAcquireJobLock(jobId: number): Promise<boolean> {
  try {
    const lockId = 900000000 + jobId;
    const result = await db.execute(sql`SELECT pg_try_advisory_lock(${lockId}) as acquired`);
    return (result.rows[0] as any)?.acquired === true;
  } catch (error) {
    logger.error(SERVICE, `Failed to acquire lock for job ${jobId}`, { error: String(error) });
    return false;
  }
}

async function releaseJobLock(jobId: number): Promise<void> {
  try {
    const lockId = 900000000 + jobId;
    await db.execute(sql`SELECT pg_advisory_unlock(${lockId})`);
  } catch (error) {
    logger.error(SERVICE, `Failed to release lock for job ${jobId}`, { error: String(error) });
  }
}

type JobHandler = (payload: unknown) => Promise<unknown>;

const jobHandlers: Record<string, JobHandler> = {
  backup: async () => {
    logger.info(SERVICE, "Executing backup job");
    const result = await createLogicalBackup();
    if (result.success && result.backupId) {
      await simulateRestoreTest(result.backupId);
    }
    await cleanupOldBackups(30);
    return result;
  },
  
  email: async (payload) => {
    logger.info(SERVICE, "Email job placeholder", { payload: payload as Record<string, unknown> });
    return { sent: true };
  },
  
  report: async (payload) => {
    logger.info(SERVICE, "Report generation job placeholder", { payload: payload as Record<string, unknown> });
    return { generated: true };
  },
  
  cleanup: async () => {
    logger.info(SERVICE, "Cleanup job executing");
    await cleanupStaleJobs();
    await cleanupExpiredIdempotencyKeys();
    return { cleaned: true };
  },
  
  integrity_check: async () => {
    logger.info(SERVICE, "Data integrity check job");
    const { verifyDataIntegrity } = await import("./backupService");
    return await verifyDataIntegrity();
  },
};

export function registerJobHandler(jobType: string, handler: JobHandler): void {
  jobHandlers[jobType] = handler;
  logger.info(SERVICE, `Registered handler for job type: ${jobType}`);
}

async function processJob(job: typeof backgroundJobs.$inferSelect): Promise<void> {
  const acquired = await tryAcquireJobLock(job.id);
  if (!acquired) {
    logger.debug(SERVICE, `Job ${job.id} already being processed by another worker`);
    return;
  }

  const idempotencyKey = generateIdempotencyKey(job.type, job.payload);
  const { isDuplicate, cachedResult } = await checkIdempotency(idempotencyKey);
  
  if (isDuplicate) {
    logger.info(SERVICE, `Job ${job.id} is duplicate, skipping`, { idempotencyKey });
    
    await db.update(backgroundJobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        lastError: "Duplicate job - skipped (idempotency)",
      })
      .where(eq(backgroundJobs.id, job.id));
    
    await releaseJobLock(job.id);
    await recordMetric("job_duplicate_skipped", 1, { type: job.type });
    return;
  }

  const startTime = Date.now();
  await registerIdempotencyKey(idempotencyKey, job.type, job.id);
  
  try {
    logger.info(SERVICE, `Processing job ${job.id}`, {
      jobId: job.id,
      type: job.type,
      attempt: (job.attempts || 0) + 1,
    });
    
    await db.update(backgroundJobs)
      .set({
        status: "processing",
        startedAt: new Date(),
        attempts: (job.attempts || 0) + 1,
      })
      .where(eq(backgroundJobs.id, job.id));
    
    const handler = jobHandlers[job.type];
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }
    
    const result = await withRetry(
      () => handler(job.payload),
      `job-${job.type}-${job.id}`,
      { maxAttempts: 2, baseDelayMs: 5000 }
    );
    
    const duration = Date.now() - startTime;
    
    await db.update(backgroundJobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        lastError: null,
      })
      .where(eq(backgroundJobs.id, job.id));
    
    await completeIdempotencyKey(idempotencyKey, result, true);
    await recordMetric("job_completed", 1, { type: job.type });
    await recordMetric("job_duration_ms", duration, { type: job.type });
    
    logger.info(SERVICE, `Job ${job.id} completed`, {
      jobId: job.id,
      type: job.type,
      duration,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const currentAttempts = (job.attempts || 0) + 1;
    const shouldRetry = currentAttempts < (job.maxAttempts || 3);
    
    if (shouldRetry) {
      await db.update(backgroundJobs)
        .set({
          status: "retrying",
          lastError: errorMessage,
          scheduledAt: new Date(Date.now() + Math.pow(2, currentAttempts) * 60000),
        })
        .where(eq(backgroundJobs.id, job.id));
      
      await recordMetric("job_retry", 1, { type: job.type });
    } else {
      await db.update(backgroundJobs)
        .set({
          status: "failed",
          lastError: errorMessage,
          completedAt: new Date(),
        })
        .where(eq(backgroundJobs.id, job.id));
      
      await completeIdempotencyKey(idempotencyKey, { error: errorMessage }, false);
      await recordMetric("job_failed", 1, { type: job.type });
      
      await moveToDeadLetterQueue(job, errorMessage);
    }
    
    logger.error(SERVICE, `Job ${job.id} failed`, {
      error: errorMessage,
      jobId: job.id,
      type: job.type,
      willRetry: shouldRetry,
    });
  } finally {
    await releaseJobLock(job.id);
  }
}

async function moveToDeadLetterQueue(job: typeof backgroundJobs.$inferSelect, error: string): Promise<void> {
  try {
    await db.insert(backgroundJobs).values({
      type: `dlq:${job.type}`,
      payload: {
        originalJob: job,
        error,
        movedAt: new Date().toISOString(),
      },
      status: "failed",
      priority: -1,
      maxAttempts: 0,
      scheduledAt: new Date(),
    });
    
    logger.warn(SERVICE, `Moved job ${job.id} to dead letter queue`, {
      jobId: job.id,
      type: job.type,
    });
  } catch (dlqError) {
    logger.error(SERVICE, "Failed to move job to DLQ", { error: String(dlqError) });
  }
}

async function pollJobs(): Promise<number> {
  const now = new Date();
  
  const pendingJobs = await db.select()
    .from(backgroundJobs)
    .where(
      and(
        or(
          eq(backgroundJobs.status, "pending"),
          eq(backgroundJobs.status, "retrying")
        ),
        lte(backgroundJobs.scheduledAt, now)
      )
    )
    .orderBy(backgroundJobs.priority)
    .limit(10);
  
  for (const job of pendingJobs) {
    await processJob(job);
  }
  
  return pendingJobs.length;
}

async function cleanupStaleJobs(): Promise<number> {
  const staleThreshold = new Date(Date.now() - STALE_JOB_TIMEOUT_MS);
  
  const staleJobs = await db.update(backgroundJobs)
    .set({
      status: "failed",
      lastError: "Job timed out - marked as stale",
      completedAt: new Date(),
    })
    .where(
      and(
        eq(backgroundJobs.status, "processing"),
        lt(backgroundJobs.startedAt, staleThreshold)
      )
    )
    .returning();
  
  if (staleJobs.length > 0) {
    logger.warn(SERVICE, `Marked ${staleJobs.length} stale jobs as failed`, {
      jobIds: staleJobs.map(j => j.id),
    });
    await recordMetric("job_stale_cleanup", staleJobs.length, {});
  }
  
  return staleJobs.length;
}

async function runPollCycle(): Promise<void> {
  if (!isRunning) return;
  
  try {
    const processed = await pollJobs();
    if (processed > 0) {
      logger.debug(SERVICE, `Processed ${processed} jobs this cycle`);
    }
  } catch (error) {
    logger.error(SERVICE, "Error in poll cycle", { error: String(error) });
  }
  
  if (isRunning) {
    pollTimeout = setTimeout(runPollCycle, POLL_INTERVAL_MS);
  }
}

export async function startJobWorker(): Promise<void> {
  if (isRunning) {
    logger.warn(SERVICE, "Job worker already running");
    return;
  }
  
  const acquired = await tryAcquireWorkerLock();
  if (!acquired) {
    logger.info(SERVICE, "Another worker instance holds the lock. Running in standby mode.");
    isRunning = true;
    scheduleStandbyCheck();
    return;
  }
  
  isRunning = true;
  logger.info(SERVICE, "Starting job worker as primary", { pollInterval: POLL_INTERVAL_MS });
  
  await cleanupStaleJobs();
  await cleanupExpiredIdempotencyKeys();
  runPollCycle();
}

function scheduleStandbyCheck(): void {
  setTimeout(async () => {
    if (!isRunning) return;
    
    const acquired = await tryAcquireWorkerLock();
    if (acquired) {
      logger.info(SERVICE, "Acquired worker lock. Becoming primary.");
      await cleanupStaleJobs();
      runPollCycle();
    } else {
      scheduleStandbyCheck();
    }
  }, POLL_INTERVAL_MS * 2);
}

export async function stopJobWorker(): Promise<void> {
  if (!isRunning) return;
  
  isRunning = false;
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
  
  await releaseWorkerLock();
  logger.info(SERVICE, "Job worker stopped");
}

export async function enqueueJob(
  type: string,
  payload?: unknown,
  options?: {
    scheduledAt?: Date;
    priority?: number;
    maxAttempts?: number;
    idempotencyKey?: string;
  }
): Promise<{ jobId: number; isDuplicate: boolean }> {
  const customIdempotencyKey = options?.idempotencyKey || generateIdempotencyKey(type, payload);
  
  const { isDuplicate } = await checkIdempotency(customIdempotencyKey);
  if (isDuplicate) {
    logger.info(SERVICE, `Duplicate job enqueue rejected`, { type, idempotencyKey: customIdempotencyKey });
    return { jobId: -1, isDuplicate: true };
  }
  
  const [job] = await db.insert(backgroundJobs).values({
    type,
    payload: payload as Record<string, unknown>,
    status: "pending",
    priority: options?.priority ?? 0,
    maxAttempts: options?.maxAttempts ?? 3,
    scheduledAt: options?.scheduledAt ?? new Date(),
  }).returning();
  
  await registerIdempotencyKey(customIdempotencyKey, type, job.id);
  
  logger.info(SERVICE, `Enqueued job ${job.id}`, {
    jobId: job.id,
    type,
    scheduledAt: options?.scheduledAt?.toISOString(),
  });
  
  return { jobId: job.id, isDuplicate: false };
}

export async function getJobStats() {
  const allJobs = await db.select().from(backgroundJobs);
  
  const stats = {
    total: allJobs.length,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    dlq: 0,
  };
  
  allJobs.forEach(job => {
    if (job.type.startsWith('dlq:')) {
      stats.dlq++;
    } else {
      const status = job.status as keyof typeof stats;
      if (status in stats && status !== "total" && status !== "dlq") {
        stats[status]++;
      }
    }
  });
  
  return {
    ...stats,
    isPrimaryWorker: hasWorkerLock,
    mode: hasWorkerLock ? "primary" : "standby",
  };
}

export function registerJobWorkerRoutes(app: any): void {
  app.get("/api/admin/jobs/stats", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const stats = await getJobStats();
    res.json({
      isRunning,
      pollInterval: POLL_INTERVAL_MS,
      ...stats,
    });
  });
  
  app.post("/api/admin/jobs/enqueue", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const { type, payload, scheduledAt, priority, idempotencyKey } = req.body;
    if (!type) {
      return res.status(400).json({ message: "Job type is required" });
    }
    
    const result = await enqueueJob(type, payload, {
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      priority,
      idempotencyKey,
    });
    
    if (result.isDuplicate) {
      return res.status(409).json({ message: "Duplicate job rejected" });
    }
    
    res.json({ jobId: result.jobId, message: "Job enqueued" });
  });
  
  app.get("/api/admin/jobs/dlq", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const dlqJobs = await db.select()
      .from(backgroundJobs)
      .where(sql`type LIKE 'dlq:%'`)
      .orderBy(sql`created_at DESC`)
      .limit(50);
    
    res.json(dlqJobs);
  });
  
  logger.info(SERVICE, "Routes registered");
}
