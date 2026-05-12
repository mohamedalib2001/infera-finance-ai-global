import { db } from "./db";
import { databaseBackups, backgroundJobs, featureFlags, users, organizations, accounts, transactions, invoices, budgets } from "@shared/schema";
import { eq, and, desc, sql, lt, count } from "drizzle-orm";
import logger from "./logger";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

const SERVICE = "Backup";
const BACKUP_DIR = "/tmp/backups";

export interface BackupResult {
  success: boolean;
  backupId?: number;
  size?: number;
  duration?: number;
  checksum?: string;
  error?: string;
}

export interface RestoreVerificationResult {
  success: boolean;
  tablesVerified: number;
  rowCountsMatch: boolean;
  integrityPassed: boolean;
  errors: string[];
}

async function ensureBackupDir(): Promise<void> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

async function getTableRowCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  
  const tables = [
    { name: 'users', table: users },
    { name: 'organizations', table: organizations },
    { name: 'accounts', table: accounts },
    { name: 'transactions', table: transactions },
    { name: 'invoices', table: invoices },
    { name: 'budgets', table: budgets },
  ];
  
  for (const { name, table } of tables) {
    try {
      const [result] = await db.select({ count: count() }).from(table);
      counts[name] = Number(result.count);
    } catch (error) {
      counts[name] = -1;
    }
  }
  
  return counts;
}

async function exportTableData(tableName: string): Promise<string> {
  const result = await db.execute(sql`
    SELECT row_to_json(t) FROM (SELECT * FROM ${sql.identifier(tableName)}) t
  `);
  return JSON.stringify(result.rows);
}

export async function createLogicalBackup(): Promise<BackupResult> {
  const startTime = Date.now();
  logger.info(SERVICE, "Starting comprehensive logical backup...");
  
  try {
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    const rowCounts = await getTableRowCounts();
    
    const backupData: Record<string, any> = {
      metadata: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        platform: "INFERA Finance AI Global",
        rowCounts,
      },
      tables: {},
    };
    
    const criticalTables = [
      'users', 'organizations', 'accounts', 'transactions', 
      'invoices', 'budgets', 'feature_flags', 'platform_config',
      'subscriptions', 'audit_logs', 'payment_gateways'
    ];
    
    for (const tableName of criticalTables) {
      try {
        const data = await exportTableData(tableName);
        backupData.tables[tableName] = JSON.parse(data);
        logger.debug(SERVICE, `Exported table: ${tableName}`);
      } catch (error) {
        logger.warn(SERVICE, `Could not export table ${tableName}`, { error: String(error) });
      }
    }
    
    const jsonContent = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(filepath, jsonContent);
    
    const checksum = crypto.createHash('sha256').update(jsonContent).digest('hex');
    const fileSize = Buffer.byteLength(jsonContent, 'utf8');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const [backup] = await db.insert(databaseBackups).values({
      filename,
      size: fileSize,
      status: "completed",
      type: "scheduled",
      retentionDays: 30,
      expiresAt,
      checksum,
      tableRowCounts: rowCounts,
      restoreVerified: false,
    }).returning();
    
    const duration = Date.now() - startTime;
    logger.info(SERVICE, `Backup completed in ${duration}ms`, { 
      filename, 
      duration, 
      size: fileSize,
      checksum: checksum.substring(0, 16) + '...',
    });
    
    return {
      success: true,
      backupId: backup.id,
      size: fileSize,
      duration,
      checksum,
    };
  } catch (error) {
    logger.error(SERVICE, "Backup failed", error);
    
    await db.insert(databaseBackups).values({
      filename: "failed_backup",
      size: 0,
      status: "failed",
      type: "scheduled"
    });
    
    return {
      success: false,
      error: String(error)
    };
  }
}

