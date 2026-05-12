import { pgTable, text, serial, timestamp, decimal, integer, boolean, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// === PLATFORM CONFIGURATION (Long-term Survivability) ===
export const platformConfig = pgTable("platform_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  description: text("description"),
  isProtected: boolean("is_protected").default(false), // Cannot be modified via API
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlatformConfigSchema = createInsertSchema(platformConfig).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlatformConfig = z.infer<typeof insertPlatformConfigSchema>;
export type PlatformConfig = typeof platformConfig.$inferSelect;

// === FEATURE FLAGS (Runtime Control) ===
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false),
  rolloutPercentage: integer("rollout_percentage").default(100), // 0-100
  allowedRoles: text("allowed_roles").array(), // Roles that can access
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

// === BACKGROUND JOBS (Persistent Queue) ===
export const backgroundJobs = pgTable("background_jobs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // email, backup, report, cleanup
  payload: jsonb("payload"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed, retrying
  priority: integer("priority").default(0), // Higher = more priority
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  lastError: text("last_error"),
  scheduledAt: timestamp("scheduled_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBackgroundJobSchema = createInsertSchema(backgroundJobs).omit({ id: true, createdAt: true });
export type InsertBackgroundJob = z.infer<typeof insertBackgroundJobSchema>;
export type BackgroundJob = typeof backgroundJobs.$inferSelect;

// === DATABASE BACKUPS (Tracking) ===
export const databaseBackups = pgTable("database_backups", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  size: integer("size"), // bytes
  status: text("status").notNull().default("pending"), // pending, completed, failed, verified
  type: text("type").notNull().default("scheduled"), // scheduled, manual, restore_test
  retentionDays: integer("retention_days").default(30),
  expiresAt: timestamp("expires_at"),
  checksum: text("checksum"), // SHA-256 hash for integrity verification
  tableRowCounts: jsonb("table_row_counts"), // Snapshot of row counts at backup time
  restoreVerifiedAt: timestamp("restore_verified_at"), // When restore was last tested
  restoreVerified: boolean("restore_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === CIRCUIT BREAKER STATE (Persistent across restarts) ===
export const circuitBreakerState = pgTable("circuit_breaker_state", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  state: text("state").notNull().default("CLOSED"), // CLOSED, OPEN, HALF_OPEN
  failureCount: integer("failure_count").default(0),
  successCount: integer("success_count").default(0),
  lastFailureTime: timestamp("last_failure_time"),
  lastSuccessTime: timestamp("last_success_time"),
  halfOpenAttempts: integer("half_open_attempts").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCircuitBreakerStateSchema = createInsertSchema(circuitBreakerState).omit({ id: true, updatedAt: true });
export type InsertCircuitBreakerState = z.infer<typeof insertCircuitBreakerStateSchema>;
export type CircuitBreakerState = typeof circuitBreakerState.$inferSelect;

// === MIGRATION TRACKING (Safety & Idempotency) ===
export const migrationHistory = pgTable("migration_history", {
  id: serial("id").primaryKey(),
  version: text("version").notNull().unique(),
  name: text("name").notNull(),
  checksum: text("checksum").notNull(), // Hash of migration content
  appliedAt: timestamp("applied_at").defaultNow(),
  appliedBy: text("applied_by").default("system"),
  executionTimeMs: integer("execution_time_ms"),
  isDestructive: boolean("is_destructive").default(false), // Flags destructive migrations
  rollbackSql: text("rollback_sql"), // SQL to undo if needed
});

export const insertMigrationHistorySchema = createInsertSchema(migrationHistory).omit({ id: true, appliedAt: true });
export type InsertMigrationHistory = z.infer<typeof insertMigrationHistorySchema>;
export type MigrationHistory = typeof migrationHistory.$inferSelect;

// === JOB IDEMPOTENCY (Deduplication) ===
export const jobIdempotencyKeys = pgTable("job_idempotency_keys", {
  id: serial("id").primaryKey(),
  idempotencyKey: text("idempotency_key").notNull().unique(), // Unique key for deduplication
  jobType: text("job_type").notNull(),
  jobId: integer("job_id"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  result: jsonb("result"), // Cached result for completed jobs
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobIdempotencyKeySchema = createInsertSchema(jobIdempotencyKeys).omit({ id: true, createdAt: true });
export type InsertJobIdempotencyKey = z.infer<typeof insertJobIdempotencyKeySchema>;
export type JobIdempotencyKey = typeof jobIdempotencyKeys.$inferSelect;

// === SYSTEM METRICS (Observability) ===
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 20, scale: 6 }).notNull(),
  labels: jsonb("labels"), // Key-value pairs for metric dimensions
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).omit({ id: true, recordedAt: true });
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;

export const insertDatabaseBackupSchema = createInsertSchema(databaseBackups).omit({ id: true, createdAt: true });
export type InsertDatabaseBackup = z.infer<typeof insertDatabaseBackupSchema>;
export type DatabaseBackup = typeof databaseBackups.$inferSelect;

// === AUTH SESSIONS ===
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// === SUBSCRIPTIONS (Payments) ===
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").notNull().default("free"), // free, starter, professional, enterprise
  status: text("status").notNull().default("active"), // active, canceled, past_due, trialing
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === PERMISSIONS ===
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // super_admin, global_admin, cfo, finance_manager, auditor, analyst
  resource: text("resource").notNull(), // accounts, transactions, invoices, budgets, reports, ai_insights, settings
  action: text("action").notNull(), // create, read, update, delete, approve
  allowed: boolean("allowed").default(true),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true });
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

// === SUBSCRIBERS (Coming Soon) ===
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === USERS & IAM ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("analyst"), // super_admin, global_admin, owner, cfo, finance_manager, auditor, analyst
  organizationId: integer("organization_id"),
  language: text("language").default("en"), // en, ar
  currency: text("currency").default("USD"),
  isActive: boolean("is_active").default(true),
  // === PROTECTION FLAGS (20-year survivability) ===
  isProtectedOwner: boolean("is_protected_owner").default(false), // Cannot be deleted or downgraded
  isDeleted: boolean("is_deleted").default(false), // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: integer("deleted_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === ORGANIZATIONS ===
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // individual, business, enterprise, bank, government
  country: text("country").notNull(),
  currency: text("currency").default("USD"),
  taxId: text("tax_id"),
  industry: text("industry"),
  subscriptionTier: text("subscription_tier").default("business"), // individual, business, enterprise, banking
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"),
  // === SOFT DELETE (20-year survivability) ===
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  deletedBy: integer("deleted_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ACCOUNTS (Chart of Accounts) ===
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  code: text("code").notNull(), // Account code like 1000, 2000, etc
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  type: text("type").notNull(), // asset, liability, equity, revenue, expense
  subtype: text("subtype"), // cash, receivable, payable, etc
  currency: text("currency").default("USD"),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  parentId: integer("parent_id"),
  // === SOFT DELETE ===
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === TRANSACTIONS (Journal Entries) ===
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  type: text("type").notNull(), // invoice, payment, transfer, expense, adjustment
  status: text("status").default("posted"), // draft, pending, posted, voided
  currency: text("currency").default("USD"),
  exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }).default("1"),
  createdBy: integer("created_by"),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === TRANSACTION LINES (Double-entry) ===
export const transactionLines = pgTable("transaction_lines", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  accountId: integer("account_id").notNull(),
  debit: decimal("debit", { precision: 18, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 18, scale: 2 }).default("0"),
  memo: text("memo"),
});

// === BUDGETS ===
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  fiscalYear: integer("fiscal_year").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active"), // draft, active, closed
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0"),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BUDGET ITEMS ===
export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  accountId: integer("account_id").notNull(),
  month: integer("month").notNull(), // 1-12
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0"),
  actualAmount: decimal("actual_amount", { precision: 18, scale: 2 }).default("0"),
});

// === INVOICES ===
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  type: text("type").notNull(), // receivable, payable
  status: text("status").default("draft"), // draft, sent, paid, overdue, cancelled
  customerId: integer("customer_id"),
  vendorId: integer("vendor_id"),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 18, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 18, scale: 2 }).default("0"),
  total: decimal("total", { precision: 18, scale: 2 }).default("0"),
  amountPaid: decimal("amount_paid", { precision: 18, scale: 2 }).default("0"),
  currency: text("currency").default("USD"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === CONTACTS (Customers/Vendors) ===
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  type: text("type").notNull(), // customer, vendor, both
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  country: text("country"),
  taxId: text("tax_id"),
  currency: text("currency").default("USD"),
  creditLimit: decimal("credit_limit", { precision: 18, scale: 2 }),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === CASH FLOW ===
export const cashFlows = pgTable("cash_flows", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // operating, investing, financing
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  description: text("description"),
  isProjected: boolean("is_projected").default(false),
  transactionId: integer("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AI INSIGHTS ===
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  type: text("type").notNull(), // forecast, anomaly, recommendation, risk, opportunity
  severity: text("severity").default("info"), // info, warning, critical, success
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === COMPLIANCE ===
export const complianceItems = pgTable("compliance_items", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(), // tax, regulatory, audit, legal, internal
  priority: text("priority").default("medium"), // low, medium, high, critical
  status: text("status").default("pending"), // pending, in_progress, completed, overdue
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  assignedTo: integer("assigned_to"),
  attachments: jsonb("attachments"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === PERIOD CLOSING ===
export const periodClosings = pgTable("period_closings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  period: text("period").notNull(), // Format: YYYY-MM (e.g., "2025-01")
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  status: text("status").notNull().default("open"), // open, closing, closed
  closedBy: integer("closed_by"),
  closedAt: timestamp("closed_at"),
  retainedEarnings: decimal("retained_earnings", { precision: 18, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AUDIT LOG ===
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceItemSchema = createInsertSchema(complianceItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCashFlowSchema = createInsertSchema(cashFlows).omit({
  id: true,
  createdAt: true,
});

export const insertPeriodClosingSchema = createInsertSchema(periodClosings).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// === TYPES ===
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionLine = typeof transactionLines.$inferSelect;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type BudgetItem = typeof budgetItems.$inferSelect;

export type CashFlow = typeof cashFlows.$inferSelect;

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;

export type ComplianceItem = typeof complianceItems.$inferSelect;
export type InsertComplianceItem = z.infer<typeof insertComplianceItemSchema>;

export type InsertCashFlow = z.infer<typeof insertCashFlowSchema>;

export type PeriodClosing = typeof periodClosings.$inferSelect;
export type InsertPeriodClosing = z.infer<typeof insertPeriodClosingSchema>;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// === PAYMENT GATEWAYS (Dynamic Multi-Provider) ===
export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Display name
  nameAr: text("name_ar"), // Arabic name
  provider: text("provider").notNull(), // stripe, paypal, paymob, fawry, tap, payfort, hyperpay, moyasar, etc
  region: text("region").notNull(), // global, egypt, gulf, mena, europe, usa
  isEnabled: boolean("is_enabled").default(false),
  isDefault: boolean("is_default").default(false),
  supportedCurrencies: text("supported_currencies").array(), // ["USD", "EUR", "EGP", "SAR", "AED"]
  supportedCountries: text("supported_countries").array(), // ["US", "EG", "SA", "AE"]
  // Configuration (non-sensitive)
  webhookUrl: text("webhook_url"),
  successUrl: text("success_url"),
  cancelUrl: text("cancel_url"),
  // Environment variable names for secrets (not actual values)
  secretKeyEnvVar: text("secret_key_env_var"), // e.g., "STRIPE_SECRET_KEY"
  publicKeyEnvVar: text("public_key_env_var"), // e.g., "STRIPE_PUBLISHABLE_KEY"
  webhookSecretEnvVar: text("webhook_secret_env_var"),
  // Additional config as JSON
  config: jsonb("config"), // { merchantId, integrationId, iframeId, etc }
  // Metadata
  logoUrl: text("logo_url"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type PaymentGateway = typeof paymentGateways.$inferSelect;

// === PAYMENT TRANSACTIONS (Track all payments) ===
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id").notNull(),
  gatewayId: integer("gateway_id").notNull(),
  externalId: text("external_id"), // Gateway's transaction ID
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  type: text("type").notNull(), // subscription, one_time, refund
  plan: text("plan"), // For subscription payments
  metadata: jsonb("metadata"), // Additional gateway-specific data
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({ id: true, createdAt: true });
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// === AI CONVERSATIONS ===
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// === API CONTRACT TYPES ===
export type CreateSubscriberRequest = InsertSubscriber;
export type SubscriberResponse = Subscriber;
