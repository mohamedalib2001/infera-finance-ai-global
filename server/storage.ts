import { db } from "./db";
import {
  subscribers,
  users,
  organizations,
  accounts,
  transactions,
  transactionLines,
  invoices,
  contacts,
  budgets,
  budgetItems,
  cashFlows,
  aiInsights,
  auditLogs,
  complianceItems,
  periodClosings,
  subscriptions,
  type InsertSubscriber,
  type Subscriber,
  type InsertUser,
  type User,
  type InsertOrganization,
  type Organization,
  type InsertAccount,
  type Account,
  type InsertTransaction,
  type Transaction,
  type TransactionLine,
  type InsertInvoice,
  type Invoice,
  type InsertContact,
  type Contact,
  type InsertBudget,
  type Budget,
  type BudgetItem,
  type CashFlow,
  type InsertAiInsight,
  type AiInsight,
  type AuditLog,
  type ComplianceItem,
  type InsertComplianceItem,
  type PeriodClosing,
  type InsertPeriodClosing,
  type Subscription,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: number): Promise<Organization | undefined>;
  updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization | undefined>;
  
  createUser(user: InsertUser): Promise<User>;
  getUsers(orgId?: number): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<{ user?: User; error?: string }>;
  softDeleteUser(id: number): Promise<{ success: boolean; error?: string }>;
  
  createAccount(account: InsertAccount): Promise<Account>;
  getAccounts(orgId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  updateAccount(id: number, data: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getTransactions(orgId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  
  createTransactionLine(line: { transactionId: number; accountId: number; debit?: string; credit?: string; memo?: string }): Promise<TransactionLine>;
  getTransactionLines(txId: number): Promise<TransactionLine[]>;
  
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoices(orgId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(orgId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(orgId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  
  getCashFlows(orgId: number): Promise<CashFlow[]>;
  createCashFlow(data: { organizationId: number; date: Date; type: string; category: string; amount: string; currency?: string; description?: string; isProjected?: boolean; transactionId?: number }): Promise<CashFlow>;
  
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  getAiInsights(orgId: number): Promise<AiInsight[]>;
  markInsightRead(id: number): Promise<AiInsight | undefined>;
  
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  
  getComplianceItems(orgId: number): Promise<ComplianceItem[]>;
  getComplianceItem(id: number): Promise<ComplianceItem | undefined>;
  createComplianceItem(data: InsertComplianceItem): Promise<ComplianceItem>;
  updateComplianceItem(id: number, data: Partial<InsertComplianceItem>): Promise<ComplianceItem | undefined>;
  deleteComplianceItem(id: number): Promise<boolean>;
  
  updateBudget(id: number, data: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  
  deleteCashFlow(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers).values(data).returning();
    return subscriber;
  }

  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(data).returning();
    return org;
  }

  async getOrganizations(): Promise<Organization[]> {
    return db.select().from(organizations).where(eq(organizations.isActive, true));
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const [org] = await db.update(organizations).set(data).where(eq(organizations.id, id)).returning();
    return org;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUsers(orgId?: number): Promise<User[]> {
    if (orgId) {
      return db.select().from(users).where(eq(users.organizationId, orgId));
    }
    return db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<{ user?: User; error?: string }> {
    const [existingUser] = await db.select().from(users).where(eq(users.id, id));
    if (!existingUser) {
      return { error: "User not found" };
    }
    if (existingUser.isProtectedOwner) {
      if (data.role && data.role !== "super_admin") {
        return { error: "Cannot downgrade protected owner from super_admin" };
      }
      if (data.isDeleted === true) {
        return { error: "Cannot delete protected owner account" };
      }
      if (data.isActive === false) {
        return { error: "Cannot deactivate protected owner account" };
      }
    }
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return { user };
  }

  async softDeleteUser(id: number): Promise<{ success: boolean; error?: string }> {
    const [existingUser] = await db.select().from(users).where(eq(users.id, id));
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }
    if (existingUser.isProtectedOwner) {
      return { success: false, error: "Cannot delete protected owner account" };
    }
    await db.update(users).set({ isDeleted: true, isActive: false, updatedAt: new Date() }).where(eq(users.id, id));
    return { success: true };
  }

  async createAccount(data: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(data).returning();
    return account;
  }

  async getAccounts(orgId: number): Promise<Account[]> {
    return db.select().from(accounts).where(eq(accounts.organizationId, orgId));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async updateAccount(id: number, data: Partial<InsertAccount>): Promise<Account | undefined> {
    const [account] = await db.update(accounts).set(data).where(eq(accounts.id, id)).returning();
    return account;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return true;
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  }

  async getTransactions(orgId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.organizationId, orgId)).orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx;
  }

  async createTransactionLine(data: { transactionId: number; accountId: number; debit?: string; credit?: string; memo?: string }): Promise<TransactionLine> {
    const [line] = await db.insert(transactionLines).values(data).returning();
    return line;
  }

  async getTransactionLines(txId: number): Promise<TransactionLine[]> {
    return db.select().from(transactionLines).where(eq(transactionLines.transactionId, txId));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async getInvoices(orgId: number): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.organizationId, orgId)).orderBy(desc(invoices.issueDate));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(data).returning();
    return contact;
  }

  async getContacts(orgId: number): Promise<Contact[]> {
    return db.select().from(contacts).where(eq(contacts.organizationId, orgId));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createBudget(data: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(data).returning();
    return budget;
  }

  async getBudgets(orgId: number): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.organizationId, orgId));
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async getCashFlows(orgId: number): Promise<CashFlow[]> {
    return db.select().from(cashFlows).where(eq(cashFlows.organizationId, orgId)).orderBy(desc(cashFlows.date));
  }

  async createCashFlow(data: { organizationId: number; date: Date; type: string; category: string; amount: string; currency?: string; description?: string; isProjected?: boolean; transactionId?: number }): Promise<CashFlow> {
    const [cf] = await db.insert(cashFlows).values(data).returning();
    return cf;
  }

  async createAiInsight(data: InsertAiInsight): Promise<AiInsight> {
    const [insight] = await db.insert(aiInsights).values(data).returning();
    return insight;
  }

  async getAiInsights(orgId: number): Promise<AiInsight[]> {
    return db.select().from(aiInsights).where(eq(aiInsights.organizationId, orgId)).orderBy(desc(aiInsights.createdAt));
  }

  async markInsightRead(id: number): Promise<AiInsight | undefined> {
    const [insight] = await db.update(aiInsights).set({ isRead: true }).where(eq(aiInsights.id, id)).returning();
    return insight;
  }

  async createAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }
  
  async getComplianceItems(orgId: number): Promise<ComplianceItem[]> {
    return db.select().from(complianceItems).where(eq(complianceItems.organizationId, orgId)).orderBy(desc(complianceItems.createdAt));
  }
  
  async getComplianceItem(id: number): Promise<ComplianceItem | undefined> {
    const [item] = await db.select().from(complianceItems).where(eq(complianceItems.id, id));
    return item;
  }
  
  async createComplianceItem(data: InsertComplianceItem): Promise<ComplianceItem> {
    const [item] = await db.insert(complianceItems).values(data).returning();
    return item;
  }
  
  async updateComplianceItem(id: number, data: Partial<InsertComplianceItem>): Promise<ComplianceItem | undefined> {
    const [item] = await db.update(complianceItems).set({ ...data, updatedAt: new Date() }).where(eq(complianceItems.id, id)).returning();
    return item;
  }
  
  async deleteComplianceItem(id: number): Promise<boolean> {
    await db.delete(complianceItems).where(eq(complianceItems.id, id));
    return true;
  }
  
  async updateBudget(id: number, data: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [budget] = await db.update(budgets).set(data).where(eq(budgets.id, id)).returning();
    return budget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    await db.delete(budgets).where(eq(budgets.id, id));
    return true;
  }
  
  async deleteCashFlow(id: number): Promise<boolean> {
    await db.delete(cashFlows).where(eq(cashFlows.id, id));
    return true;
  }

  // Period Closing
  async getPeriodClosings(orgId: number): Promise<PeriodClosing[]> {
    return db.select().from(periodClosings).where(eq(periodClosings.organizationId, orgId)).orderBy(desc(periodClosings.year), desc(periodClosings.month));
  }

  async getPeriodClosing(orgId: number, year: number, month: number): Promise<PeriodClosing | undefined> {
    const [closing] = await db.select().from(periodClosings).where(
      and(
        eq(periodClosings.organizationId, orgId),
        eq(periodClosings.year, year),
        eq(periodClosings.month, month)
      )
    );
    return closing;
  }

  async createPeriodClosing(data: InsertPeriodClosing): Promise<PeriodClosing> {
    const [closing] = await db.insert(periodClosings).values(data).returning();
    return closing;
  }

  async updatePeriodClosing(id: number, data: Partial<InsertPeriodClosing>): Promise<PeriodClosing | undefined> {
    const [closing] = await db.update(periodClosings).set(data).where(eq(periodClosings.id, id)).returning();
    return closing;
  }

  // Subscriptions
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub;
  }

  async getSubscriptionByOrg(orgId: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, orgId));
    return sub;
  }

  async createSubscription(data: { userId: number; organizationId: number; plan?: string; stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<Subscription> {
    const [sub] = await db.insert(subscriptions).values(data).returning();
    return sub;
  }

  async updateSubscription(id: number, data: Partial<{ plan: string; status: string; stripeSubscriptionId: string; currentPeriodStart: Date; currentPeriodEnd: Date }>): Promise<Subscription | undefined> {
    const [sub] = await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.id, id)).returning();
    return sub;
  }

  // Audit Logs
  async getAuditLogs(orgId: number, limit = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs).where(eq(auditLogs.organizationId, orgId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