export async function verifyBackupIntegrity(backupId: number): Promise<RestoreVerificationResult> {
  const errors: string[] = [];
  
  try {
    const [backup] = await db.select()
      .from(databaseBackups)
      .where(eq(databaseBackups.id, backupId))
      .limit(1);
    
    if (!backup) {
      return {
        success: false,
        tablesVerified: 0,
        rowCountsMatch: false,
        integrityPassed: false,
        errors: ["Backup not found"],
      };
    }
    
    const filepath = path.join(BACKUP_DIR, backup.filename);
    
    if (!fs.existsSync(filepath)) {
      return {
        success: false,
        tablesVerified: 0,
        rowCountsMatch: false,
        integrityPassed: false,
        errors: ["Backup file not found on disk"],
      };
    }
    
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const currentChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');
    
    if (backup.checksum && currentChecksum !== backup.checksum) {
      errors.push("Checksum mismatch - backup file may be corrupted");
    }
    
    let backupData: any;
    try {
      backupData = JSON.parse(fileContent);
    } catch {
      return {
        success: false,
        tablesVerified: 0,
        rowCountsMatch: false,
        integrityPassed: false,
        errors: ["Invalid JSON in backup file"],
      };
    }
    
    const currentRowCounts = await getTableRowCounts();
    const savedRowCounts = backup.tableRowCounts as Record<string, number> || {};
    
    let rowCountsMatch = true;
    for (const [table, savedCount] of Object.entries(savedRowCounts)) {
      const currentCount = currentRowCounts[table];
      if (currentCount !== undefined && currentCount < savedCount) {
        errors.push(`Table ${table}: current count (${currentCount}) is less than backup (${savedCount})`);
        rowCountsMatch = false;
      }
    }
    
    const tablesInBackup = Object.keys(backupData.tables || {}).length;
    
    await db.update(databaseBackups)
      .set({
        restoreVerified: errors.length === 0,
        restoreVerifiedAt: new Date(),
      })
      .where(eq(databaseBackups.id, backupId));
    
    logger.info(SERVICE, `Backup verification completed for ID ${backupId}`, {
      tablesVerified: tablesInBackup,
      rowCountsMatch,
      errors: errors.length,
    });
    
    return {
      success: errors.length === 0,
      tablesVerified: tablesInBackup,
      rowCountsMatch,
      integrityPassed: !backup.checksum || currentChecksum === backup.checksum,
      errors,
    };
  } catch (error) {
    logger.error(SERVICE, "Backup verification failed", error);
    return {
      success: false,
      tablesVerified: 0,
      rowCountsMatch: false,
      integrityPassed: false,
      errors: [`Verification error: ${error}`],
    };
  }
}

export async function simulateRestoreTest(backupId: number): Promise<RestoreVerificationResult> {
  logger.info(SERVICE, `Starting restore simulation for backup ${backupId}`);
  
  try {
    const [backup] = await db.select()
      .from(databaseBackups)
      .where(eq(databaseBackups.id, backupId))
      .limit(1);
    
    if (!backup) {
      return {
        success: false,
        tablesVerified: 0,
        rowCountsMatch: false,
        integrityPassed: false,
        errors: ["Backup not found"],
      };
    }
    
    const filepath = path.join(BACKUP_DIR, backup.filename);
    
    if (!fs.existsSync(filepath)) {
      return {
        success: false,
        tablesVerified: 0,
        rowCountsMatch: false,
        integrityPassed: false,
        errors: ["Backup file not found"],
      };
    }
    
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const backupData = JSON.parse(fileContent);
    
    const errors: string[] = [];
    let tablesVerified = 0;
    
    for (const [tableName, rows] of Object.entries(backupData.tables || {})) {
      if (!Array.isArray(rows)) continue;
      
      if (rows.length > 0) {
        const sampleRow = rows[0] as Record<string, any>;
        if (typeof sampleRow !== 'object' || sampleRow === null) {
          errors.push(`Table ${tableName}: Invalid row structure`);
          continue;
        }
        
        if (!('id' in sampleRow)) {
          errors.push(`Table ${tableName}: Missing 'id' field in rows`);
        }
      }
      
      tablesVerified++;
    }
    
    const protectedOwnerExists = (backupData.tables?.users || []).some(
      (u: any) => u.is_protected_owner === true || u.isProtectedOwner === true
    );
    
    if (!protectedOwnerExists) {
      errors.push("CRITICAL: No protected owner found in backup data");
    }
    
    const success = errors.filter(e => e.startsWith('CRITICAL')).length === 0;
    
    await db.update(databaseBackups)
      .set({
        restoreVerified: success,
        restoreVerifiedAt: new Date(),
        status: success ? "verified" : "completed",
      })
      .where(eq(databaseBackups.id, backupId));
    
    logger.info(SERVICE, `Restore simulation completed for backup ${backupId}`, {
      success,
      tablesVerified,
      errors: errors.length,
    });
    
    return {
      success,
      tablesVerified,
      rowCountsMatch: true,
      integrityPassed: success,
      errors,
    };
  } catch (error) {
    logger.error(SERVICE, "Restore simulation failed", error);
    return {
      success: false,
      tablesVerified: 0,
      rowCountsMatch: false,
      integrityPassed: false,
      errors: [`Simulation error: ${error}`],
    };
  }
}

