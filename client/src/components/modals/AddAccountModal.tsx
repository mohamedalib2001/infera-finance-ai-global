import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useI18n } from "@/lib/i18n-context";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
}

export function AddAccountModal({ open, onOpenChange, organizationId }: AddAccountModalProps) {
  const { lang, isRTL } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameAr: "",
    type: "asset",
    subtype: "",
    currency: "USD",
    balance: "0",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", `/api/organizations/${organizationId}/accounts`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', organizationId, 'accounts'] });
      toast({
        title: lang === 'ar' ? 'تم بنجاح' : 'Success',
        description: lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully',
      });
      onOpenChange(false);
      setFormData({ code: "", name: "", nameAr: "", type: "asset", subtype: "", currency: "USD", balance: "0" });
    },
    onError: () => {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'فشل في إنشاء الحساب' : 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'رقم الحساب مطلوب' : 'Account code is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.name.trim()) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'اسم الحساب مطلوب' : 'Account name is required',
        variant: 'destructive',
      });
      return;
    }
    
    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'الرصيد يجب أن يكون رقماً صحيحاً' : 'Balance must be a valid number',
        variant: 'destructive',
      });
      return;
    }
    
    createMutation.mutate(formData);
  };

  const accountTypes = [
    { value: 'asset', labelEn: 'Asset', labelAr: 'أصل' },
    { value: 'liability', labelEn: 'Liability', labelAr: 'التزام' },
    { value: 'equity', labelEn: 'Equity', labelAr: 'حقوق ملكية' },
    { value: 'revenue', labelEn: 'Revenue', labelAr: 'إيراد' },
    { value: 'expense', labelEn: 'Expense', labelAr: 'مصروف' },
  ];

  const subtypes: Record<string, Array<{ value: string; labelEn: string; labelAr: string }>> = {
    asset: [
      { value: 'cash', labelEn: 'Cash', labelAr: 'نقدي' },
      { value: 'bank', labelEn: 'Bank', labelAr: 'بنك' },
      { value: 'receivable', labelEn: 'Receivable', labelAr: 'مستحقات' },
      { value: 'inventory', labelEn: 'Inventory', labelAr: 'مخزون' },
      { value: 'fixed', labelEn: 'Fixed Asset', labelAr: 'أصل ثابت' },
    ],
    liability: [
      { value: 'payable', labelEn: 'Payable', labelAr: 'دائنون' },
      { value: 'loan', labelEn: 'Loan', labelAr: 'قرض' },
      { value: 'tax', labelEn: 'Tax Payable', labelAr: 'ضرائب مستحقة' },
    ],
    equity: [
      { value: 'capital', labelEn: 'Capital', labelAr: 'رأس المال' },
      { value: 'retained', labelEn: 'Retained Earnings', labelAr: 'أرباح محتجزة' },
    ],
    revenue: [
      { value: 'sales', labelEn: 'Sales', labelAr: 'مبيعات' },
      { value: 'service', labelEn: 'Service Revenue', labelAr: 'إيرادات خدمات' },
      { value: 'interest', labelEn: 'Interest Income', labelAr: 'فوائد دائنة' },
    ],
    expense: [
      { value: 'operating', labelEn: 'Operating', labelAr: 'تشغيلي' },
      { value: 'salary', labelEn: 'Salaries', labelAr: 'رواتب' },
      { value: 'rent', labelEn: 'Rent', labelAr: 'إيجار' },
      { value: 'utilities', labelEn: 'Utilities', labelAr: 'مرافق' },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{lang === 'ar' ? 'إضافة حساب جديد' : 'Add New Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'رقم الحساب' : 'Account Code'}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="1000"
                required
                data-testid="input-account-code"
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
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'اسم الحساب (إنجليزي)' : 'Account Name (English)'}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Cash"
              required
              data-testid="input-account-name"
            />
          </div>

          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'اسم الحساب (عربي)' : 'Account Name (Arabic)'}</Label>
            <Input
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="نقدية"
              dir="rtl"
              data-testid="input-account-name-ar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'نوع الحساب' : 'Account Type'}</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v, subtype: '' })}>
                <SelectTrigger data-testid="select-account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {lang === 'ar' ? type.labelAr : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'التصنيف الفرعي' : 'Subtype'}</Label>
              <Select value={formData.subtype} onValueChange={(v) => setFormData({ ...formData, subtype: v })}>
                <SelectTrigger data-testid="select-subtype">
                  <SelectValue placeholder={lang === 'ar' ? 'اختياري' : 'Optional'} />
                </SelectTrigger>
                <SelectContent>
                  {subtypes[formData.type]?.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {lang === 'ar' ? sub.labelAr : sub.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance'}</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              data-testid="input-opening-balance"
            />
          </div>

          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-account">
              {createMutation.isPending 
                ? (lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...') 
                : (lang === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
