import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ArrowRight, DollarSign, Building, Briefcase, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CashFlow } from "@shared/schema";

export default function CashFlowPage() {
  const { t, lang, isRTL } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: cashFlows = [], isLoading } = useQuery<CashFlow[]>({
    queryKey: ['/api/organizations', 1, 'cash-flows'],
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "operating",
    category: "revenue",
    amount: "",
    currency: "USD",
    description: "",
    isProjected: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/organizations/1/cash-flows", {
        date: data.date,
        type: data.type,
        category: data.category,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        isProjected: data.isProjected,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'cash-flows'] });
      toast({ title: lang === 'ar' ? 'تم بنجاح' : 'Success', description: lang === 'ar' ? 'تم إضافة التدفق النقدي' : 'Cash flow added' });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'فشل في الإضافة' : 'Failed to add', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cash-flows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'cash-flows'] });
      toast({ title: lang === 'ar' ? 'تم الحذف' : 'Deleted' });
    },
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: "operating",
      category: "revenue",
      amount: "",
      currency: "USD",
      description: "",
      isProjected: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) === 0) {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'المبلغ مطلوب' : 'Amount is required', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
  };

  const types = [
    { value: 'operating', labelEn: 'Operating', labelAr: 'تشغيلي', icon: Briefcase },
    { value: 'investing', labelEn: 'Investing', labelAr: 'استثماري', icon: TrendingUp },
    { value: 'financing', labelEn: 'Financing', labelAr: 'تمويلي', icon: Building },
  ];

  const categories = [
    { value: 'revenue', labelEn: 'Revenue', labelAr: 'إيرادات' },
    { value: 'expense', labelEn: 'Expense', labelAr: 'مصروفات' },
    { value: 'investment', labelEn: 'Investment', labelAr: 'استثمار' },
    { value: 'loan', labelEn: 'Loan', labelAr: 'قرض' },
    { value: 'dividend', labelEn: 'Dividend', labelAr: 'أرباح موزعة' },
    { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
  ];

  const operatingFlows = cashFlows.filter(cf => cf.type === 'operating');
  const investingFlows = cashFlows.filter(cf => cf.type === 'investing');
  const financingFlows = cashFlows.filter(cf => cf.type === 'financing');

  const sumFlows = (flows: CashFlow[]) => flows.reduce((sum, cf) => sum + Number(cf.amount || 0), 0);

  const operatingNet = sumFlows(operatingFlows);
  const investingNet = sumFlows(investingFlows);
  const financingNet = sumFlows(financingFlows);
  const totalNetCashFlow = operatingNet + investingNet + financingNet;

  const cashFlowData = {
    operating: {
      label: lang === 'ar' ? 'الأنشطة التشغيلية' : 'Operating Activities',
      icon: Briefcase,
      net: operatingNet,
      count: operatingFlows.length,
    },
    investing: {
      label: lang === 'ar' ? 'الأنشطة الاستثمارية' : 'Investing Activities',
      icon: TrendingUp,
      net: investingNet,
      count: investingFlows.length,
    },
    financing: {
      label: lang === 'ar' ? 'الأنشطة التمويلية' : 'Financing Activities',
      icon: Building,
      net: financingNet,
      count: financingFlows.length,
    },
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t.cashFlow}</h1>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'تحليل التدفقات النقدية' : 'Cash Flow Analysis'}
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-cash-flow">
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'ar' ? 'إضافة تدفق' : 'Add Flow'}
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'صافي التدفق النقدي' : 'Net Cash Flow'}
              </p>
              <p className={`text-3xl font-bold ${totalNetCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalNetCashFlow, 'USD', lang)}
              </p>
            </div>
            <div className={`p-4 rounded-full ${totalNetCashFlow >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {totalNetCashFlow >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {Object.entries(cashFlowData).map(([key, data]) => (
          <Card key={key} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <data.icon className="w-5 h-5 text-primary" />
                {data.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{lang === 'ar' ? 'الصافي' : 'Net'}</span>
                </div>
                <span className={`font-bold ${data.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(data.net, 'USD', lang)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {data.count} {lang === 'ar' ? 'تدفقات مسجلة' : 'recorded flows'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            {lang === 'ar' ? 'التدفقات النقدية المسجلة' : 'Recorded Cash Flows'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashFlows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{lang === 'ar' ? 'لا توجد تدفقات نقدية' : 'No cash flows yet'}</p>
              <p className="text-sm">{lang === 'ar' ? 'أضف تدفقًا للبدء' : 'Add a flow to get started'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cashFlows.map((cf) => {
                const typeInfo = types.find(t => t.value === cf.type) || types[0];
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={cf.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover-elevate"
                    data-testid={`cashflow-row-${cf.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <TypeIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{cf.description || cf.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {lang === 'ar' ? typeInfo.labelAr : typeInfo.labelEn} • {new Date(cf.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${Number(cf.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(Number(cf.amount), cf.currency || 'USD', lang)}
                      </span>
                      {cf.isProjected && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {lang === 'ar' ? 'متوقع' : 'Projected'}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(cf.id)}
                        data-testid={`button-delete-${cf.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className={`max-w-lg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{lang === 'ar' ? 'إضافة تدفق نقدي' : 'Add Cash Flow'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'النوع' : 'Type'}</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {lang === 'ar' ? t.labelAr : t.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'الفئة' : 'Category'}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {lang === 'ar' ? c.labelAr : c.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'المبلغ' : 'Amount'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder={lang === 'ar' ? 'موجب للداخل، سالب للخارج' : 'Positive for inflow, negative for outflow'}
                  data-testid="input-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'العملة' : 'Currency'}</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                data-testid="input-description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                {createMutation.isPending ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