export async function cleanupOldBackups(retentionDays: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  logger.info(SERVICE, `Cleaning up backups older than ${retentionDays} days...`);
  
  const oldBackups = await db.select()
    .from(databaseBackups)
    .where(
      and(
        eq(databaseBackups.status, "completed"),
        lt(databaseBackups.createdAt, cutoffDate)
      )
    );
  
  for (const backup of oldBackups) {
    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
  
  const result = await db.delete(databaseBackups)
    .where(
      and(
        eq(databaseBackups.status, "completed"),
        lt(databaseBackups.createdAt, cutoffDate)
      )
    )
    .returning();
  
  logger.info(SERVICE, `Cleaned up ${result.length} old backups`);
  return result.length;
}

export async function getBackupHistory(limit: number = 10) {
  return db.select()
    .from(databaseBackups)
    .orderBy(desc(databaseBackups.createdAt))
    .limit(limit);
}

export async function getLastSuccessfulBackup() {
  const [backup] = await db.select()
    .from(databaseBackups)
    .where(eq(databaseBackups.status, "completed"))
    .orderBy(desc(databaseBackups.createdAt))
    .limit(1);
  return backup;
}

export async function getLastVerifiedBackup() {
  const [backup] = await db.select()
    .from(databaseBackups)
    .where(eq(databaseBackups.restoreVerified, true))
    .orderBy(desc(databaseBackups.createdAt))
    .limit(1);
  return backup;
}

export async function isAutoBackupEnabled(): Promise<boolean> {
  const [flag] = await db.select()
    .from(featureFlags)
    .where(eq(featureFlags.key, "auto_backup"))
    .limit(1);
  return flag?.isEnabled ?? false;
}

export async function scheduleBackupJob() {
  const autoBackupEnabled = await isAutoBackupEnabled();
  if (!autoBackupEnabled) {
    logger.info(SERVICE, "Auto backup is disabled. Skipping job scheduling.");
    return;
  }
  
  const [existingJob] = await db.select()
    .from(backgroundJobs)
    .where(
      and(
        eq(backgroundJobs.type, "backup"),
        eq(backgroundJobs.status, "pending")
      )
    )
    .limit(1);
  
  if (existingJob) {
    logger.info(SERVICE, "Backup job already scheduled");
    return existingJob;
  }
  
  const scheduledAt = new Date();
  scheduledAt.setHours(scheduledAt.getHours() + 24);
  
  const [job] = await db.insert(backgroundJobs).values({
    type: "backup",
    status: "pending",
    scheduledAt,
    payload: { autoScheduled: true }
  }).returning();
  
  logger.info(SERVICE, `Scheduled backup job for ${scheduledAt.toISOString()}`);
  return job;
}

export async function verifyDataIntegrity(): Promise<{
  success: boolean;
  checks: Record<string, boolean>;
  errors: string[];
  lastBackup: any;
  lastVerifiedBackup: any;
}> {
  const errors: string[] = [];
  const checks: Record<string, boolean> = {};
  
  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    checks.usersTableAccessible = Number(userCount.count) >= 0;
    
    const [orgCount] = await db.select({ count: count() }).from(organizations);
    checks.organizationsTableAccessible = Number(orgCount.count) >= 0;
    
    const protectedOwners = await db.select()
      .from(users)
      .where(and(eq(users.isProtectedOwner, true), eq(users.isDeleted, false)));
    checks.protectedOwnerExists = protectedOwners.length > 0;
    if (!checks.protectedOwnerExists) {
      errors.push("CRITICAL: No protected owner account found");
    }
    
    const configuredOwnerEmail = process.env.PLATFORM_OWNER_EMAIL || "owner@infera.ai";
    const ownerMatch = protectedOwners.find(u => u.email === configuredOwnerEmail);
    checks.ownerEmailMatches = !!ownerMatch;
    if (protectedOwners.length > 0 && !ownerMatch) {
      errors.push(`WARNING: Protected owner email (${protectedOwners[0].email}) doesn't match configured email (${configuredOwnerEmail})`);
    }
    
    const lastBackup = await getLastSuccessfulBackup();
    checks.recentBackupExists = !!lastBackup && (
      Date.now() - new Date(lastBackup.createdAt!).getTime() < 48 * 60 * 60 * 1000
    );
    if (!checks.recentBackupExists) {
      errors.push("WARNING: No backup in the last 48 hours");
    }
    
    const lastVerifiedBackup = await getLastVerifiedBackup();
    checks.verifiedBackupExists = !!lastVerifiedBackup;
    if (!checks.verifiedBackupExists) {
      errors.push("WARNING: No verified backup exists");
    }
    
    logger.info(SERVICE, "Data integrity check completed", { checks, errorCount: errors.length });
    
    return {
      success: errors.filter(e => e.startsWith("CRITICAL")).length === 0,
      checks,
      errors,
      lastBackup,
      lastVerifiedBackup,
    };
  } catch (error) {
    logger.error(SERVICE, "Data integrity check failed", error);
    return {
      success: false,
      checks,
      errors: [...errors, `Database error: ${error}`],
      lastBackup: null,
      lastVerifiedBackup: null,
    };
  }
}

