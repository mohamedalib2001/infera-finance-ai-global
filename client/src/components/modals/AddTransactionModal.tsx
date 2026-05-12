import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useI18n } from "@/lib/i18n-context";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Account } from "@shared/schema";

interface TransactionLine {
  accountId: number;
  debit: string;
  credit: string;
  memo: string;
}

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
}

export function AddTransactionModal({ open, onOpenChange, organizationId }: AddTransactionModalProps) {
  const { lang, isRTL } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/organizations', organizationId, 'accounts'],
    enabled: !!organizationId && open,
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    reference: "",
    type: "invoice",
    status: "posted",
  });

  const [lines, setLines] = useState<TransactionLine[]>([
    { accountId: 0, debit: "", credit: "", memo: "" },
    { accountId: 0, debit: "", credit: "", memo: "" },
  ]);

  const validLines = lines.filter(l => l.accountId > 0 && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0));
  const uniqueAccounts = new Set(validLines.map(l => l.accountId));
  const totalDebit = validLines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = validLines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const hasValidDoubleEntry = validLines.every(l => {
    const debit = parseFloat(l.debit) || 0;
    const credit = parseFloat(l.credit) || 0;
    return (debit > 0 && credit === 0) || (credit > 0 && debit === 0);
  });
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0 && 
                     validLines.length >= 2 && uniqueAccounts.size >= 2 && hasValidDoubleEntry;

  const createMutation = useMutation({
    mutationFn: async (data: { formData: typeof formData; lines: TransactionLine[] }) => {
      const response = await apiRequest("POST", `/api/organizations/${organizationId}/transactions`, {
        ...data.formData,
        date: new Date(data.formData.date).toISOString(),
        lines: data.lines.filter(l => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', organizationId, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', organizationId, 'accounts'] });
      toast({
        title: lang === 'ar' ? 'تم بنجاح' : 'Success',
        description: lang === 'ar' ? 'تم إنشاء القيد بنجاح' : 'Journal entry created successfully',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'فشل في إنشاء القيد' : 'Failed to create journal entry',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      reference: "",
      type: "invoice",
      status: "posted",
    });
    setLines([
      { accountId: 0, debit: "", credit: "", memo: "" },
      { accountId: 0, debit: "", credit: "", memo: "" },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'الوصف مطلوب' : 'Description is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (validLines.length < 2) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'يجب إدخال سطرين على الأقل بحسابات صالحة' : 'At least 2 valid lines with accounts are required',
        variant: 'destructive',
      });
      return;
    }
    
    if (uniqueAccounts.size < 2) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'يجب استخدام حسابين مختلفين على الأقل' : 'At least 2 different accounts are required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!hasValidDoubleEntry) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'كل سطر يجب أن يحتوي على مدين أو دائن فقط، وليس كليهما' : 'Each line must have either debit OR credit, not both',
        variant: 'destructive',
      });
      return;
    }
    
    if (Math.abs(totalDebit - totalCredit) >= 0.01 || totalDebit === 0) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'القيد غير متوازن - المدين يجب أن يساوي الدائن' : 'Entry is not balanced - debits must equal credits',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate({ formData, lines: validLines });
  };

  const addLine = () => {
    setLines([...lines, { accountId: 0, debit: "", credit: "", memo: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof TransactionLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const transactionTypes = [
    { value: 'invoice', labelEn: 'Invoice', labelAr: 'فاتورة' },
    { value: 'payment', labelEn: 'Payment', labelAr: 'دفعة' },
    { value: 'transfer', labelEn: 'Transfer', labelAr: 'تحويل' },
    { value: 'expense', labelEn: 'Expense', labelAr: 'مصروف' },
    { value: 'adjustment', labelEn: 'Adjustment', labelAr: 'تسوية' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{lang === 'ar' ? 'إضافة قيد يومي جديد' : 'Add New Journal Entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                data-testid="input-tx-date"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'المرجع' : 'Reference'}</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="JE-001"
                data-testid="input-tx-reference"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'النوع' : 'Type'}</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger data-testid="select-tx-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {lang === 'ar' ? type.labelAr : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الحالة' : 'Status'}</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger data-testid="select-tx-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                  <SelectItem value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                  <SelectItem value="posted">{lang === 'ar' ? 'مُرحّل' : 'Posted'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'الوصف' : 'Description'}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={lang === 'ar' ? 'وصف القيد...' : 'Entry description...'}
              required
              data-testid="input-tx-description"
            />
          </div>

          <div className="space-y-2">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label>{lang === 'ar' ? 'بنود القيد' : 'Entry Lines'}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine} data-testid="button-add-line">
                <Plus className="w-4 h-4" />
                {lang === 'ar' ? 'إضافة سطر' : 'Add Line'}
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className={`grid grid-cols-12 gap-2 p-3 bg-muted/50 text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                <div className="col-span-4">{lang === 'ar' ? 'الحساب' : 'Account'}</div>
                <div className="col-span-2">{lang === 'ar' ? 'مدين' : 'Debit'}</div>
                <div className="col-span-2">{lang === 'ar' ? 'دائن' : 'Credit'}</div>
                <div className="col-span-3">{lang === 'ar' ? 'ملاحظة' : 'Memo'}</div>
                <div className="col-span-1"></div>
              </div>
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                  <div className="col-span-4">
                    <Select 
                      value={line.accountId.toString()} 
                      onValueChange={(v) => updateLine(index, 'accountId', parseInt(v))}
                    >
                      <SelectTrigger data-testid={`select-line-account-${index}`}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر حساب' : 'Select account'} />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()}>
                            {acc.code} - {lang === 'ar' && acc.nameAr ? acc.nameAr : acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit}
                      onChange={(e) => updateLine(index, 'debit', e.target.value)}
                      placeholder="0.00"
                      className="text-emerald-500"
                      data-testid={`input-line-debit-${index}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit}
                      onChange={(e) => updateLine(index, 'credit', e.target.value)}
                      placeholder="0.00"
                      className="text-red-500"
                      data-testid={`input-line-credit-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={line.memo}
                      onChange={(e) => updateLine(index, 'memo', e.target.value)}
                      placeholder={lang === 'ar' ? 'ملاحظة' : 'Memo'}
                      data-testid={`input-line-memo-${index}`}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 2}
                      data-testid={`button-remove-line-${index}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className={`grid grid-cols-12 gap-2 p-3 border-t bg-muted/30 font-semibold ${isRTL ? 'text-right' : ''}`}>
                <div className="col-span-4">{lang === 'ar' ? 'الإجمالي' : 'Total'}</div>
                <div className="col-span-2 text-emerald-500">{totalDebit.toFixed(2)}</div>
                <div className="col-span-2 text-red-500">{totalCredit.toFixed(2)}</div>
                <div className="col-span-4 flex items-center gap-2">
                  {isBalanced ? (
                    <span className="flex items-center gap-1 text-emerald-500 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === 'ar' ? 'متوازن' : 'Balanced'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {lang === 'ar' ? 'غير متوازن' : 'Not Balanced'} ({Math.abs(totalDebit - totalCredit).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-tx">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !isBalanced} data-testid="button-submit-tx">
              {createMutation.isPending 
                ? (lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...') 
                : (lang === 'ar' ? 'إنشاء القيد' : 'Create Entry')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
