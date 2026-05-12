import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, DollarSign, Send, Clock, AlertCircle, CheckCircle2, ChevronRight, Calendar, Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { AddInvoiceModal } from "@/components/modals/AddInvoiceModal";
import type { Invoice, Organization, Contact } from "@shared/schema";

export default function Invoices() {
  const { t, lang, isRTL } = useI18n();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const orgId = organizations[0]?.id;

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/organizations', orgId, 'invoices'],
    enabled: !!orgId,
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/organizations', orgId, 'contacts'],
    enabled: !!orgId,
  });

  const getContactName = (customerId?: number | null, vendorId?: number | null) => {
    const contactId = customerId || vendorId;
    if (!contactId) return lang === 'ar' ? 'غير محدد' : 'Unknown';
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || `#${contactId}`;
  };

  const receivables = invoices.filter(inv => inv.type === 'receivable');
  const payables = invoices.filter(inv => inv.type === 'payable');

  const totalOutstanding = receivables
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.total || '0') - parseFloat(inv.amountPaid || '0'), 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.total || '0') - parseFloat(inv.amountPaid || '0'), 0);

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground border-border',
      sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      cancelled: 'bg-muted text-muted-foreground border-border',
    };
    const labels: Record<string, string> = lang === 'ar'
      ? { draft: 'مسودة', sent: 'مُرسل', paid: 'مدفوع', overdue: 'متأخر', cancelled: 'ملغي' }
      : { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled' };
    return (
      <Badge variant="outline" className={colors[status || 'draft'] || ''}>
        {labels[status || 'draft'] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'sent': return <Send className="w-5 h-5 text-blue-400" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-2xl font-bold">{t.invoices}</h1>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'إدارة الفواتير والمستحقات' : 'Invoice & Receivables Management'}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-invoice">
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {lang === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الفواتير' : 'Total Invoices'}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-xl font-bold">{invoices.length}</p>
                )}
              </div>
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المستحقات' : 'Outstanding'}</p>
                {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-xl font-bold text-blue-400">{formatCurrency(totalOutstanding, 'USD', lang)}</p>
                )}
              </div>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المدفوعة' : 'Paid'}</p>
                {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalPaid, 'USD', lang)}</p>
                )}
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المتأخرة' : 'Overdue'}</p>
                {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-xl font-bold text-red-400">{formatCurrency(totalOverdue, 'USD', lang)}</p>
                )}
              </div>
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Send className="w-5 h-5 text-emerald-400" />
              {lang === 'ar' ? 'فواتير العملاء (مستحقات)' : 'Customer Invoices (Receivables)'}
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? `${receivables.length} فاتورة` : `${receivables.length} invoices`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : receivables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{lang === 'ar' ? 'لا توجد فواتير عملاء' : 'No customer invoices'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {receivables.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`flex items-center justify-between p-4 rounded-lg bg-background/50 hover-elevate cursor-pointer border border-transparent hover:border-primary/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                    data-testid={`invoice-row-${invoice.id}`}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getStatusIcon(invoice.status)}
                      <div className={`flex flex-col ${isRTL ? 'text-right' : ''}`}>
                        <span className="font-medium">#{invoice.invoiceNumber}</span>
                        <div className={`flex items-center gap-1 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="w-3 h-3" />
                          <span>{getContactName(invoice.customerId)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex flex-col ${isRTL ? 'text-left' : 'text-right'}`}>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(invoice.total || '0'), invoice.currency || 'USD', lang)}
                        </span>
                        <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(invoice.dueDate, lang)}
                        </span>
                      </div>
                      {getStatusBadge(invoice.status)}
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <DollarSign className="w-5 h-5 text-amber-400" />
              {lang === 'ar' ? 'فواتير الموردين (دائنون)' : 'Vendor Bills (Payables)'}
            </CardTitle>
            <CardDescription>
              {lang === 'ar' ? `${payables.length} فاتورة` : `${payables.length} bills`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : payables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{lang === 'ar' ? 'لا توجد فواتير موردين' : 'No vendor bills'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payables.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`flex items-center justify-between p-4 rounded-lg bg-background/50 hover-elevate cursor-pointer border border-transparent hover:border-primary/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                    data-testid={`bill-row-${invoice.id}`}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getStatusIcon(invoice.status)}
                      <div className={`flex flex-col ${isRTL ? 'text-right' : ''}`}>
                        <span className="font-medium">#{invoice.invoiceNumber}</span>
                        <div className={`flex items-center gap-1 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="w-3 h-3" />
                          <span>{getContactName(undefined, invoice.vendorId)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex flex-col ${isRTL ? 'text-left' : 'text-right'}`}>
                        <span className="font-semibold text-amber-400">
                          -{formatCurrency(parseFloat(invoice.total || '0'), invoice.currency || 'USD', lang)}
                        </span>
                        <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(invoice.dueDate, lang)}
                        </span>
                      </div>
                      {getStatusBadge(invoice.status)}
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {orgId && (
        <AddInvoiceModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          organizationId={orgId}
        />
      )}
    </div>
  );
}
