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
import type { Contact } from "@shared/schema";

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
}

export function AddInvoiceModal({ open, onOpenChange, organizationId }: AddInvoiceModalProps) {
  const { lang, isRTL } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/organizations', organizationId, 'contacts'],
    enabled: !!organizationId && open,
  });

  const customers = contacts.filter(c => c.type === 'customer');
  const vendors = contacts.filter(c => c.type === 'vendor');

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    type: "receivable",
    customerId: "",
    vendorId: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: "",
    tax: "0",
    currency: "USD",
    notes: "",
  });

  const subtotal = parseFloat(formData.subtotal) || 0;
  const tax = parseFloat(formData.tax) || 0;
  const total = subtotal + tax;

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", `/api/organizations/${organizationId}/invoices`, {
        invoiceNumber: data.invoiceNumber,
        type: data.type,
        customerId: data.type === 'receivable' && data.customerId ? parseInt(data.customerId) : null,
        vendorId: data.type === 'payable' && data.vendorId ? parseInt(data.vendorId) : null,
        issueDate: new Date(data.issueDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
        subtotal: data.subtotal,
        tax: data.tax,
        total: total.toString(),
        currency: data.currency,
        notes: data.notes,
        status: 'draft',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', organizationId, 'invoices'] });
      toast({
        title: lang === 'ar' ? 'تم بنجاح' : 'Success',
        description: lang === 'ar' ? 'تم إنشاء الفاتورة بنجاح' : 'Invoice created successfully',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'فشل في إنشاء الفاتورة' : 'Failed to create invoice',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      type: "receivable",
      customerId: "",
      vendorId: "",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: "",
      tax: "0",
      currency: "USD",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoiceNumber.trim()) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'رقم الفاتورة مطلوب' : 'Invoice number is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.type === 'receivable' && !formData.customerId) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'يجب اختيار العميل' : 'Customer is required for receivable invoices',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.type === 'payable' && !formData.vendorId) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'يجب اختيار المورد' : 'Vendor is required for payable invoices',
        variant: 'destructive',
      });
      return;
    }
    
    if (subtotal <= 0) {
      toast({
        title: lang === 'ar' ? 'خطأ' : 'Error',
        description: lang === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر' : 'Subtotal must be greater than zero',
        variant: 'destructive',
      });
      return;
    }
    
    createMutation.mutate(formData);
  };

  const generateInvoiceNumber = () => {
    const prefix = formData.type === 'receivable' ? 'INV' : 'BILL';
    const number = `${prefix}-${Date.now().toString().slice(-6)}`;
    setFormData({ ...formData, invoiceNumber: number });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{lang === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'نوع الفاتورة' : 'Invoice Type'}</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v, customerId: "", vendorId: "" })}>
                <SelectTrigger data-testid="select-invoice-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receivable">{lang === 'ar' ? 'فاتورة مبيعات (مستحق)' : 'Sales Invoice (Receivable)'}</SelectItem>
                  <SelectItem value="payable">{lang === 'ar' ? 'فاتورة مشتريات (دائن)' : 'Purchase Bill (Payable)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-001"
                  required
                  data-testid="input-invoice-number"
                />
                <Button type="button" variant="outline" size="sm" onClick={generateInvoiceNumber} data-testid="button-generate-number">
                  {lang === 'ar' ? 'توليد' : 'Gen'}
                </Button>
              </div>
            </div>
          </div>

          {formData.type === 'receivable' ? (
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'العميل' : 'Customer'}</Label>
              <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                <SelectTrigger data-testid="select-customer">
                  <SelectValue placeholder={lang === 'ar' ? 'اختر العميل' : 'Select customer'} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'المورد' : 'Vendor'}</Label>
              <Select value={formData.vendorId} onValueChange={(v) => setFormData({ ...formData, vendorId: v })}>
                <SelectTrigger data-testid="select-vendor">
                  <SelectValue placeholder={lang === 'ar' ? 'اختر المورد' : 'Select vendor'} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</Label>
              <Input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
                data-testid="input-issue-date"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
                data-testid="input-due-date"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'المبلغ' : 'Subtotal'}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.subtotal}
                onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                placeholder="0.00"
                required
                data-testid="input-subtotal"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الضريبة' : 'Tax'}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                placeholder="0.00"
                data-testid="input-tax"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'العملة' : 'Currency'}</Label>
              <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                <SelectTrigger data-testid="select-invoice-currency">
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

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-lg font-semibold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="text-2xl font-bold text-primary">
                {formData.currency} {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={lang === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
              data-testid="input-notes"
            />
          </div>

          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-invoice">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-invoice">
              {createMutation.isPending 
                ? (lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...') 
                : (lang === 'ar' ? 'إنشاء الفاتورة' : 'Create Invoice')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
