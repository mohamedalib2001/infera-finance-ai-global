import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, PiggyBank, Target, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Budget } from "@shared/schema";

export default function Budgets() {
  const { t, lang, isRTL } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ['/api/organizations', 1, 'budgets'],
  });

  const [formData, setFormData] = useState({
    name: "",
    fiscalYear: new Date().getFullYear().toString(),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount: "",
    currency: "USD",
    status: "active",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/organizations/1/budgets", {
        name: data.name,
        fiscalYear: parseInt(data.fiscalYear),
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: data.status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'budgets'] });
      toast({ title: lang === 'ar' ? 'تم بنجاح' : 'Success', description: lang === 'ar' ? 'تم إنشاء الميزانية' : 'Budget created' });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'فشل في الإنشاء' : 'Failed to create', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'budgets'] });
      toast({ title: lang === 'ar' ? 'تم الحذف' : 'Deleted' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      fiscalYear: new Date().getFullYear().toString(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: "",
      currency: "USD",
      status: "active",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'اسم الميزانية مطلوب' : 'Budget name is required', variant: 'destructive' });
      return;
    }
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر' : 'Amount must be greater than zero', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    const labels: Record<string, string> = lang === 'ar'
      ? { draft: 'مسودة', active: 'نشط', closed: 'مغلق' }
      : { draft: 'Draft', active: 'Active', closed: 'Closed' };
    return (
      <Badge variant="outline" className={colors[status || 'draft'] || ''}>
        {labels[status || 'draft'] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  const activeBudgets = budgets.filter(b => b.status === 'active').length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t.budgets}</h1>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'تخطيط ومتابعة الميزانيات' : 'Budget Planning & Tracking'}
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-budget">
          <Plus className="w-4 h-4 mr-2" />
          {t.create}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PiggyBank className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{budgets.length}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي الميزانيات' : 'Total Budgets'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeBudgets}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'ميزانيات نشطة' : 'Active Budgets'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PiggyBank className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget, 'USD', lang)}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي المبالغ' : 'Total Amount'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            {lang === 'ar' ? 'الميزانيات المسجلة' : 'Recorded Budgets'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{lang === 'ar' ? 'لا توجد ميزانيات' : 'No budgets yet'}</p>
              <p className="text-sm">{lang === 'ar' ? 'أضف ميزانية للبدء' : 'Add a budget to get started'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50 hover-elevate gap-2 sm:gap-0"
                  data-testid={`budget-row-${budget.id}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Target className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{budget.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {lang === 'ar' ? 'السنة المالية: ' : 'Fiscal Year: '}{budget.fiscalYear}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
                    <span className="font-semibold text-sm sm:text-base">
                      {formatCurrency(Number(budget.totalAmount) || 0, budget.currency || 'USD', lang)}
                    </span>
                    {getStatusBadge(budget.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(budget.id)}
                      data-testid={`button-delete-${budget.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className={`max-w-lg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{lang === 'ar' ? 'إنشاء ميزانية جديدة' : 'Create New Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'اسم الميزانية' : 'Budget Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={lang === 'ar' ? 'مثال: ميزانية التشغيل' : 'e.g., Operating Budget'}
                data-testid="input-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'السنة المالية' : 'Fiscal Year'}</Label>
                <Select value={formData.fiscalYear} onValueChange={(v) => setFormData({ ...formData, fiscalYear: v })}>
                  <SelectTrigger data-testid="select-fiscal-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'الحالة' : 'Status'}</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                    <SelectItem value="active">{lang === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                    <SelectItem value="closed">{lang === 'ar' ? 'مغلق' : 'Closed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  data-testid="input-end-date"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="0.00"
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
