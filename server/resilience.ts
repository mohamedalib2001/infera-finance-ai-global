import { db } from "./db";
import { circuitBreakerState, systemMetrics } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import logger from "./logger";

interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBackoff: boolean;
}

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  exponentialBackoff: true,
};

const DEFAULT_CIRCUIT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  halfOpenMaxAttempts: 3,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === config.maxAttempts) {
        logger.error("Resilience", `${operationName} failed after ${attempt} attempts`, error);
        throw error;
      }
      
      const delay = config.exponentialBackoff
        ? Math.min(config.baseDelayMs * Math.pow(2, attempt - 1), config.maxDelayMs)
        : config.baseDelayMs;
      
      logger.warn("Resilience", `${operationName} attempt ${attempt} failed, retrying in ${delay}ms`, {
        attempt,
        maxAttempts: config.maxAttempts,
        delay,
      });
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

class PersistentCircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private readonly name: string;
  private readonly options: CircuitBreakerOptions;
  private initialized = false;
  
  constructor(name: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.name = name;
    this.options = { ...DEFAULT_CIRCUIT_OPTIONS, ...options };
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const [existing] = await db.select()
        .from(circuitBreakerState)
        .where(eq(circuitBreakerState.name, this.name))
        .limit(1);
      
      if (existing) {
        this.state = existing.state as CircuitState;
        this.failureCount = existing.failureCount || 0;
        this.halfOpenAttempts = existing.halfOpenAttempts || 0;
        this.lastFailureTime = existing.lastFailureTime 
          ? new Date(existing.lastFailureTime).getTime() 
          : 0;
        logger.debug("Resilience", `Circuit ${this.name} restored from DB`, {
          state: this.state,
          failureCount: this.failureCount,
        });
      } else {
        await db.insert(circuitBreakerState).values({
          name: this.name,
          state: "CLOSED",
          failureCount: 0,
          halfOpenAttempts: 0,
        });
      }
      
      this.initialized = true;
    } catch (error) {
      logger.warn("Resilience", `Failed to initialize circuit ${this.name} from DB, using memory`, { error: String(error) });
      this.initialized = true;
    }
  }
  
  private async persist(): Promise<void> {
    try {
      await db.update(circuitBreakerState)
        .set({
          state: this.state,
          failureCount: this.failureCount,
          halfOpenAttempts: this.halfOpenAttempts,
          lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime) : null,
          lastSuccessTime: this.state === "CLOSED" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(circuitBreakerState.name, this.name));
    } catch (error) {
      logger.warn("Resilience", `Failed to persist circuit ${this.name} state`, { error: String(error) });
    }
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    await this.initialize();
    
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        this.halfOpenAttempts = 0;
        await this.persist();
        logger.info("Resilience", `Circuit ${this.name} entering HALF_OPEN state`);
      } else {
        logger.warn("Resilience", `Circuit ${this.name} is OPEN, rejecting request`);
        throw new CircuitOpenError(`Circuit ${this.name} is open`);
      }
    }
    
    try {
      const result = await operation();
      await this.onSuccess();
      return result;
    } catch (error) {
      await this.onFailure();
      throw error;
    }
  }
  
  private async onSuccess(): Promise<void> {
    if (this.state === "HALF_OPEN") {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
        this.state = "CLOSED";
        this.failureCount = 0;
        await this.persist();
        logger.info("Resilience", `Circuit ${this.name} CLOSED after successful half-open attempts`);
      }
    } else {
      if (this.failureCount > 0) {
        this.failureCount = 0;
        await this.persist();
      }
    }
    
    await recordMetric("circuit_breaker_success", 1, { circuit: this.name });
  }
  
  private async onFailure(): Promise<void> {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      await this.persist();
      logger.error("Resilience", `Circuit ${this.name} reopened after HALF_OPEN failure`);
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      await this.persist();
      logger.error("Resilience", `Circuit ${this.name} OPENED after ${this.failureCount} failures`);
    } else {
      await this.persist();
    }
    
    await recordMetric("circuit_breaker_failure", 1, { circuit: this.name });
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getStats() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      halfOpenAttempts: this.halfOpenAttempts,
    };
  }
  
  async reset(): Promise<void> {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.halfOpenAttempts = 0;
    await this.persist();
    logger.info("Resilience", `Circuit ${this.name} manually reset`);
  }
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitOpenError";
  }
}

const circuitBreakers = new Map<string, PersistentCircuitBreaker>();

export function getCircuitBreaker(name: string, options?: Partial<CircuitBreakerOptions>): PersistentCircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new PersistentCircuitBreaker(name, options));
  }
  return circuitBreakers.get(name)!;
}

export async function getAllCircuitBreakerStats() {
  const stats: Record<string, ReturnType<PersistentCircuitBreaker["getStats"]>> = {};
  
  try {
    const dbStates = await db.select().from(circuitBreakerState);
    for (const state of dbStates) {
      stats[state.name] = {
        name: state.name,
        state: state.state as CircuitState,
        failureCount: state.failureCount || 0,
        lastFailureTime: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : null,
        halfOpenAttempts: state.halfOpenAttempts || 0,
      };
    }
  } catch (error) {
    circuitBreakers.forEach((cb, name) => {
      stats[name] = cb.getStats();
    });
  }
  
  return stats;
}

export async function withCircuitBreaker<T>(
  circuitName: string,
  operation: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>
): Promise<T> {
  const breaker = getCircuitBreaker(circuitName, options);
  return breaker.execute(operation);
}

export async function withResiliency<T>(
  operation: () => Promise<T>,
  operationName: string,
  options?: {
    retry?: Partial<RetryOptions>;
    circuitBreaker?: Partial<CircuitBreakerOptions>;
  }
): Promise<T> {
  const circuitBreaker = getCircuitBreaker(operationName, options?.circuitBreaker);
  
  return circuitBreaker.execute(() => 
    withRetry(operation, operationName, options?.retry)
  );
}

export async function recordMetric(
  metricName: string,
  value: number,
  labels: Record<string, string> = {}
): Promise<void> {
  try {
    await db.insert(systemMetrics).values({
      metricName,
      metricValue: String(value),
      labels,
    });
  } catch (error) {
    logger.debug("Resilience", `Failed to record metric ${metricName}`, { error: String(error) });
  }
}

export async function getMetrics(metricName: string, limit: number = 100) {
  return db.select()
    .from(systemMetrics)
    .where(eq(systemMetrics.metricName, metricName))
    .orderBy(sql`recorded_at DESC`)
    .limit(limit);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function registerResilienceRoutes(app: any): void {
  app.get("/api/admin/circuits", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    const stats = await getAllCircuitBreakerStats();
    res.json(stats);
  });
  
  app.post("/api/admin/circuits/:name/reset", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const breaker = circuitBreakers.get(req.params.name);
    if (!breaker) {
      return res.status(404).json({ message: "Circuit not found" });
    }
    
    await breaker.reset();
    res.json({ message: "Circuit reset", stats: breaker.getStats() });
  });
  
  app.get("/api/admin/metrics/:name", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const limit = parseInt(req.query.limit as string) || 100;
    const metrics = await getMetrics(req.params.name, limit);
    res.json(metrics);
  });
  
  logger.info("Resilience", "Routes registered");
}
