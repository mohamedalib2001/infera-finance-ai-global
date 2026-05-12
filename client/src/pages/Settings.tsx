import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  User, 
  Building, 
  Globe, 
  Bell, 
  Shield, 
  Palette,
  Languages,
  Moon,
  Sun,
  CreditCard,
  Database,
  ExternalLink,
  Check,
  X
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useTheme } from "@/components/theme-provider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface SubscriptionStatus {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  features: {
    maxOrganizations: number;
    maxTransactionsPerMonth: number;
    reports: string;
    aiInsights: boolean;
    multiCurrency: boolean;
    apiAccess: boolean;
    periodClosing: boolean;
    auditLogs: boolean;
    sso?: boolean;
    dedicatedSupport?: boolean;
  };
}

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
  });

  const manageBillingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/stripe/create-portal-session', {});
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
  });

  const getPlanName = (plan: string) => {
    const names: Record<string, { en: string; ar: string }> = {
      free: { en: 'Free', ar: 'مجاني' },
      starter: { en: 'Starter', ar: 'المبتدئ' },
      professional: { en: 'Professional', ar: 'المحترف' },
      enterprise: { en: 'Enterprise', ar: 'المؤسسات' },
    };
    return names[plan]?.[lang] || plan;
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      case 'starter': return 'outline';
      default: return 'outline';
    }
  };

  const settingSections = [
    {
      title: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
      description: lang === 'ar' ? 'إدارة معلومات حسابك' : 'Manage your account information',
      icon: User,
      items: [
        { label: lang === 'ar' ? 'الاسم' : 'Name', value: 'Admin User' },
        { label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: 'admin@infera.ai' },
        { label: lang === 'ar' ? 'الدور' : 'Role', value: lang === 'ar' ? 'مدير النظام' : 'Super Admin' },
      ],
    },
    {
      title: lang === 'ar' ? 'المؤسسة' : 'Organization',
      description: lang === 'ar' ? 'إعدادات المؤسسة والشركة' : 'Company and organization settings',
      icon: Building,
      items: [
        { label: lang === 'ar' ? 'اسم الشركة' : 'Company Name', value: 'INFERA Demo Corp' },
        { label: lang === 'ar' ? 'البلد' : 'Country', value: lang === 'ar' ? 'الإمارات' : 'UAE' },
        { label: lang === 'ar' ? 'القطاع' : 'Industry', value: lang === 'ar' ? 'التكنولوجيا' : 'Technology' },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t.settings}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === 'ar' ? 'إدارة إعدادات التطبيق والحساب' : 'Manage application and account settings'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {settingSections.map((section, idx) => (
          <Card key={idx} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className="w-5 h-5 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, iidx) => (
                <div key={iidx} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full" data-testid={`button-edit-${section.title.toLowerCase()}`}>
                {t.edit}
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'المظهر' : 'Appearance'}
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'تخصيص مظهر التطبيق' : 'Customize the application appearance'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>{lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                data-testid="switch-dark-mode"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-background/50 gap-2">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5" />
                <span>{lang === 'ar' ? 'اللغة' : 'Language'}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={lang === 'en' ? 'default' : 'outline'}
                  onClick={() => setLang('en')}
                  data-testid="button-lang-en"
                >
                  English
                </Button>
                <Button
                  size="sm"
                  variant={lang === 'ar' ? 'default' : 'outline'}
                  onClick={() => setLang('ar')}
                  data-testid="button-lang-ar"
                >
                  العربية
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'إدارة تفضيلات الإشعارات' : 'Manage notification preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span>{lang === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</span>
              <Switch defaultChecked data-testid="switch-email-notifications" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span>{lang === 'ar' ? 'تنبيهات الذكاء الاصطناعي' : 'AI Alerts'}</span>
              <Switch defaultChecked data-testid="switch-ai-alerts" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span>{lang === 'ar' ? 'التقارير الأسبوعية' : 'Weekly Reports'}</span>
              <Switch data-testid="switch-weekly-reports" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'الأمان' : 'Security'}
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'إعدادات الأمان والخصوصية' : 'Security and privacy settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span>{lang === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                {lang === 'ar' ? 'مفعّل' : 'Enabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span>{lang === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}</span>
              <span className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'اليوم، 10:30 ص' : 'Today, 10:30 AM'}
              </span>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-change-password">
              {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'خطة الاشتراك' : 'Subscription Plan'}
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? 'إدارة اشتراكك والفوترة' : 'Manage your subscription and billing'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {lang === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.status === 'active' 
                      ? (lang === 'ar' ? 'نشط' : 'Active')
                      : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </p>
                </div>
              </div>
              <Badge variant={getPlanBadgeVariant(subscription?.plan || 'free')}>
                {getPlanName(subscription?.plan || 'free')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-background/50 text-center">
                <div className="text-2xl font-bold text-primary">
                  {subscription?.features.maxOrganizations === -1 ? '∞' : subscription?.features.maxOrganizations || 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'المنظمات' : 'Organizations'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 text-center">
                <div className="text-2xl font-bold text-primary">
                  {subscription?.features.maxTransactionsPerMonth === -1 ? '∞' : subscription?.features.maxTransactionsPerMonth || 100}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'المعاملات/شهر' : 'Transactions/mo'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 text-center">
                {subscription?.features.aiInsights ? (
                  <Check className="w-6 h-6 text-green-500 mx-auto" />
                ) : (
                  <X className="w-6 h-6 text-muted-foreground mx-auto" />
                )}
                <div className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'تحليلات الذكاء' : 'AI Insights'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 text-center">
                {subscription?.features.apiAccess ? (
                  <Check className="w-6 h-6 text-green-500 mx-auto" />
                ) : (
                  <X className="w-6 h-6 text-muted-foreground mx-auto" />
                )}
                <div className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'واجهة API' : 'API Access'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link href="/pricing">
                <Button variant="outline" data-testid="button-upgrade-plan">
                  <ExternalLink className="w-4 h-4 me-2" />
                  {subscription?.plan === 'free' 
                    ? (lang === 'ar' ? 'ترقية الخطة' : 'Upgrade Plan')
                    : (lang === 'ar' ? 'تغيير الخطة' : 'Change Plan')}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => manageBillingMutation.mutate()}
                disabled={manageBillingMutation.isPending}
                data-testid="button-manage-billing"
              >
                {lang === 'ar' ? 'إدارة الفوترة' : 'Manage Billing'}
              </Button>
              <Link href="/payment-gateways">
                <Button variant="outline" data-testid="button-payment-gateways">
                  <CreditCard className="w-4 h-4 me-2" />
                  {lang === 'ar' ? 'بوابات الدفع' : 'Payment Gateways'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
