import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { requirePermission, requireAuth } from "./rbacMiddleware";
import { sendWelcomeEmail, sendPasswordResetEmail, sendInvoiceNotification, sendAIAlertEmail, sendWeeklyReportEmail, sendEmail } from "./emailService";
import { bootstrapPlatform, isDemoModeEnabled, canDeleteUser, canModifyUserRole, isOwnerProtected } from "./bootstrapService";
import { registerHealthRoutes } from "./healthService";
import { registerBackupRoutes } from "./backupService";
import { registerResilienceRoutes } from "./resilience";
import { registerJobWorkerRoutes, startJobWorker } from "./jobWorker";
import { registerMigrationRoutes, initializeMigrationSystem } from "./migrationService";
import logger from "./logger";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === HEALTH CHECK ENDPOINTS (Must be first, no auth required) ===
  registerHealthRoutes(app);
  
  // === PLATFORM BOOTSTRAP (Protected owner & feature flags) ===
  await bootstrapPlatform();
  
  // === BACKUP MANAGEMENT ROUTES ===
  await registerBackupRoutes(app);
  
  // === RESILIENCE ROUTES (Circuit Breakers) ===
  registerResilienceRoutes(app);
  
  // === BACKGROUND JOB WORKER ===
  registerJobWorkerRoutes(app);
  startJobWorker();
  
  // === MIGRATION SAFETY SYSTEM ===
  registerMigrationRoutes(app);
  await initializeMigrationSystem();
  
  // Setup authentication (MUST be before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // === EMAIL/PASSWORD AUTH ===
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const existingUsers = await db.select().from(users).where(eq(users.email, email));
      if (existingUsers.length > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "analyst",
      }).returning();

      // Send welcome email
      const lang = req.body.lang === 'ar' ? 'ar' : 'en';
      sendWelcomeEmail(email, `${firstName} ${lastName}`, lang).catch(err => {
        logger.warn("auth", "Welcome email failed", { email, error: String(err) });
      });

      res.status(201).json({ message: "Account created successfully", userId: newUser.id });
    } catch (error) {
      logger.error("auth", "Registration error", { error: String(error), email: req.body?.email });
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("auth", "Login error", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email, lang } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (user) {
        const resetToken = crypto.randomUUID();
        sendPasswordResetEmail(email, resetToken, lang === 'ar' ? 'ar' : 'en').catch(err => {
          logger.warn("auth", "Password reset email failed", { email, error: String(err) });
        });
      }

      res.json({ message: "If the email exists, a reset link will be sent" });
    } catch (error) {
      logger.error("auth", "Forgot password error", error);
      res.status(500).json({ message: "Request failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(user);
  });
  
  // === SUBSCRIBERS ===
  app.post(api.subscribers.create.path, async (req, res) => {
    try {
      const input = api.subscribers.create.input.parse(req.body);
      const existing = await storage.getSubscriberByEmail(input.email);
      if (existing) {
        return res.status(409).json({ message: "Email already subscribed" });
      }
      const subscriber = await storage.createSubscriber(input);
      res.status(201).json(subscriber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === ORGANIZATIONS ===
  app.get(api.organizations.list.path, async (req, res) => {
    const orgs = await storage.getOrganizations();
    res.json(orgs);
  });

  app.get(api.organizations.get.path, async (req, res) => {
    const org = await storage.getOrganization(Number(req.params.id));
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json(org);
  });

  app.post(api.organizations.create.path, async (req, res) => {
    try {
      const input = api.organizations.create.input.parse(req.body);
      const org = await storage.createOrganization(input);
      res.status(201).json(org);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.organizations.create.input.partial().parse(req.body);
      const org = await storage.updateOrganization(id, input);
      if (!org) return res.status(404).json({ message: "Organization not found" });
      res.json(org);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === ACCOUNTS ===
  app.get(api.accounts.list.path, async (req, res) => {
    const accounts = await storage.getAccounts(Number(req.params.orgId));
    res.json(accounts);
  });

  app.get(api.accounts.get.path, async (req, res) => {
    const account = await storage.getAccount(Number(req.params.id));
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  });

  app.post(api.accounts.list.path, async (req, res) => {
    try {
      const input = api.accounts.create.input.parse(req.body);
      const account = await storage.createAccount({
        ...input,
        organizationId: Number(req.params.orgId),
      });
      res.status(201).json(account);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.accounts.update.path, async (req, res) => {
    try {
      const input = api.accounts.update.input.parse(req.body);
      const account = await storage.updateAccount(Number(req.params.id), input);
      if (!account) return res.status(404).json({ message: "Account not found" });
      res.json(account);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.accounts.delete.path, async (req, res) => {
    await storage.deleteAccount(Number(req.params.id));
    res.status(204).send();
  });

  // === TRANSACTIONS ===
  app.get(api.transactions.list.path, async (req, res) => {
    const txs = await storage.getTransactions(Number(req.params.orgId));
    res.json(txs);
  });

  app.get(api.transactions.get.path, async (req, res) => {
    const tx = await storage.getTransaction(Number(req.params.id));
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    const lines = await storage.getTransactionLines(tx.id);
    res.json({ ...tx, lines });
  });

  app.post(api.transactions.list.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const { lines, ...txData } = input;
      const tx = await storage.createTransaction({
        ...txData,
        organizationId: Number(req.params.orgId),
      });
      for (const line of lines) {
        await storage.createTransactionLine({
          transactionId: tx.id,
          ...line,
        });
      }
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === INVOICES ===
  app.get(api.invoices.list.path, async (req, res) => {
    const invoices = await storage.getInvoices(Number(req.params.orgId));
    res.json(invoices);
  });

  app.get(api.invoices.get.path, async (req, res) => {
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  });

  app.post(api.invoices.list.path, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice({
        ...input,
        organizationId: Number(req.params.orgId),
      });
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.invoices.update.path, async (req, res) => {
    try {
      const input = api.invoices.update.input.parse(req.body);
      const invoice = await storage.updateInvoice(Number(req.params.id), input);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === CONTACTS ===
  app.get(api.contacts.list.path, async (req, res) => {
    const contacts = await storage.getContacts(Number(req.params.orgId));
    res.json(contacts);
  });

  app.get(api.contacts.get.path, async (req, res) => {
    const contact = await storage.getContact(Number(req.params.id));
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  });

  app.post(api.contacts.list.path, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact({
        ...input,
        organizationId: Number(req.params.orgId),
      });
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === BUDGETS ===
  app.get(api.budgets.list.path, async (req, res) => {
    const budgets = await storage.getBudgets(Number(req.params.orgId));
    res.json(budgets);
  });

  app.get(api.budgets.get.path, async (req, res) => {
    const budget = await storage.getBudget(Number(req.params.id));
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  });

  app.post(api.budgets.list.path, async (req, res) => {
    try {
      const input = api.budgets.create.input.parse(req.body);
      const budget = await storage.createBudget({
        ...input,
        organizationId: Number(req.params.orgId),
      });
      res.status(201).json(budget);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === BUDGETS CRUD ===
  app.patch("/api/budgets/:id", requirePermission('budgets', 'update'), async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        status: z.enum(['draft', 'active', 'closed']).optional(),
        totalAmount: z.string().optional(),
      });
      const validated = updateSchema.parse(req.body);
      const budget = await storage.updateBudget(Number(req.params.id), validated);
      if (!budget) return res.status(404).json({ message: "Budget not found" });
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      logger.error("budget", "Update budget error", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", requirePermission('budgets', 'delete'), async (req, res) => {
    await storage.deleteBudget(Number(req.params.id));
    res.status(204).send();
  });

  // === CASH FLOWS ===
  app.get(api.cashFlows.list.path, async (req, res) => {
    const cashFlows = await storage.getCashFlows(Number(req.params.orgId));
    res.json(cashFlows);
  });

  app.post("/api/organizations/:orgId/cash-flows", requirePermission('cash_flow', 'create'), async (req, res) => {
    try {
      const createSchema = z.object({
        date: z.string(),
        type: z.enum(['operating', 'investing', 'financing']),
        category: z.string(),
        amount: z.string(),
        currency: z.string().optional(),
        description: z.string().optional(),
        isProjected: z.boolean().optional(),
      });
      const validated = createSchema.parse(req.body);
      const cf = await storage.createCashFlow({
        ...validated,
        organizationId: Number(req.params.orgId),
        date: new Date(validated.date),
      });
      res.status(201).json(cf);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      logger.error("cashflow", "Create cash flow error", error);
      res.status(500).json({ message: "Failed to create cash flow" });
    }
  });

  app.delete("/api/cash-flows/:id", requirePermission('cash_flow', 'delete'), async (req, res) => {
    await storage.deleteCashFlow(Number(req.params.id));
    res.status(204).send();
  });

  // === AI INSIGHTS ===
  app.get(api.aiInsights.list.path, async (req, res) => {
    try {
      const { generateAIInsights } = await import("./aiService");
      const orgId = Number(req.params.orgId);
      const insights = await generateAIInsights(orgId);
      res.json(insights);
    } catch (error) {
      logger.error("ai", "AI insights error", error);
      const fallback = await storage.getAiInsights(Number(req.params.orgId));
      res.json(fallback);
    }
  });

  app.get("/api/organizations/:orgId/ai-metrics", async (req, res) => {
    try {
      const { getFinancialMetrics } = await import("./aiService");
      const metrics = await getFinancialMetrics(Number(req.params.orgId));
      res.json(metrics);
    } catch (error) {
      logger.error("ai", "AI metrics error", error);
      res.status(500).json({ message: "Failed to generate metrics" });
    }
  });

  app.patch(api.aiInsights.markRead.path, async (req, res) => {
    const insight = await storage.markInsightRead(Number(req.params.id));
    if (!insight) return res.status(404).json({ message: "Insight not found" });
    res.json(insight);
  });

  // AI Query endpoint for dashboard - Real conversational AI with navigation
  app.post("/api/ai/query", async (req, res) => {
    try {
      const querySchema = z.object({
        query: z.string().min(1),
        organizationId: z.number().optional(),
        language: z.enum(['en', 'ar']).default('en'),
      });
      const validated = querySchema.parse(req.body);
      
      // Check for AI action intents (navigation, print, etc.)
      const { detectAIAction } = await import("@shared/routeMap");
      const aiAction = detectAIAction(validated.query, validated.language);
      
      // Get financial context for the AI
      const { generateAIInsights, getFinancialMetrics } = await import("./aiService");
      
      let financialContext = "";
      let metrics: any = null;
      let insights: any[] = [];
      
      if (validated.organizationId) {
        try {
          insights = await generateAIInsights(validated.organizationId);
          metrics = await getFinancialMetrics(validated.organizationId);
          
          financialContext = `
Current Financial Data:
- Total Assets: $${metrics.totalAssets?.toLocaleString() || 0}
- Total Liabilities: $${metrics.totalLiabilities?.toLocaleString() || 0}
- Net Worth: $${metrics.netWorth?.toLocaleString() || 0}
- Current Ratio: ${metrics.currentRatio?.toFixed(2) || 'N/A'}
- Debt Ratio: ${metrics.debtRatio?.toFixed(2) || 'N/A'}%
- Total Revenue: $${metrics.totalRevenue?.toLocaleString() || 0}
- Total Expenses: $${metrics.totalExpenses?.toLocaleString() || 0}
- Net Profit: $${metrics.netProfit?.toLocaleString() || 0}
- Active Insights: ${insights.length}
`;
        } catch (e) {
          financialContext = "No financial data available for this organization.";
        }
      }
      
      // Use OpenAI for real conversational AI
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      
      const systemPrompt = validated.language === 'ar' 
        ? `أنت مساعد مالي ذكي لمنصة INFERA Finance AI GlobalCloud. 
أنت خبير في المحاسبة والتحليل المالي وإدارة الأعمال.
أجب بالعربية فقط. كن موجزاً ومفيداً.
${financialContext ? `البيانات المالية الحالية:\n${financialContext}` : ''}`
        : `You are an intelligent financial assistant for INFERA Finance AI GlobalCloud platform.
You are an expert in accounting, financial analysis, and business management.
Respond in English. Be concise and helpful.
${financialContext ? `Current Financial Data:\n${financialContext}` : ''}`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: validated.query }
        ],
        max_tokens: 1000,
      });
      
      let aiResponse = completion.choices[0]?.message?.content || 
        (validated.language === 'ar' ? 'عذراً، لم أتمكن من معالجة طلبك.' : 'Sorry, I could not process your request.');
      
      // If an action was detected, customize the response
      if (aiAction) {
        if (aiAction.type === 'navigate') {
          const navMessage = validated.language === 'ar' 
            ? `سأنقلك الآن إلى صفحة ${aiAction.nameAr}...`
            : `Taking you to ${aiAction.nameEn}...`;
          aiResponse = navMessage;
        } else if (aiAction.type === 'print') {
          const printMessage = validated.language === 'ar'
            ? `جاري تحضير ${aiAction.reportNameAr} للطباعة...`
            : `Preparing ${aiAction.reportNameEn} for printing...`;
          aiResponse = printMessage;
        }
      }
      
      res.json({ 
        response: aiResponse, 
        message: aiResponse,
        insights,
        metrics,
        action: aiAction,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      logger.error("ai", "AI query error", error);
      
      // Fallback to basic response if OpenAI fails
      const fallbackResponse = req.body?.language === 'ar' 
        ? 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً.'
        : 'Sorry, AI service is currently unavailable. Please try again later.';
      res.status(500).json({ message: fallbackResponse, response: fallbackResponse });
    }
  });

  // === COMPLIANCE ===
  app.get("/api/organizations/:orgId/compliance", requirePermission('compliance', 'read'), async (req, res) => {
    const items = await storage.getComplianceItems(Number(req.params.orgId));
    res.json(items);
  });

  app.get("/api/compliance/:id", requirePermission('compliance', 'read'), async (req, res) => {
    const item = await storage.getComplianceItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Compliance item not found" });
    res.json(item);
  });

  app.post("/api/organizations/:orgId/compliance", requirePermission('compliance', 'create'), async (req, res) => {
    try {
      const createSchema = z.object({
        title: z.string().min(1),
        titleAr: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        descriptionAr: z.string().optional().nullable(),
        category: z.enum(['tax', 'regulatory', 'audit', 'legal', 'internal']),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        dueDate: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
      });
      const validated = createSchema.parse(req.body);
      const item = await storage.createComplianceItem({
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        organizationId: Number(req.params.orgId),
      });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      logger.error("compliance", "Create compliance error", error);
      res.status(500).json({ message: "Failed to create compliance item" });
    }
  });

  app.patch("/api/compliance/:id", requirePermission('compliance', 'update'), async (req, res) => {
    try {
      const updateSchema = z.object({
        title: z.string().optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).optional(),
        completedDate: z.string().optional().nullable(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        notes: z.string().optional().nullable(),
      });
      const validated = updateSchema.parse(req.body);
      const item = await storage.updateComplianceItem(Number(req.params.id), {
        ...validated,
        completedDate: validated.completedDate ? new Date(validated.completedDate) : null,
      });
      if (!item) return res.status(404).json({ message: "Compliance item not found" });
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      logger.error("compliance", "Update compliance error", error);
      res.status(500).json({ message: "Failed to update compliance item" });
    }
  });

  app.delete("/api/compliance/:id", requirePermission('compliance', 'delete'), async (req, res) => {
    await storage.deleteComplianceItem(Number(req.params.id));
    res.status(204).send();
  });

  // === DYNAMIC PAYMENT GATEWAYS ===
  app.get("/api/payment-gateways", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const gateways = await paymentGatewayService.getAllGateways();
      res.json(gateways);
    } catch (error) {
      logger.error("payment", "Get payment gateways error", error);
      res.status(500).json({ message: "Failed to get payment gateways" });
    }
  });

  app.get("/api/payment-gateways/enabled", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const gateways = await paymentGatewayService.getEnabledGateways();
      res.json(gateways);
    } catch (error) {
      logger.error("payment", "Get enabled gateways error", error);
      res.status(500).json({ message: "Failed to get enabled gateways" });
    }
  });

  app.get("/api/payment-gateways/providers", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const providers = paymentGatewayService.getAvailableProviders();
      res.json(providers);
    } catch (error) {
      logger.error("payment", "Get providers error", error);
      res.status(500).json({ message: "Failed to get providers" });
    }
  });

  app.post("/api/payment-gateways/initialize", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      await paymentGatewayService.initializeDefaultGateways();
      res.json({ success: true, message: "Default gateways initialized" });
    } catch (error) {
      logger.error("payment", "Initialize gateways error", error);
      res.status(500).json({ message: "Failed to initialize gateways" });
    }
  });

  app.get("/api/payment-gateways/:id", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const gateway = await paymentGatewayService.getGatewayById(Number(req.params.id));
      if (!gateway) {
        return res.status(404).json({ message: "Gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      logger.error("payment", "Get gateway error", error);
      res.status(500).json({ message: "Failed to get gateway" });
    }
  });

  app.post("/api/payment-gateways", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const gateway = await paymentGatewayService.createGateway(req.body);
      res.status(201).json(gateway);
    } catch (error) {
      logger.error("payment", "Create gateway error", error);
      res.status(500).json({ message: "Failed to create gateway" });
    }
  });

  app.patch("/api/payment-gateways/:id", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const gateway = await paymentGatewayService.updateGateway(Number(req.params.id), req.body);
      if (!gateway) {
        return res.status(404).json({ message: "Gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      logger.error("payment", "Update gateway error", error);
      res.status(500).json({ message: "Failed to update gateway" });
    }
  });

  app.delete("/api/payment-gateways/:id", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      await paymentGatewayService.deleteGateway(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      logger.error("payment", "Delete gateway error", error);
      res.status(500).json({ message: "Failed to delete gateway" });
    }
  });

  app.post("/api/payment-gateways/:id/checkout", async (req, res) => {
    try {
      const { paymentGatewayService } = await import("./paymentGatewayService");
      const userId = (req.session as any)?.userId;
      const { amount, currency, plan, organizationId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = await paymentGatewayService.createPaymentSession(
        Number(req.params.id),
        userId,
        organizationId || 1,
        amount,
        currency,
        plan
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      logger.error("payment", "Checkout error", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // === STRIPE PAYMENTS ===
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      logger.error("stripe", "Stripe key error", error);
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { stripeService } = await import("./stripeService");
      const { priceId, customerId } = req.body;
      
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';
      
      const session = await stripeService.createCheckoutSession(
        customerId || 'cus_temp',
        priceId,
        `${baseUrl}/dashboard?success=true`,
        `${baseUrl}/pricing?canceled=true`
      );
      
      res.json({ url: session.url });
    } catch (error) {
      logger.error("stripe", "Checkout session error", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/create-portal-session", async (req, res) => {
    try {
      const { stripeService } = await import("./stripeService");
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const subscription = await storage.getSubscription(userId);
      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }
      
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';
      
      const session = await stripeService.createCustomerPortalSession(
        subscription.stripeCustomerId,
        `${baseUrl}/settings`
      );
      
      res.json({ url: session.url });
    } catch (error) {
      logger.error("stripe", "Portal session error", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.get("/api/stripe/products", async (req, res) => {
    try {
      const { stripeService } = await import("./stripeService");
      const products = await stripeService.listProductsWithPrices();
      res.json(products);
    } catch (error) {
      logger.error("stripe", "Products fetch error", error);
      res.json([]);
    }
  });

  // === SUBSCRIPTION STATUS ===
  app.get("/api/subscription/status", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.json({ plan: 'free', status: 'active', features: getFreePlanFeatures() });
      }
      const subscription = await storage.getSubscription(userId);
      if (!subscription) {
        return res.json({ plan: 'free', status: 'active', features: getFreePlanFeatures() });
      }
      res.json({
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: getPlanFeatures(subscription.plan),
      });
    } catch (error) {
      logger.error("stripe", "Subscription status error", error);
      res.json({ plan: 'free', status: 'active', features: getFreePlanFeatures() });
    }
  });

  // === PERIOD CLOSING ===
  app.get("/api/organizations/:orgId/period-closings", async (req, res) => {
    try {
      const closings = await storage.getPeriodClosings(Number(req.params.orgId));
      res.json(closings);
    } catch (error) {
      logger.error("accounting", "Get period closings error", error);
      res.status(500).json({ message: "Failed to get period closings" });
    }
  });

  app.post("/api/organizations/:orgId/period-closings", async (req, res) => {
    try {
      const { year, month, notes } = req.body;
      const orgId = Number(req.params.orgId);
      const period = `${year}-${String(month).padStart(2, '0')}`;
      
      // Check if period already exists
      const existing = await storage.getPeriodClosing(orgId, year, month);
      if (existing) {
        return res.status(409).json({ message: "Period already exists" });
      }

      // Create period closing record
      const closing = await storage.createPeriodClosing({
        organizationId: orgId,
        period,
        year,
        month,
        status: 'open',
        notes,
      });

      // Log audit
      const userId = (req.session as any)?.userId;
      await storage.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'create',
        entityType: 'period_closing',
        entityId: closing.id,
        oldValues: null,
        newValues: { period, year, month },
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });

      res.status(201).json(closing);
    } catch (error) {
      logger.error("accounting", "Create period closing error", error);
      res.status(500).json({ message: "Failed to create period closing" });
    }
  });

  app.post("/api/organizations/:orgId/period-closings/:id/close", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const userId = (req.session as any)?.userId;
      const orgId = Number(req.params.orgId);

      // Calculate retained earnings from revenue and expenses
      const accounts = await storage.getAccounts(orgId);
      const revenue = accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + Number(a.balance || 0), 0);
      const expenses = accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + Number(a.balance || 0), 0);
      const retainedEarnings = revenue - expenses;

      const closing = await storage.updatePeriodClosing(id, {
        status: 'closed',
        closedBy: userId,
        closedAt: new Date(),
        retainedEarnings: String(retainedEarnings),
      });

      // Log audit
      await storage.createAuditLog({
        organizationId: orgId,
        userId,
        action: 'close_period',
        entityType: 'period_closing',
        entityId: id,
        oldValues: { status: 'open' },
        newValues: { status: 'closed', retainedEarnings },
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });

      res.json(closing);
    } catch (error) {
      logger.error("accounting", "Close period error", error);
      res.status(500).json({ message: "Failed to close period" });
    }
  });

  // === AUDIT LOGS ===
  app.get("/api/organizations/:orgId/audit-logs", requirePermission('compliance', 'read'), async (req, res) => {
    try {
      const logs = await storage.getAuditLogs(Number(req.params.orgId), 100);
      res.json(logs);
    } catch (error) {
      logger.error("audit", "Get audit logs error", error);
      res.status(500).json({ message: "Failed to get audit logs" });
    }
  });

  // === AI MONTHLY REPORT ===
  app.get("/api/organizations/:orgId/ai-monthly-report", requirePermission('reports', 'read'), async (req, res) => {
    try {
      const orgId = Number(req.params.orgId);
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const lang = req.query.lang === 'ar' ? 'ar' : 'en';

      const accounts = await storage.getAccounts(orgId);
      const transactions = await storage.getTransactions(orgId);
      const invoices = await storage.getInvoices(orgId);
      const cashFlows = await storage.getCashFlows(orgId);
      const insights = await storage.getAiInsights(orgId);

      const totalAssets = accounts.filter(a => a.type === 'asset').reduce((s, a) => s + Number(a.balance || 0), 0);
      const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((s, a) => s + Number(a.balance || 0), 0);
      const totalEquity = accounts.filter(a => a.type === 'equity').reduce((s, a) => s + Number(a.balance || 0), 0);
      const totalRevenue = accounts.filter(a => a.type === 'revenue').reduce((s, a) => s + Number(a.balance || 0), 0);
      const totalExpenses = accounts.filter(a => a.type === 'expense').reduce((s, a) => s + Number(a.balance || 0), 0);
      const netIncome = totalRevenue - totalExpenses;

      const unpaidInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
      const totalReceivables = unpaidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
      const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.total || 0), 0);

      const operatingCashFlow = cashFlows.filter(cf => cf.type === 'operating').reduce((s, cf) => s + Number(cf.amount || 0), 0);
      const investingCashFlow = cashFlows.filter(cf => cf.type === 'investing').reduce((s, cf) => s + Number(cf.amount || 0), 0);
      const financingCashFlow = cashFlows.filter(cf => cf.type === 'financing').reduce((s, cf) => s + Number(cf.amount || 0), 0);

      const report = {
        period: `${year}-${String(month).padStart(2, '0')}`,
        generatedAt: new Date().toISOString(),
        summary: {
          title: lang === 'ar' ? 'ملخص الشهر' : 'Monthly Summary',
          netIncome,
          profitMargin: totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0',
          cashPosition: operatingCashFlow + investingCashFlow + financingCashFlow,
        },
        balanceSheet: {
          title: lang === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet',
          totalAssets,
          totalLiabilities,
          totalEquity,
          debtRatio: totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '0',
        },
        incomeStatement: {
          title: lang === 'ar' ? 'قائمة الدخل' : 'Income Statement',
          totalRevenue,
          totalExpenses,
          netIncome,
        },
        cashFlow: {
          title: lang === 'ar' ? 'التدفق النقدي' : 'Cash Flow',
          operating: operatingCashFlow,
          investing: investingCashFlow,
          financing: financingCashFlow,
          netChange: operatingCashFlow + investingCashFlow + financingCashFlow,
        },
        receivables: {
          title: lang === 'ar' ? 'المستحقات' : 'Receivables',
          totalReceivables,
          overdueAmount,
          overdueCount: invoices.filter(i => i.status === 'overdue').length,
        },
        aiInsights: insights.slice(0, 5).map(i => ({
          type: i.type,
          severity: i.severity,
          title: lang === 'ar' ? i.titleAr : i.title,
          description: lang === 'ar' ? i.descriptionAr : i.description,
        })),
        recommendations: [
          {
            priority: 'high',
            title: lang === 'ar' ? 'تحسين التحصيل' : 'Improve Collections',
            description: lang === 'ar' 
              ? `لديك ${unpaidInvoices.length} فواتير غير مدفوعة بقيمة $${totalReceivables.toLocaleString()}`
              : `You have ${unpaidInvoices.length} unpaid invoices totaling $${totalReceivables.toLocaleString()}`,
          },
          {
            priority: 'medium',
            title: lang === 'ar' ? 'مراقبة التدفق النقدي' : 'Monitor Cash Flow',
            description: lang === 'ar'
              ? 'راقب التدفق النقدي التشغيلي لضمان السيولة الكافية'
              : 'Keep an eye on operating cash flow to ensure adequate liquidity',
          },
        ],
      };

      res.json(report);
    } catch (error) {
      logger.error("ai", "AI monthly report error", error);
      res.status(500).json({ message: "Failed to generate AI monthly report" });
    }
  });

  // === EMAIL NOTIFICATIONS ===
  app.post("/api/notifications/send-test", async (req, res) => {
    try {
      const { email, type, lang } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      let success = false;
      const language = lang === 'ar' ? 'ar' : 'en';

      switch (type) {
        case 'welcome':
          success = await sendWelcomeEmail(email, 'Test User', language);
          break;
        case 'password-reset':
          success = await sendPasswordResetEmail(email, 'test-token-123', language);
          break;
        case 'invoice':
          success = await sendInvoiceNotification(email, 'INV-001', '$1,500.00', '2026-02-15', language);
          break;
        case 'ai-alert':
          success = await sendAIAlertEmail(
            email, 
            language === 'ar' ? 'تحذير' : 'Warning',
            language === 'ar' ? 'تنبيه التدفق النقدي' : 'Cash Flow Alert',
            language === 'ar' ? 'قد يكون التدفق النقدي محدوداً في الأيام القادمة' : 'Cash flow may be tight in the coming days',
            'warning',
            language
          );
          break;
        case 'weekly-report':
          success = await sendWeeklyReportEmail(email, {
            revenue: 125000,
            expenses: 85000,
            netIncome: 40000,
            pendingInvoices: 5,
            overdueAmount: 12500,
          }, language);
          break;
        default:
          success = await sendEmail({
            to: email,
            subject: language === 'ar' ? 'اختبار البريد الإلكتروني - INFERA' : 'Email Test - INFERA',
            html: language === 'ar' 
              ? '<h1>اختبار ناجح!</h1><p>تم إرسال هذا البريد من INFERA Finance AI.</p>'
              : '<h1>Test Successful!</h1><p>This email was sent from INFERA Finance AI.</p>',
          });
      }

      if (success) {
        res.json({ message: language === 'ar' ? 'تم إرسال البريد بنجاح' : 'Email sent successfully' });
      } else {
        res.status(500).json({ message: language === 'ar' ? 'فشل إرسال البريد' : 'Failed to send email' });
      }
    } catch (error) {
      logger.error("email", "Send test email error", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  app.post("/api/notifications/invoice", async (req, res) => {
    try {
      const { email, invoiceNumber, amount, dueDate, lang } = req.body;
      
      if (!email || !invoiceNumber || !amount || !dueDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const success = await sendInvoiceNotification(email, invoiceNumber, amount, dueDate, lang === 'ar' ? 'ar' : 'en');
      
      if (success) {
        res.json({ message: "Invoice notification sent" });
      } else {
        res.status(500).json({ message: "Failed to send invoice notification" });
      }
    } catch (error) {
      logger.error("email", "Invoice notification error", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  app.post("/api/notifications/ai-alert", async (req, res) => {
    try {
      const { email, alertType, title, description, severity, lang } = req.body;
      
      if (!email || !title || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const success = await sendAIAlertEmail(
        email,
        alertType || 'Alert',
        title,
        description,
        severity || 'info',
        lang === 'ar' ? 'ar' : 'en'
      );
      
      if (success) {
        res.json({ message: "AI alert sent" });
      } else {
        res.status(500).json({ message: "Failed to send AI alert" });
      }
    } catch (error) {
      logger.error("ai", "AI alert error", error);
      res.status(500).json({ message: "Failed to send alert" });
    }
  });

  // === FINANCIAL REPORTS BY YEAR ===
  app.get("/api/reports/financial", async (req, res) => {
    try {
      const orgId = parseInt(req.query.orgId as string);
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID required" });
      }
      
      // Get all accounts for the organization
      const allAccounts = await storage.getAccounts(orgId);
      
      // Get all transactions and transaction lines for the organization up to year-end
      const yearEndDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31 of selected year
      const yearStartDate = new Date(year, 0, 1, 0, 0, 0, 0); // Jan 1 of selected year
      
      const allTransactions = await storage.getTransactions(orgId);
      const transactionsInYear = allTransactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate <= yearEndDate;
      });
      
      const transactionsThisYear = allTransactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= yearStartDate && txDate <= yearEndDate;
      });
      
      // Calculate balances from transaction lines
      const accountBalances: Record<number, number> = {};
      allAccounts.forEach(acc => {
        accountBalances[acc.id] = 0;
      });
      
      // Sum up transaction lines for each account
      for (const tx of transactionsInYear) {
        const lines = await storage.getTransactionLines(tx.id);
        for (const line of lines) {
          const debit = parseFloat(line.debit || '0');
          const credit = parseFloat(line.credit || '0');
          const account = allAccounts.find(a => a.id === line.accountId);
          if (account) {
            // For assets and expenses: debit increases, credit decreases
            // For liabilities, equity, revenue: credit increases, debit decreases
            if (account.type === 'asset' || account.type === 'expense') {
              accountBalances[account.id] += debit - credit;
            } else {
              accountBalances[account.id] += credit - debit;
            }
          }
        }
      }
      
      // Build accounts with calculated balances
      const accounts = allAccounts.map(acc => ({
        ...acc,
        balance: accountBalances[acc.id]?.toFixed(2) || '0.00'
      }));
      
      // Get cash flows for this year
      const allCashFlows = await storage.getCashFlows(orgId);
      const cashFlows = allCashFlows.filter(cf => {
        const cfDate = new Date(cf.date);
        return cfDate >= yearStartDate && cfDate <= yearEndDate;
      });
      
      res.json({ accounts, cashFlows, year });
    } catch (error) {
      logger.error("reports", "Financial report error", error);
      res.status(500).json({ message: "Failed to get financial report" });
    }
  });

  // === PDF GENERATION ===
  app.get("/api/reports/pdf", async (req, res) => {
    try {
      const { generatePDF } = await import("./pdfService");
      const orgId = parseInt(req.query.orgId as string) || 2;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const lang = (req.query.lang as string) === 'ar' ? 'ar' : 'en';

      const org = await storage.getOrganization(orgId);
      const accounts = await storage.getAccounts(orgId);
      const cashFlows = await storage.getCashFlows(orgId);

      const pdfBuffer = await generatePDF({
        orgName: org?.name || 'INFERA Demo Corp',
        year,
        lang,
        accounts: accounts.map((a: any) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          nameAr: a.nameAr,
          type: a.type,
          balance: a.balance || '0'
        })),
        cashFlows: cashFlows.map((cf: any) => ({
          type: cf.type,
          category: cf.category,
          description: cf.description,
          amount: cf.amount,
          date: cf.date?.toISOString() || ''
        }))
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=INFERA_Financial_Report_${year}_${lang}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error("pdf", "PDF generation error", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // === SEED DEMO DATA (Environment-Guarded) ===
  const demoEnabled = await isDemoModeEnabled();
  if (demoEnabled) {
    logger.info("routes", "Demo mode enabled, seeding demo data...");
    await seedDemoData();
  } else {
    logger.info("routes", "Demo mode disabled. Skipping demo data seeding.");
  }

  return httpServer;
}

async function seedDemoData() {
  // SAFETY: Only runs if demo_mode feature flag is enabled
  // NEVER runs in production by default
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    logger.warn("seed", "BLOCKED: Demo seeding is disabled in production");
    return;
  }
  
  const orgs = await storage.getOrganizations();
  if (orgs.length > 0) {
    logger.info("seed", "Organizations already exist. Skipping demo data.");
    return;
  }

  const org = await storage.createOrganization({
    name: "INFERA Demo Corp",
    type: "enterprise",
    country: "UAE",
    currency: "USD",
    industry: "Technology",
    subscriptionTier: "enterprise",
  });

  const accountTypes = [
    { code: "1000", name: "Cash & Bank", nameAr: "النقد والبنوك", type: "asset", subtype: "cash", balance: "1250000" },
    { code: "1100", name: "Accounts Receivable", nameAr: "المدينون", type: "asset", subtype: "receivable", balance: "485000" },
    { code: "1200", name: "Inventory", nameAr: "المخزون", type: "asset", subtype: "inventory", balance: "320000" },
    { code: "1300", name: "Fixed Assets", nameAr: "الأصول الثابتة", type: "asset", subtype: "fixed", balance: "890000" },
    { code: "2000", name: "Accounts Payable", nameAr: "الدائنون", type: "liability", subtype: "payable", balance: "178000" },
    { code: "2100", name: "Short-term Loans", nameAr: "القروض قصيرة الأجل", type: "liability", subtype: "loan", balance: "250000" },
    { code: "2200", name: "Accrued Expenses", nameAr: "المصروفات المستحقة", type: "liability", subtype: "accrued", balance: "45000" },
    { code: "3000", name: "Equity", nameAr: "حقوق الملكية", type: "equity", subtype: "capital", balance: "2000000" },
    { code: "3100", name: "Retained Earnings", nameAr: "الأرباح المحتجزة", type: "equity", subtype: "retained", balance: "472000" },
    { code: "4000", name: "Sales Revenue", nameAr: "إيرادات المبيعات", type: "revenue", subtype: "sales", balance: "3250000" },
    { code: "4100", name: "Service Revenue", nameAr: "إيرادات الخدمات", type: "revenue", subtype: "service", balance: "890000" },
    { code: "4200", name: "Other Income", nameAr: "إيرادات أخرى", type: "revenue", subtype: "other", balance: "45000" },
    { code: "5000", name: "Cost of Goods Sold", nameAr: "تكلفة البضاعة المباعة", type: "expense", subtype: "cogs", balance: "1950000" },
    { code: "5100", name: "Operating Expenses", nameAr: "المصروفات التشغيلية", type: "expense", subtype: "operating", balance: "680000" },
    { code: "5200", name: "Salaries & Wages", nameAr: "الرواتب والأجور", type: "expense", subtype: "payroll", balance: "420000" },
    { code: "5300", name: "Marketing Expenses", nameAr: "مصروفات التسويق", type: "expense", subtype: "marketing", balance: "125000" },
  ];

  const accounts: any[] = [];
  for (const acc of accountTypes) {
    const account = await storage.createAccount({
      organizationId: org.id,
      ...acc,
    });
    accounts.push(account);
  }

  const customers = [
    { name: "Aramco Holdings", email: "accounts@aramco.com", country: "SA", type: "customer" },
    { name: "Dubai Investments LLC", email: "finance@dil.ae", country: "AE", type: "customer" },
    { name: "Qatar Airways Group", email: "billing@qatarairways.com", country: "QA", type: "customer" },
    { name: "Emirates Global Bank", email: "treasury@egb.ae", country: "AE", type: "customer" },
    { name: "Saudi Tech Ventures", email: "ap@sauditech.sa", country: "SA", type: "both" },
  ];

  const vendors = [
    { name: "Microsoft Azure", email: "billing@microsoft.com", country: "US", type: "vendor" },
    { name: "AWS Cloud Services", email: "ap@aws.amazon.com", country: "US", type: "vendor" },
    { name: "Oracle Middle East", email: "finance@oracle.me", country: "AE", type: "vendor" },
  ];

  const createdContacts: any[] = [];
  for (const c of [...customers, ...vendors]) {
    const contact = await storage.createContact({
      organizationId: org.id,
      name: c.name,
      email: c.email,
      country: c.country,
      type: c.type as "customer" | "vendor" | "both",
      currency: "USD",
    });
    createdContacts.push(contact);
  }

  const today = new Date();
  const transactionDefs = [
    { desc: "Sales invoice - Aramco Holdings", type: "invoice", debitAcc: 1, creditAcc: 9, amount: 125000 },
    { desc: "Service revenue - Dubai Investments", type: "invoice", debitAcc: 1, creditAcc: 10, amount: 45000 },
    { desc: "Vendor payment - Microsoft Azure", type: "payment", debitAcc: 4, creditAcc: 0, amount: 35000 },
    { desc: "Customer payment received - Qatar Airways", type: "payment", debitAcc: 0, creditAcc: 1, amount: 89000 },
    { desc: "Payroll expense", type: "expense", debitAcc: 14, creditAcc: 0, amount: 78000 },
    { desc: "Marketing campaign payment", type: "expense", debitAcc: 15, creditAcc: 0, amount: 25000 },
    { desc: "Inventory purchase", type: "expense", debitAcc: 2, creditAcc: 4, amount: 55000 },
    { desc: "Operating expense - Office", type: "expense", debitAcc: 13, creditAcc: 0, amount: 12000 },
  ];

  for (let i = 0; i < transactionDefs.length; i++) {
    const txDef = transactionDefs[i];
    const txDate = new Date(today);
    txDate.setDate(txDate.getDate() - (i * 3));
    
    const tx = await storage.createTransaction({
      organizationId: org.id,
      date: txDate,
      description: txDef.desc,
      type: txDef.type,
      status: "posted",
      currency: "USD",
      reference: `TXN-2026-${String(i + 1).padStart(4, "0")}`,
    });

    await storage.createTransactionLine({
      transactionId: tx.id,
      accountId: accounts[txDef.debitAcc].id,
      debit: String(txDef.amount),
      credit: "0",
      memo: txDef.desc,
    });

    await storage.createTransactionLine({
      transactionId: tx.id,
      accountId: accounts[txDef.creditAcc].id,
      debit: "0",
      credit: String(txDef.amount),
      memo: txDef.desc,
    });
  }

  const invoiceDefs = [
    { num: "INV-2026-001", type: "receivable", customerId: 0, amount: 125000, status: "paid" },
    { num: "INV-2026-002", type: "receivable", customerId: 1, amount: 45000, status: "sent" },
    { num: "INV-2026-003", type: "receivable", customerId: 2, amount: 89000, status: "paid" },
    { num: "INV-2026-004", type: "receivable", customerId: 3, amount: 156000, status: "sent" },
    { num: "INV-2026-005", type: "receivable", customerId: 4, amount: 67000, status: "overdue" },
    { num: "BILL-2026-001", type: "payable", vendorId: 5, amount: 35000, status: "paid" },
    { num: "BILL-2026-002", type: "payable", vendorId: 6, amount: 22000, status: "draft" },
    { num: "BILL-2026-003", type: "payable", vendorId: 7, amount: 48000, status: "sent" },
  ];

  for (let i = 0; i < invoiceDefs.length; i++) {
    const inv = invoiceDefs[i];
    const issueDate = new Date(today);
    issueDate.setDate(issueDate.getDate() - (i * 5));
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    await storage.createInvoice({
      organizationId: org.id,
      invoiceNumber: inv.num,
      type: inv.type as "receivable" | "payable",
      status: inv.status as "draft" | "sent" | "paid" | "overdue",
      customerId: inv.type === "receivable" ? createdContacts[inv.customerId!].id : undefined,
      vendorId: inv.type === "payable" ? createdContacts[inv.vendorId!].id : undefined,
      issueDate,
      dueDate,
      subtotal: String(inv.amount * 0.95),
      tax: String(inv.amount * 0.05),
      total: String(inv.amount),
      amountPaid: inv.status === "paid" ? String(inv.amount) : "0",
      currency: "USD",
    });
  }

  const budget = await storage.createBudget({
    organizationId: org.id,
    name: "Annual Budget 2026",
    fiscalYear: 2026,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    status: "active",
    totalAmount: "5000000",
    currency: "USD",
  });

  const cashFlowDefs = [
    { type: "operating", category: "Revenue Collection", amount: 450000 },
    { type: "operating", category: "Vendor Payments", amount: -180000 },
    { type: "operating", category: "Payroll", amount: -78000 },
    { type: "operating", category: "Operating Expenses", amount: -45000 },
    { type: "investing", category: "Equipment Purchase", amount: -120000 },
    { type: "financing", category: "Loan Repayment", amount: -50000 },
    { type: "operating", category: "Revenue Forecast Q2", amount: 520000, isProjected: true },
    { type: "operating", category: "Expense Forecast Q2", amount: -280000, isProjected: true },
  ];

  for (let i = 0; i < cashFlowDefs.length; i++) {
    const cf = cashFlowDefs[i];
    const cfDate = new Date(today);
    if (cf.isProjected) {
      cfDate.setMonth(cfDate.getMonth() + 2);
    } else {
      cfDate.setDate(cfDate.getDate() - (i * 7));
    }
    
    await storage.createCashFlow({
      organizationId: org.id,
      date: cfDate,
      type: cf.type as "operating" | "investing" | "financing",
      category: cf.category,
      amount: String(cf.amount),
      currency: "USD",
      isProjected: cf.isProjected || false,
    });
  }

  const insights = [
    {
      type: "forecast",
      severity: "info",
      title: "Revenue Growth Forecast",
      titleAr: "توقع نمو الإيرادات",
      description: "Revenue is expected to increase by 15% next quarter based on current trends. Strong performance from service revenue segment.",
      descriptionAr: "من المتوقع زيادة الإيرادات بنسبة 15% في الربع القادم بناءً على الاتجاهات الحالية. أداء قوي من قطاع إيرادات الخدمات.",
      data: { forecastAmount: 4782500, confidence: 0.85, trend: "up" },
    },
    {
      type: "risk",
      severity: "warning",
      title: "Cash Flow Alert",
      titleAr: "تنبيه التدفق النقدي",
      description: "Operating cash flow may be tight in the next 30 days. Consider accelerating receivables collection or deferring non-essential payments.",
      descriptionAr: "قد يكون التدفق النقدي التشغيلي محدوداً في الـ 30 يوماً القادمة. فكر في تسريع تحصيل المدينين أو تأجيل المدفوعات غير الضرورية.",
      data: { daysToNegative: 28, shortfall: 45000, severity: "medium" },
    },
    {
      type: "opportunity",
      severity: "success",
      title: "Cost Optimization Opportunity",
      titleAr: "فرصة تحسين التكاليف",
      description: "AI detected potential savings of $45,000 annually in operating expenses through vendor consolidation and contract renegotiation.",
      descriptionAr: "اكتشف الذكاء الاصطناعي إمكانية توفير 45,000 دولار سنوياً في المصروفات التشغيلية من خلال توحيد الموردين وإعادة التفاوض على العقود.",
      data: { savings: 45000, category: "operating", vendors: ["Microsoft", "Oracle"], action: "consolidate" },
    },
    {
      type: "anomaly",
      severity: "warning",
      title: "Unusual Transaction Pattern",
      titleAr: "نمط معاملات غير عادي",
      description: "Detected 23% increase in marketing expenses compared to historical average. Review recent marketing campaigns for ROI validation.",
      descriptionAr: "تم اكتشاف زيادة بنسبة 23% في مصروفات التسويق مقارنة بالمتوسط التاريخي. راجع الحملات التسويقية الأخيرة للتحقق من العائد على الاستثمار.",
      data: { deviation: 0.23, account: "Marketing Expenses", baseline: 101626, actual: 125000 },
    },
    {
      type: "recommendation",
      severity: "info",
      title: "Investment Opportunity",
      titleAr: "فرصة استثمارية",
      description: "Based on current cash reserves and growth trajectory, consider allocating $200,000 to short-term investments for improved returns.",
      descriptionAr: "بناءً على الاحتياطيات النقدية الحالية ومسار النمو، فكر في تخصيص 200,000 دولار للاستثمارات قصيرة الأجل لتحسين العوائد.",
      data: { suggestedAmount: 200000, expectedReturn: 0.045, riskLevel: "low" },
    },
  ];

  for (const insight of insights) {
    await storage.createAiInsight({
      organizationId: org.id,
      type: insight.type as any,
      severity: insight.severity as any,
      title: insight.title,
      titleAr: insight.titleAr,
      description: insight.description,
      descriptionAr: insight.descriptionAr,
      data: insight.data,
    });
  }
}

// === PLAN FEATURES ===
function getFreePlanFeatures() {
  return {
    maxOrganizations: 1,
    maxTransactionsPerMonth: 100,
    reports: 'basic',
    aiInsights: false,
    multiCurrency: false,
    apiAccess: false,
    periodClosing: false,
    auditLogs: false,
  };
}

function getPlanFeatures(plan: string) {
  switch (plan) {
    case 'starter':
      return {
        maxOrganizations: 3,
        maxTransactionsPerMonth: 1000,
        reports: 'advanced',
        aiInsights: false,
        multiCurrency: false,
        apiAccess: false,
        periodClosing: true,
        auditLogs: true,
      };
    case 'professional':
      return {
        maxOrganizations: 10,
        maxTransactionsPerMonth: -1, // unlimited
        reports: 'advanced',
        aiInsights: true,
        multiCurrency: true,
        apiAccess: true,
        periodClosing: true,
        auditLogs: true,
      };
    case 'enterprise':
      return {
        maxOrganizations: -1, // unlimited
        maxTransactionsPerMonth: -1,
        reports: 'advanced',
        aiInsights: true,
        multiCurrency: true,
        apiAccess: true,
        periodClosing: true,
        auditLogs: true,
        sso: true,
        dedicatedSupport: true,
      };
    default:
      return getFreePlanFeatures();
  }
}