export async function runScheduledBackupJobs(): Promise<number> {
  const now = new Date();
  
  const pendingJobs = await db.select()
    .from(backgroundJobs)
    .where(
      and(
        eq(backgroundJobs.type, "backup"),
        eq(backgroundJobs.status, "pending"),
        lt(backgroundJobs.scheduledAt, now)
      )
    );
  
  let completedCount = 0;
  
  for (const job of pendingJobs) {
    await db.update(backgroundJobs)
      .set({ status: "processing", startedAt: now })
      .where(eq(backgroundJobs.id, job.id));
    
    try {
      const result = await createLogicalBackup();
      
      if (result.success && result.backupId) {
        await simulateRestoreTest(result.backupId);
      }
      
      await db.update(backgroundJobs)
        .set({
          status: result.success ? "completed" : "failed",
          completedAt: new Date(),
          lastError: result.success ? null : result.error
        })
        .where(eq(backgroundJobs.id, job.id));
      
      if (result.success) completedCount++;
    } catch (error) {
      await db.update(backgroundJobs)
        .set({
          status: "failed",
          completedAt: new Date(),
          lastError: String(error),
          attempts: (job.attempts || 0) + 1
        })
        .where(eq(backgroundJobs.id, job.id));
    }
  }
  
  return completedCount;
}

export async function registerBackupRoutes(app: any) {
  app.post("/api/admin/backup/trigger", async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const result = await createLogicalBackup();
      
      if (result.success && result.backupId) {
        const verifyResult = await simulateRestoreTest(result.backupId);
        return res.json({ ...result, verification: verifyResult });
      }
      
      res.json(result);
    } catch (error) {
      logger.error(SERVICE, "Backup trigger error", error);
      res.status(500).json({ message: "Failed to trigger backup", error: String(error) });
    }
  });
  
  app.post("/api/admin/backup/:id/verify", async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const backupId = parseInt(req.params.id);
      const result = await simulateRestoreTest(backupId);
      res.json(result);
    } catch (error) {
      logger.error(SERVICE, "Backup verify error", error);
      res.status(500).json({ message: "Failed to verify backup", error: String(error) });
    }
  });
  
  app.get("/api/admin/backup/history", async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user || !["super_admin", "global_admin", "owner", "cfo"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await getBackupHistory(limit);
      res.json(history);
    } catch (error) {
      logger.error(SERVICE, "Backup history error", error);
      res.status(500).json({ message: "Failed to fetch backup history" });
    }
  });
  
  app.get("/api/admin/backup/status", async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user || !["super_admin", "global_admin", "owner", "cfo"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const lastBackup = await getLastSuccessfulBackup();
      const lastVerified = await getLastVerifiedBackup();
      const autoEnabled = await isAutoBackupEnabled();
      
      res.json({
        autoBackupEnabled: autoEnabled,
        lastSuccessfulBackup: lastBackup || null,
        lastVerifiedBackup: lastVerified || null,
        timeSinceLastBackup: lastBackup 
          ? Math.floor((Date.now() - new Date(lastBackup.createdAt!).getTime()) / (1000 * 60 * 60))
          : null,
        backupDirectory: BACKUP_DIR,
      });
    } catch (error) {
      logger.error(SERVICE, "Backup status error", error);
      res.status(500).json({ message: "Failed to fetch backup status" });
    }
  });
  
  app.get("/api/admin/backup/verify", async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const result = await verifyDataIntegrity();
      res.json(result);
    } catch (error) {
      logger.error(SERVICE, "Verify data integrity error", error);
      res.status(500).json({ message: "Failed to verify data integrity", error: String(error) });
    }
  });
  
  logger.info(SERVICE, "Routes registered");
}
