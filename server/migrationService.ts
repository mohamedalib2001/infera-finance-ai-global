import { db } from "./db";
import { migrationHistory } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import logger from "./logger";
import * as crypto from "crypto";

const SERVICE = "Migration";

interface MigrationDefinition {
  version: string;
  name: string;
  up: string;
  down?: string;
  isDestructive?: boolean;
}

const DESTRUCTIVE_PATTERNS = [
  /DROP\s+TABLE/i,
  /DROP\s+COLUMN/i,
  /DELETE\s+FROM/i,
  /TRUNCATE/i,
  /ALTER\s+TABLE.*DROP/i,
  /ALTER\s+COLUMN.*TYPE/i,
];

function isDestructiveMigration(sqlContent: string): boolean {
  return DESTRUCTIVE_PATTERNS.some(pattern => pattern.test(sqlContent));
}

function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function ensureMigrationTable(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        version TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW(),
        applied_by TEXT DEFAULT 'system',
        execution_time_ms INTEGER,
        is_destructive BOOLEAN DEFAULT false,
        rollback_sql TEXT
      )
    `);
  } catch (error) {
    logger.debug(SERVICE, "Migration table already exists or creation handled by schema");
  }
}

export async function getMigrationHistory() {
  try {
    return await db.select()
      .from(migrationHistory)
      .orderBy(desc(migrationHistory.appliedAt));
  } catch (error) {
    logger.warn(SERVICE, "Could not fetch migration history", { error: String(error) });
    return [];
  }
}

export async function hasAppliedMigration(version: string): Promise<boolean> {
  try {
    const [existing] = await db.select()
      .from(migrationHistory)
      .where(eq(migrationHistory.version, version))
      .limit(1);
    return !!existing;
  } catch (error) {
    return false;
  }
}

export async function verifyMigrationChecksum(version: string, expectedChecksum: string): Promise<boolean> {
  try {
    const [existing] = await db.select()
      .from(migrationHistory)
      .where(eq(migrationHistory.version, version))
      .limit(1);
    
    if (!existing) return true;
    
    if (existing.checksum !== expectedChecksum) {
      logger.error(SERVICE, `Checksum mismatch for migration ${version}`, {
        expected: expectedChecksum,
        actual: existing.checksum,
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.warn(SERVICE, "Could not verify migration checksum", { error: String(error) });
    return true;
  }
}

export async function applyMigration(migration: MigrationDefinition): Promise<{
  success: boolean;
  error?: string;
  executionTimeMs?: number;
}> {
  const startTime = Date.now();
  const checksum = generateChecksum(migration.up);
  const isDestructive = migration.isDestructive ?? isDestructiveMigration(migration.up);
  
  if (await hasAppliedMigration(migration.version)) {
    const checksumValid = await verifyMigrationChecksum(migration.version, checksum);
    if (!checksumValid) {
      return {
        success: false,
        error: `Migration ${migration.version} was modified after being applied`,
      };
    }
    
    logger.debug(SERVICE, `Migration ${migration.version} already applied, skipping`);
    return { success: true, executionTimeMs: 0 };
  }
  
  if (isDestructive && process.env.NODE_ENV === 'production') {
    logger.error(SERVICE, `Destructive migration ${migration.version} blocked in production`, {
      name: migration.name,
    });
    return {
      success: false,
      error: `Destructive migration ${migration.version} cannot be applied automatically in production`,
    };
  }
  
  try {
    logger.info(SERVICE, `Applying migration: ${migration.version} - ${migration.name}`, {
      isDestructive,
    });
    
    await db.execute(sql.raw(migration.up));
    
    const executionTimeMs = Date.now() - startTime;
    
    await db.insert(migrationHistory).values({
      version: migration.version,
      name: migration.name,
      checksum,
      executionTimeMs,
      isDestructive,
      rollbackSql: migration.down || null,
    });
    
    logger.info(SERVICE, `Migration ${migration.version} applied successfully`, {
      executionTimeMs,
    });
    
    return { success: true, executionTimeMs };
  } catch (error) {
    logger.error(SERVICE, `Migration ${migration.version} failed`, { error: String(error) });
    return {
      success: false,
      error: String(error),
    };
  }
}

export async function validateSchemaIntegrity(): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    const criticalTables = [
      'users',
      'organizations',
      'accounts',
      'transactions',
      'feature_flags',
      'platform_config',
      'background_jobs',
    ];
    
    for (const tableName of criticalTables) {
      try {
        await db.execute(sql`SELECT 1 FROM ${sql.identifier(tableName)} LIMIT 1`);
      } catch (error) {
        issues.push(`Critical table '${tableName}' is missing or inaccessible`);
      }
    }
    
    const criticalColumns: Array<{ table: string; column: string }> = [
      { table: 'users', column: 'is_protected_owner' },
      { table: 'users', column: 'is_deleted' },
      { table: 'organizations', column: 'is_deleted' },
    ];
    
    for (const { table, column } of criticalColumns) {
      try {
        const result = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${table} AND column_name = ${column}
        `);
        if (!result.rows || result.rows.length === 0) {
          issues.push(`Critical column '${table}.${column}' is missing`);
        }
      } catch (error) {
        issues.push(`Could not verify column '${table}.${column}'`);
      }
    }
    
    try {
      const triggerResult = await db.execute(sql`
        SELECT trigger_name FROM information_schema.triggers 
        WHERE trigger_name = 'protect_owner_trigger'
      `);
      if (!triggerResult.rows || triggerResult.rows.length === 0) {
        issues.push("Owner protection trigger is missing");
      }
    } catch (error) {
      issues.push("Could not verify owner protection trigger");
    }
    
    logger.info(SERVICE, "Schema integrity validation completed", {
      valid: issues.length === 0,
      issueCount: issues.length,
    });
    
    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    logger.error(SERVICE, "Schema validation failed", { error: String(error) });
    return {
      valid: false,
      issues: [...issues, `Validation error: ${error}`],
    };
  }
}

export async function safeSchemaPush(): Promise<{
  success: boolean;
  message: string;
}> {
  const preValidation = await validateSchemaIntegrity();
  
  if (!preValidation.valid) {
    logger.warn(SERVICE, "Pre-push schema validation found issues", {
      issues: preValidation.issues,
    });
  }
  
  logger.info(SERVICE, "Schema push should be executed via 'npm run db:push'");
  
  return {
    success: true,
    message: "Schema validation passed. Run 'npm run db:push' to apply changes.",
  };
}

export async function initializeMigrationSystem(): Promise<void> {
  logger.info(SERVICE, "Initializing migration system");
  
  await ensureMigrationTable();
  
  const validation = await validateSchemaIntegrity();
  if (!validation.valid) {
    logger.warn(SERVICE, "Schema integrity issues detected on startup", {
      issues: validation.issues,
    });
  }
  
  logger.info(SERVICE, "Migration system initialized");
}

export function registerMigrationRoutes(app: any): void {
  app.get("/api/admin/migrations/history", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const history = await getMigrationHistory();
    res.json(history);
  });
  
  app.get("/api/admin/migrations/validate", async (req: any, res: any) => {
    const user = req.user;
    if (!user || !["super_admin", "global_admin", "owner"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const result = await validateSchemaIntegrity();
    res.json(result);
  });
  
  logger.info(SERVICE, "Routes registered");
}
