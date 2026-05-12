import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet, TrendingUp, TrendingDown, Building, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { AddAccountModal } from "@/components/modals/AddAccountModal";
import type { Account, Organization } from "@shared/schema";

export default function Accounts() {
  const { t, lang, isRTL } = useI18n();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const orgId = organizations[0]?.id;

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/organizations', orgId, 'accounts'],
    enabled: !!orgId,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'asset': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'liability': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'equity': return <Building className="w-4 h-4 text-blue-500" />;
      case 'revenue': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'expense': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-green-500/20 text-green-400 border-green-500/30',
      liability: 'bg-red-500/20 text-red-400 border-red-500/30',
      equity: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      revenue: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      expense: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const labels: Record<string, string> = lang === 'ar' 
      ? { asset: 'أصل', liability: 'التزام', equity: 'حقوق ملكية', revenue: 'إيراد', expense: 'مصروف' }
      : { asset: 'Asset', liability: 'Liability', equity: 'Equity', revenue: 'Revenue', expense: 'Expense' };
    return (
      <Badge variant="outline" className={colors[type] || ''}>
        {labels[type] || type}
      </Badge>
    );
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    const type = account.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  const typeLabels: Record<string, string> = lang === 'ar'
    ? { asset: 'الأصول', liability: 'الالتزامات', equity: 'حقوق الملكية', revenue: 'الإيرادات', expense: 'المصروفات' }
    : { asset: 'Assets', liability: 'Liabilities', equity: 'Equity', revenue: 'Revenue', expense: 'Expenses' };

  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalEquity = accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalRevenue = accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalExpenses = accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);

  return (
    <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-2xl font-bold">{t.accounts}</h1>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'دليل الحسابات المحاسبية' : 'Chart of Accounts'}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-account">
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {lang === 'ar' ? 'حساب جديد' : 'New Account'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الأصول' : 'Assets'}</p>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalAssets, 'USD', lang)}</p>
                )}
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الالتزامات' : 'Liabilities'}</p>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                  <p className="text-lg font-bold text-red-400">{formatCurrency(totalLiabilities, 'USD', lang)}</p>
                )}
              </div>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'حقوق الملكية' : 'Equity'}</p>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(totalEquity, 'USD', lang)}</p>
                )}
              </div>
              <Building className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الإيرادات' : 'Revenue'}</p>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                  <p className="text-lg font-bold text-primary">{formatCurrency(totalRevenue, 'USD', lang)}</p>
                )}
              </div>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المصروفات' : 'Expenses'}</p>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(totalExpenses, 'USD', lang)}</p>
                )}
              </div>
              <TrendingDown className="w-5 h-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
          <Card key={type} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getTypeIcon(type)}
                {typeLabels[type] || type}
                <Badge variant="secondary" className="ml-2">{typeAccounts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover-elevate cursor-pointer"
                    data-testid={`account-row-${account.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">{account.code}</span>
                      <span className="font-medium">
                        {lang === 'ar' && account.nameAr ? account.nameAr : account.name}
                      </span>
                      {getTypeBadge(account.type)}
                    </div>
                    <span className={`font-semibold ${
                      type === 'asset' || type === 'revenue' ? 'text-green-500' : 
                      type === 'liability' || type === 'expense' ? 'text-red-500' : ''
                    }`}>
                      {formatCurrency(Number(account.balance) || 0, account.currency || 'USD', lang)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orgId && (
        <AddAccountModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          organizationId={orgId}
        />
      )}
    </div>
  );
}
