import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import logger from "./logger";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: ComponentHealth;
    memory: ComponentHealth;
    disk?: ComponentHealth;
  };
  version: string;
}

export interface ComponentHealth {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  details?: Record<string, any>;
}

const startTime = Date.now();

export async function getHealthStatus(): Promise<HealthStatus> {
  const dbHealth = await checkDatabaseHealth();
  const memoryHealth = checkMemoryHealth();
  
  const overallStatus = determineOverallStatus([dbHealth, memoryHealth]);
  
  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: dbHealth,
      memory: memoryHealth,
    },
    version: process.env.APP_VERSION || "1.0.0",
  };
}

export async function getReadinessStatus(): Promise<{ ready: boolean; checks: Record<string, boolean> }> {
  const dbReady = await isDatabaseReady();
  
  return {
    ready: dbReady,
    checks: {
      database: dbReady,
    },
  };
}

async function checkDatabaseHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();
  
  try {
    await db.execute(sql`SELECT 1`);
    
    const poolStats = {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingConnections: pool.waitingCount,
    };
    
    return {
      status: "up",
      responseTime: Date.now() - startTime,
      details: poolStats,
    };
  } catch (error) {
    return {
      status: "down",
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

async function isDatabaseReady(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

function checkMemoryHealth(): ComponentHealth {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);
  
  const heapUsagePercent = (used.heapUsed / used.heapTotal) * 100;
  
  let status: "up" | "down" | "degraded" = "up";
  if (heapUsagePercent > 90) {
    status = "degraded";
  }
  if (heapUsagePercent > 95) {
    status = "down";
  }
  
  return {
    status,
    details: {
      heapUsedMB,
      heapTotalMB,
      rssMB,
      heapUsagePercent: Math.round(heapUsagePercent),
    },
  };
}

function determineOverallStatus(checks: ComponentHealth[]): "healthy" | "degraded" | "unhealthy" {
  const hasDown = checks.some(c => c.status === "down");
  const hasDegraded = checks.some(c => c.status === "degraded");
  
  if (hasDown) return "unhealthy";
  if (hasDegraded) return "degraded";
  return "healthy";
}

export function registerHealthRoutes(app: any): void {
  app.get("/health", async (_req: any, res: any) => {
    try {
      const health = await getHealthStatus();
      const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/ready", async (_req: any, res: any) => {
    try {
      const readiness = await getReadinessStatus();
      res.status(readiness.ready ? 200 : 503).json(readiness);
    } catch (error) {
      res.status(503).json({
        ready: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/live", (_req: any, res: any) => {
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
    });
  });
}
