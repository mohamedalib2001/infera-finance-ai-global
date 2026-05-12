import { db } from "./db";
import { users, organizations, platformConfig, featureFlags } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import logger from "./logger";

const SERVICE = "Bootstrap";

const PLATFORM_INITIALIZED_KEY = "platform_initialized";
const OWNER_CREATED_KEY = "owner_account_created";

export interface BootstrapConfig {
  ownerEmail: string;
  ownerPassword: string;
  ownerFirstName: string;
  ownerLastName: string;
  platformName: string;
  defaultOrganizationName: string;
}

function getBootstrapConfig(): BootstrapConfig {
  return {
    ownerEmail: process.env.PLATFORM_OWNER_EMAIL || "owner@infera.ai",
    ownerPassword: process.env.PLATFORM_OWNER_PASSWORD || "InferaOwner2024!",
    ownerFirstName: process.env.PLATFORM_OWNER_FIRST_NAME || "Platform",
    ownerLastName: process.env.PLATFORM_OWNER_LAST_NAME || "Owner",
    platformName: process.env.PLATFORM_NAME || "INFERA Finance AI GlobalCloud",
    defaultOrganizationName: process.env.DEFAULT_ORG_NAME || "INFERA Platform Organization",
  };
}

async function getConfigValue(key: string): Promise<any> {
  const [config] = await db.select().from(platformConfig).where(eq(platformConfig.key, key));
  return config?.value;
}

async function setConfigValue(key: string, value: any, description: string, isProtected = false): Promise<void> {
  const existing = await getConfigValue(key);
  if (existing !== undefined) {
    await db.update(platformConfig)
      .set({ value, updatedAt: new Date() })
      .where(eq(platformConfig.key, key));
  } else {
    await db.insert(platformConfig).values({
      key,
      value,
      description,
      isProtected,
    });
  }
}

export async function bootstrapPlatform(): Promise<void> {
  const config = getBootstrapConfig();
  const isProduction = process.env.NODE_ENV === "production";
  
  logger.info(SERVICE, "Starting platform bootstrap", { env: isProduction ? 'production' : 'development' });

  try {
    await createOwnerProtectionTrigger();
    
    const platformInitialized = await getConfigValue(PLATFORM_INITIALIZED_KEY);
    
    if (platformInitialized) {
      logger.info(SERVICE, "Platform already initialized. Skipping bootstrap.");
      await ensureOwnerExists(config);
      return;
    }

    await createProtectedOwner(config);

    await createDefaultOrganization(config);

    await initializeFeatureFlags();

    await setConfigValue(PLATFORM_INITIALIZED_KEY, {
      initialized: true,
      initializedAt: new Date().toISOString(),
      version: "1.0.0",
    }, "Platform initialization status", true);

    logger.info(SERVICE, "Platform bootstrap completed successfully.");
  } catch (error) {
    logger.error(SERVICE, "Error during platform bootstrap", error);
    throw error;
  }
}

async function createOwnerProtectionTrigger(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION protect_owner_account()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.is_protected_owner = TRUE THEN
          IF NEW.is_deleted = TRUE THEN
            RAISE EXCEPTION 'Cannot delete protected owner account';
          END IF;
          IF NEW.is_active = FALSE THEN
            RAISE EXCEPTION 'Cannot deactivate protected owner account';
          END IF;
          IF NEW.role <> 'super_admin' THEN
            RAISE EXCEPTION 'Cannot downgrade protected owner from super_admin';
          END IF;
          IF NEW.is_protected_owner = FALSE THEN
            RAISE EXCEPTION 'Cannot remove protected owner status';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'protect_owner_trigger'
        ) THEN
          CREATE TRIGGER protect_owner_trigger
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION protect_owner_account();
        END IF;
      END
      $$;
    `);
    
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION prevent_owner_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.is_protected_owner = TRUE THEN
          RAISE EXCEPTION 'Cannot delete protected owner account';
        END IF;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_owner_delete_trigger'
        ) THEN
          CREATE TRIGGER prevent_owner_delete_trigger
          BEFORE DELETE ON users
          FOR EACH ROW
          EXECUTE FUNCTION prevent_owner_delete();
        END IF;
      END
      $$;
    `);
    
    logger.info(SERVICE, "Owner protection triggers created/verified");
  } catch (error) {
    logger.warn(SERVICE, "Could not create owner protection triggers (may already exist)", { error: String(error) });
  }
}

async function ensureOwnerExists(config: BootstrapConfig): Promise<void> {
  const [existingOwner] = await db.select()
    .from(users)
    .where(and(
      eq(users.isProtectedOwner, true),
      eq(users.isDeleted, false)
    ));

  if (!existingOwner) {
    logger.info(SERVICE, "Protected owner not found. Creating...");
    await createProtectedOwner(config);
  } else {
    logger.info(SERVICE, "Protected owner exists", { email: existingOwner.email });
  }
}

