import { db } from "./db";
import { accounts, transactions, transactionLines, invoices, budgets } from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

interface AIInsight {
  type: 'forecast' | 'anomaly' | 'recommendation' | 'risk' | 'opportunity';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  data?: Record<string, any>;
}

export async function generateAIInsights(organizationId: number): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  const orgAccounts = await db.select().from(accounts).where(eq(accounts.organizationId, organizationId));
  const orgTransactions = await db.select().from(transactions).where(eq(transactions.organizationId, organizationId)).orderBy(desc(transactions.date)).limit(100);
  const orgInvoices = await db.select().from(invoices).where(eq(invoices.organizationId, organizationId));
  const orgBudgets = await db.select().from(budgets).where(eq(budgets.organizationId, organizationId));
  
  const totalAssets = orgAccounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalLiabilities = orgAccounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalRevenue = orgAccounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalExpenses = orgAccounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  
  if (totalAssets > 0) {
    const debtRatio = totalLiabilities / totalAssets;
    if (debtRatio > 0.7) {
      insights.push({
        type: 'risk',
        severity: 'critical',
        title: 'High Debt Ratio Alert',
        titleAr: 'تنبيه: نسبة ديون مرتفعة',
        description: `Your debt ratio is ${(debtRatio * 100).toFixed(1)}%. Consider reducing liabilities to improve financial stability.`,
        descriptionAr: `نسبة الديون لديك ${(debtRatio * 100).toFixed(1)}%. يُنصح بتخفيض الالتزامات لتحسين الاستقرار المالي.`,
        data: { debtRatio, totalLiabilities, totalAssets }
      });
    } else if (debtRatio < 0.3) {
      insights.push({
        type: 'opportunity',
        severity: 'success',
        title: 'Healthy Debt Position',
        titleAr: 'وضع ديون صحي',
        description: `Your debt ratio is ${(debtRatio * 100).toFixed(1)}%. You have capacity for growth investments.`,
        descriptionAr: `نسبة الديون لديك ${(debtRatio * 100).toFixed(1)}%. لديك قدرة على الاستثمار في النمو.`,
        data: { debtRatio, totalLiabilities, totalAssets }
      });
    }
  }
  
  const overdueInvoices = orgInvoices.filter(inv => {
    const dueDate = new Date(inv.dueDate);
    return inv.status !== 'paid' && dueDate < new Date();
  });
  
  if (overdueInvoices.length > 0) {
    const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total || 0) - Number(inv.amountPaid || 0), 0);
    insights.push({
      type: 'risk',
      severity: overdueInvoices.length > 5 ? 'critical' : 'warning',
      title: `${overdueInvoices.length} Overdue Invoices`,
      titleAr: `${overdueInvoices.length} فواتير متأخرة`,
      description: `You have ${overdueInvoices.length} overdue invoices totaling $${overdueTotal.toLocaleString()}. Consider following up with customers.`,
      descriptionAr: `لديك ${overdueInvoices.length} فواتير متأخرة بإجمالي $${overdueTotal.toLocaleString()}. يُنصح بمتابعة العملاء.`,
      data: { count: overdueInvoices.length, total: overdueTotal }
    });
  }
  
  const netIncome = totalRevenue - totalExpenses;
  if (totalRevenue > 0) {
    const profitMargin = (netIncome / totalRevenue) * 100;
    if (profitMargin < 10) {
      insights.push({
        type: 'recommendation',
        severity: 'warning',
        title: 'Low Profit Margin',
        titleAr: 'هامش ربح منخفض',
        description: `Your profit margin is ${profitMargin.toFixed(1)}%. Consider reviewing expenses or pricing strategies.`,
        descriptionAr: `هامش الربح لديك ${profitMargin.toFixed(1)}%. يُنصح بمراجعة المصاريف أو استراتيجيات التسعير.`,
        data: { profitMargin, netIncome, totalRevenue }
      });
    } else if (profitMargin > 20) {
      insights.push({
        type: 'opportunity',
        severity: 'success',
        title: 'Strong Profit Margin',
        titleAr: 'هامش ربح قوي',
        description: `Your profit margin is ${profitMargin.toFixed(1)}%. Consider reinvesting in growth opportunities.`,
        descriptionAr: `هامش الربح لديك ${profitMargin.toFixed(1)}%. يُنصح بإعادة الاستثمار في فرص النمو.`,
        data: { profitMargin, netIncome, totalRevenue }
      });
    }
  }
  
  if (orgTransactions.length >= 10) {
    const recentAmounts = orgTransactions.slice(0, 10).map(t => {
      return Number(t.id);
    });
    const avg = recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length;
    
    const growth = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0;
    insights.push({
      type: 'forecast',
      severity: 'info',
      title: 'Revenue Trend Analysis',
      titleAr: 'تحليل اتجاه الإيرادات',
      description: `Based on ${orgTransactions.length} transactions, your current performance shows a ${growth.toFixed(1)}% net margin.`,
      descriptionAr: `بناءً على ${orgTransactions.length} معاملة، يُظهر أداؤك الحالي هامش صافي ${growth.toFixed(1)}%.`,
      data: { transactionCount: orgTransactions.length, growth }
    });
  }
  
  const cashAccounts = orgAccounts.filter(a => a.subtype === 'cash' || a.name.toLowerCase().includes('cash'));
  const totalCash = cashAccounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const monthlyExpenses = totalExpenses / 12;
  
  if (monthlyExpenses > 0 && totalCash < monthlyExpenses * 3) {
    insights.push({
      type: 'risk',
      severity: 'warning',
      title: 'Low Cash Reserve',
      titleAr: 'احتياطي نقدي منخفض',
      description: `Your cash reserve covers only ${(totalCash / monthlyExpenses).toFixed(1)} months of expenses. Aim for at least 3 months.`,
      descriptionAr: `احتياطيك النقدي يغطي ${(totalCash / monthlyExpenses).toFixed(1)} شهر فقط من المصاريف. يُنصح بتوفير 3 أشهر على الأقل.`,
      data: { totalCash, monthlyExpenses, monthsCovered: totalCash / monthlyExpenses }
    });
  }
  
  if (insights.length === 0) {
    insights.push({
      type: 'recommendation',
      severity: 'info',
      title: 'Add More Data for Insights',
      titleAr: 'أضف المزيد من البيانات للتحليلات',
      description: 'Start adding accounts, transactions, and invoices to receive personalized AI insights.',
      descriptionAr: 'ابدأ بإضافة الحسابات والمعاملات والفواتير للحصول على تحليلات ذكية مخصصة.',
      data: {}
    });
  }
  
  return insights;
}

export async function getFinancialMetrics(organizationId: number) {
  const orgAccounts = await db.select().from(accounts).where(eq(accounts.organizationId, organizationId));
  
  const totalAssets = orgAccounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalLiabilities = orgAccounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalEquity = orgAccounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalRevenue = orgAccounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalExpenses = orgAccounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  
  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
    debtRatio: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
    profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
    currentRatio: totalLiabilities > 0 ? totalAssets / totalLiabilities : 0,
  };
}
