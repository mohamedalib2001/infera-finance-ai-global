import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, 
  BarChart3, ArrowUpRight, ArrowDownRight,
  Brain, Sparkles, AlertTriangle, Lightbulb, Target,
  Globe2, Wallet, Receipt,
  ChevronRight, Send, Mic, Languages, Loader2, HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/lib/organization-context";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Account, Transaction, AiInsight, CashFlow, Invoice } from "@shared/schema";

export default function Dashboard() {
  const { t, isRTL, lang, setLang } = useI18n();
  const { currentOrg, currentOrgId, isLoading: orgsLoading } = useOrganization();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const toggleLang = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  const [isSendingQuery, setIsSendingQuery] = useState(false);

  const handleSendAiQuery = async () => {
    if (!aiQuery.trim()) {
      toast({
        title: lang === 'ar' ? 'تنبيه' : 'Notice',
        description: lang === 'ar' ? 'الرجاء إدخال سؤال' : 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingQuery(true);
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: aiQuery, 
          organizationId: currentOrgId,
          language: lang 
        }),
      });

      if (!response.ok) {
        throw new Error(lang === 'ar' ? 'فشل في معالجة السؤال' : 'Failed to process query');
      }

      const data = await response.json();
      setAiResponse(data.response || data.message);
      
      // Handle action if present
      if (data.action) {
        if (data.action.type === 'navigate') {
          const yearInfo = data.action.year ? (lang === 'ar' ? ` لسنة ${data.action.year}` : ` for ${data.action.year}`) : '';
          toast({
            title: lang === 'ar' ? 'جاري التنقل...' : 'Navigating...',
            description: lang === 'ar' 
              ? `الانتقال إلى ${data.action.nameAr}${yearInfo}`
              : `Going to ${data.action.nameEn}${yearInfo}`,
          });
          setAiQuery('');
          // Navigate after a short delay so user sees the message
          setTimeout(() => {
            let targetPath = data.action.path;
            // Add query params if present (e.g., for specific report tabs)
            const urlParams: Record<string, string> = {};
            if (data.action.params) {
              Object.assign(urlParams, data.action.params);
            }
            if (data.action.year) {
              urlParams.year = data.action.year.toString();
            }
            if (Object.keys(urlParams).length > 0) {
              const queryParams = new URLSearchParams(urlParams).toString();
              targetPath = `${data.action.path}?${queryParams}`;
            }
            setLocation(targetPath);
          }, 800);
        } else if (data.action.type === 'print') {
          const yearInfo = data.action.year ? (lang === 'ar' ? ` لسنة ${data.action.year}` : ` for ${data.action.year}`) : '';
          toast({
            title: lang === 'ar' ? 'جاري التحضير للطباعة...' : 'Preparing for print...',
            description: lang === 'ar' 
              ? `جاري تحضير ${data.action.reportNameAr}${yearInfo}`
              : `Preparing ${data.action.reportNameEn}${yearInfo}`,
          });
          setAiQuery('');
          // Navigate to reports page with print action
          setTimeout(() => {
            const urlParams: Record<string, string> = {
              tab: data.action.reportType !== 'all' ? data.action.reportType : 'balance-sheet',
              action: 'print'
            };
            if (data.action.year) {
              urlParams.year = data.action.year.toString();
            }
            const params = new URLSearchParams(urlParams).toString();
            setLocation(`/reports?${params}`);
          }, 800);
        }
      } else {
        toast({
          title: lang === 'ar' ? 'تم الإرسال' : 'Query Sent',
          description: lang === 'ar' ? 'تم معالجة سؤالك بنجاح' : 'Your query has been processed',
        });
        setAiQuery('');
      }
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', currentOrgId, 'ai-insights'] });
    } catch (error: any) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingQuery(false);
    }
  };

  const orgId = currentOrgId;

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/organizations', orgId, 'accounts'],
    enabled: !!orgId,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/organizations', orgId, 'transactions'],
    enabled: !!orgId,
  });

  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/organizations', orgId, 'ai-insights'],
    enabled: !!orgId,
  });

  const { data: cashFlows = [], isLoading: cashFlowsLoading } = useQuery<CashFlow[]>({
    queryKey: ['/api/organizations', orgId, 'cash-flows'],
    enabled: !!orgId,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/organizations', orgId, 'invoices'],
    enabled: !!orgId,
  });

  const isLoading = orgsLoading || accountsLoading || transactionsLoading || insightsLoading || cashFlowsLoading || invoicesLoading;

  const financialData = {
    cashBalance: accounts.filter(a => a.type === 'asset' && a.subtype === 'cash').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
    accountsReceivable: accounts.filter(a => a.subtype === 'receivable').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
    totalAssets: accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
    totalLiabilities: accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
    revenue: accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
    expenses: accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
    equity: accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0),
  };

  const netIncome = financialData.revenue - financialData.expenses;
  const netWorth = financialData.totalAssets - financialData.totalLiabilities;

  const operatingCashFlow = cashFlows
    .filter(cf => cf.type === 'operating' && !cf.isProjected)
    .reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'forecast': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Sparkles;
      case 'anomaly': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return Brain;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-amber-400';
      case 'success': return 'text-emerald-400';
      case 'critical': return 'text-red-400';
      default: return 'text-primary';
    }
  };

  const getInsightBgColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  const recentTransactions = transactions.slice(0, 5).map(tx => ({
    id: tx.id,
    description: tx.description,
    type: tx.type,
    date: tx.date,
    reference: tx.reference,
  }));

  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  const totalReceivable = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0') - parseFloat(inv.amountPaid || '0'), 0);

  const StatCard = ({ title, value, change, icon: Icon, trend, loading }: {
    title: string;
    value: number;
    change?: number;
    icon: typeof TrendingUp;
    trend?: 'up' | 'down';
    loading?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover-elevate">
        <CardContent className="p-6">
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold font-display text-foreground">
                  {formatCurrency(value, 'USD', lang)}
                </p>
              )}
              {change !== undefined && !loading && (
                <div className={`flex items-center gap-1 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-background p-4 sm:p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className={`flex items-center justify-between flex-wrap gap-4`}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-glow">
              INFERA <span className="text-accent">Finance AI</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentOrg ? (
                <>
                  {lang === 'ar' ? 'مؤسستك: ' : 'Organization: '}
                  <span className="text-primary">{currentOrg.name}</span>
                </>
              ) : (
                t.welcomeBack
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLang}
              data-testid="button-toggle-language"
            >
              <Languages className="w-5 h-5" />
            </Button>
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Globe2 className="w-3 h-3 mr-1" />
              {lang === 'ar' ? 'عربي' : 'English'}
            </Badge>
            <Badge variant="outline" className="border-accent/50 text-accent">
              {currentOrg?.subscriptionTier || 'Enterprise'}
            </Badge>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <Card className="bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/30">
          <CardContent className="p-4">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
                <Brain className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="flex-shrink-0" data-testid="button-ai-help">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm p-3 text-xs" data-testid="tooltip-ai-commands">
                      <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="font-semibold text-foreground">
                          {lang === 'ar' ? 'أوامر الذكاء الاصطناعي:' : 'AI Commands:'}
                        </p>
                        <div className="space-y-1 text-muted-foreground">
                          <p>• {lang === 'ar' ? 'افتح [صفحة] - مثال: افتح الفواتير' : 'Open [page] - e.g. open invoices'}</p>
                          <p>• {lang === 'ar' ? 'اعرض [تقرير] - مثال: اعرض الميزانية' : 'Show [report] - e.g. show balance sheet'}</p>
                          <p>• {lang === 'ar' ? 'اعرض [تقرير] [سنة] - مثال: اعرض الميزانية 2024' : 'Show [report] [year] - e.g. show balance sheet 2024'}</p>
                          <p>• {lang === 'ar' ? 'اطبع [تقرير] - مثال: اطبع قائمة الدخل' : 'Print [report] - e.g. print income statement'}</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiQuery()}
                    placeholder={t.askAI}
                    className="bg-background/50 border-border/50 focus:border-primary"
                    data-testid="input-ai-query"
                  />
                  <Button size="icon" variant="ghost" data-testid="button-voice">
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="bg-primary text-primary-foreground" 
                    data-testid="button-send-ai"
                    onClick={handleSendAiQuery}
                    disabled={isSendingQuery}
                  >
                    {isSendingQuery ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
                {aiResponse && (
                  <div className={`mt-3 p-3 rounded-lg bg-background/80 border border-primary/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap" data-testid="text-ai-response">
                        {aiResponse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard 
          title={t.cashBalance} 
          value={financialData.cashBalance} 
          change={8.2} 
          icon={Wallet} 
          trend="up"
          loading={isLoading}
        />
        <StatCard 
          title={t.revenue} 
          value={financialData.revenue} 
          change={12.5} 
          icon={TrendingUp} 
          trend="up"
          loading={isLoading}
        />
        <StatCard 
          title={t.expenses} 
          value={financialData.expenses} 
          change={3.1} 
          icon={CreditCard} 
          trend="down"
          loading={isLoading}
        />
        <StatCard 
          title={t.netIncome} 
          value={netIncome} 
          change={15.8} 
          icon={DollarSign} 
          trend="up"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}</p>
                {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-lg font-bold text-foreground">{formatCurrency(financialData.totalAssets, 'USD', lang)}</p>
                )}
              </div>
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الالتزامات' : 'Total Liabilities'}</p>
                {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-lg font-bold text-foreground">{formatCurrency(financialData.totalLiabilities, 'USD', lang)}</p>
                )}
              </div>
              <TrendingDown className="w-5 h-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'صافي الثروة' : 'Net Worth'}</p>
                {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(netWorth, 'USD', lang)}</p>
                )}
              </div>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'التدفق النقدي التشغيلي' : 'Operating Cash Flow'}</p>
                {cashFlowsLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className={`text-lg font-bold ${operatingCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(operatingCashFlow, 'USD', lang)}
                  </p>
                )}
              </div>
              <Wallet className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Sparkles className="w-5 h-5 text-primary" />
                {t.aiRecommendations}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'رؤى ذكية مدعومة بالذكاء الاصطناعي' : 'AI-powered insights for your business'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : aiInsights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {lang === 'ar' ? 'لا توجد رؤى متاحة' : 'No insights available'}
                </div>
              ) : (
                aiInsights.slice(0, 4).map((insight, index) => {
                  const InsightIcon = getInsightIcon(insight.type);
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-4 rounded-lg bg-background/50 border border-border/50 hover-elevate cursor-pointer"
                      data-testid={`card-insight-${insight.id}`}
                    >
                      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-2 rounded-lg border ${getInsightBgColor(insight.severity || 'info')}`}>
                          <InsightIcon className={`w-5 h-5 ${getInsightColor(insight.severity || 'info')}`} />
                        </div>
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <h4 className="font-semibold text-foreground">
                              {lang === 'ar' && insight.titleAr ? insight.titleAr : insight.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lang === 'ar' && insight.descriptionAr ? insight.descriptionAr : insight.description}
                          </p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Receipt className="w-5 h-5 text-accent" />
                {t.transactions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactionsLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {lang === 'ar' ? 'لا توجد معاملات' : 'No transactions'}
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className={`flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                    data-testid={`row-transaction-${tx.id}`}
                  >
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.reference}</p>
                    </div>
                    <Badge variant={tx.type === 'invoice' ? 'default' : 'secondary'}>
                      {tx.type}
                    </Badge>
                  </div>
                ))
              )}
              <Button variant="ghost" className="w-full mt-2 text-primary" data-testid="button-view-all-transactions">
                {lang === 'ar' ? 'عرض الكل' : 'View All'}
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Receipt className="w-5 h-5 text-amber-400" />
                {lang === 'ar' ? 'الفواتير المستحقة' : 'Pending Invoices'}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' 
                  ? `${pendingInvoices.length} فواتير بإجمالي ${formatCurrency(totalReceivable, 'USD', lang)}`
                  : `${pendingInvoices.length} invoices totaling ${formatCurrency(totalReceivable, 'USD', lang)}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoicesLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : pendingInvoices.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {lang === 'ar' ? 'لا توجد فواتير مستحقة' : 'No pending invoices'}
                </div>
              ) : (
                pendingInvoices.slice(0, 4).map((invoice) => (
                  <div 
                    key={invoice.id}
                    className={`flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                    data-testid={`row-invoice-${invoice.id}`}
                  >
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.dueDate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(parseFloat(invoice.total || '0'), 'USD', lang)}
                      </span>
                      <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'outline'}>
                        {invoice.status === 'overdue' 
                          ? (lang === 'ar' ? 'متأخرة' : 'Overdue')
                          : (lang === 'ar' ? 'مُرسلة' : 'Sent')
                        }
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <BarChart3 className="w-5 h-5 text-primary" />
                {lang === 'ar' ? 'ملخص الحسابات' : 'Accounts Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountsLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  ['asset', 'liability', 'revenue', 'expense'].map((type) => {
                    const typeAccounts = accounts.filter(a => a.type === type);
                    const total = typeAccounts.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
                    const typeLabels: Record<string, { en: string; ar: string }> = {
                      asset: { en: 'Assets', ar: 'الأصول' },
                      liability: { en: 'Liabilities', ar: 'الالتزامات' },
                      revenue: { en: 'Revenue', ar: 'الإيرادات' },
                      expense: { en: 'Expenses', ar: 'المصروفات' },
                    };
                    const typeColors: Record<string, string> = {
                      asset: 'bg-emerald-500',
                      liability: 'bg-amber-500',
                      revenue: 'bg-primary',
                      expense: 'bg-red-500',
                    };
                    
                    return (
                      <div key={type} className="space-y-2" data-testid={`account-summary-${type}`}>
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-medium text-foreground">
                            {lang === 'ar' ? typeLabels[type].ar : typeLabels[type].en}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {typeAccounts.length} {lang === 'ar' ? 'حسابات' : 'accounts'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${typeColors[type]} rounded-full`}
                              style={{ width: `${Math.min((total / (financialData.totalAssets || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground min-w-[100px] text-right">
                            {formatCurrency(total, 'USD', lang)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          INFERA Finance AI GlobalCloud &copy; 2026 | {t.poweredByAI}
        </p>
      </motion.div>
    </div>
  );
}