async function createProtectedOwner(config: BootstrapConfig): Promise<void> {
  const ownerCreated = await getConfigValue(OWNER_CREATED_KEY);
  
  if (ownerCreated) {
    logger.info(SERVICE, "Owner already created. Checking if exists...");
    return;
  }

  const [existingOwner] = await db.select()
    .from(users)
    .where(eq(users.email, config.ownerEmail));

  if (existingOwner) {
    if (!existingOwner.isProtectedOwner) {
      await db.update(users)
        .set({ 
          isProtectedOwner: true, 
          role: "super_admin",
          updatedAt: new Date()
        })
        .where(eq(users.id, existingOwner.id));
      logger.info(SERVICE, "Existing user upgraded to protected owner", { email: config.ownerEmail });
    } else {
      logger.info(SERVICE, "Owner already exists and is protected", { email: config.ownerEmail });
    }
  } else {
    const hashedPassword = await bcrypt.hash(config.ownerPassword, 12);
    
    await db.insert(users).values({
      email: config.ownerEmail,
      password: hashedPassword,
      firstName: config.ownerFirstName,
      lastName: config.ownerLastName,
      role: "super_admin",
      isActive: true,
      isProtectedOwner: true,
      isDeleted: false,
      language: "en",
      currency: "USD",
    });

    logger.info(SERVICE, "Created protected owner", { email: config.ownerEmail });
  }

  await setConfigValue(OWNER_CREATED_KEY, {
    created: true,
    email: config.ownerEmail,
    createdAt: new Date().toISOString(),
  }, "Protected owner account creation status", true);
}

async function createDefaultOrganization(config: BootstrapConfig): Promise<void> {
  const [existingOrg] = await db.select()
    .from(organizations)
    .where(and(
      eq(organizations.name, config.defaultOrganizationName),
      eq(organizations.isDeleted, false)
    ));

  if (existingOrg) {
    logger.info(SERVICE, "Default organization already exists", { org: config.defaultOrganizationName });
    return;
  }

  await db.insert(organizations).values({
    name: config.defaultOrganizationName,
    type: "enterprise",
    country: "Global",
    currency: "USD",
    industry: "Financial Technology",
    subscriptionTier: "enterprise",
    isActive: true,
    isDeleted: false,
  });

  logger.info(SERVICE, "Created default organization", { org: config.defaultOrganizationName });
}

async function initializeFeatureFlags(): Promise<void> {
  const defaultFlags = [
    { key: "demo_mode", name: "Demo Mode", nameAr: "وضع العرض", description: "Enable demo data seeding (DISABLE in production)", isEnabled: false },
    { key: "ai_insights", name: "AI Insights", nameAr: "رؤى الذكاء الاصطناعي", description: "Enable AI-powered financial insights", isEnabled: true },
    { key: "multi_currency", name: "Multi-Currency", nameAr: "العملات المتعددة", description: "Enable multi-currency support", isEnabled: true },
    { key: "api_access", name: "API Access", nameAr: "الوصول لـ API", description: "Enable external API access", isEnabled: true },
    { key: "email_notifications", name: "Email Notifications", nameAr: "إشعارات البريد", description: "Enable email notifications", isEnabled: true },
    { key: "audit_logging", name: "Audit Logging", nameAr: "تسجيل التدقيق", description: "Enable comprehensive audit logging", isEnabled: true },
    { key: "auto_backup", name: "Auto Backup", nameAr: "النسخ الاحتياطي التلقائي", description: "Enable automatic database backups", isEnabled: true },
  ];

  for (const flag of defaultFlags) {
    const [existing] = await db.select().from(featureFlags).where(eq(featureFlags.key, flag.key));
    
    if (!existing) {
      await db.insert(featureFlags).values({
        key: flag.key,
        name: flag.name,
        nameAr: flag.nameAr,
        description: flag.description,
        isEnabled: flag.isEnabled,
        rolloutPercentage: 100,
      });
      logger.info(SERVICE, "Created feature flag", { flag: flag.key });
    }
  }
}

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
  return flag?.isEnabled ?? false;
}

export async function isDemoModeEnabled(): Promise<boolean> {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return await isFeatureEnabled("demo_mode");
}

export function isOwnerProtected(user: any): boolean {
  return user?.isProtectedOwner === true;
}

export function canDeleteUser(targetUser: any, requestingUser: any): { allowed: boolean; reason?: string } {
  if (targetUser.isProtectedOwner) {
    return { allowed: false, reason: "Cannot delete protected owner account" };
  }
  
  if (targetUser.id === requestingUser?.id) {
    return { allowed: false, reason: "Cannot delete your own account" };
  }
  
  return { allowed: true };
}

export function canModifyUserRole(targetUser: any, newRole: string): { allowed: boolean; reason?: string } {
  if (targetUser.isProtectedOwner && newRole !== "super_admin") {
    return { allowed: false, reason: "Cannot downgrade protected owner from super_admin" };
  }
  
  return { allowed: true };
}
