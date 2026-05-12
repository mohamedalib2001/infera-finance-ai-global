import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowLeftRight, FileText, ChevronRight, Calendar, Hash, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { AddTransactionModal } from "@/components/modals/AddTransactionModal";
import type { Transaction, Organization, TransactionLine, Account } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Transactions() {
  const { t, lang, isRTL } = useI18n();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const orgId = organizations[0]?.id;

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/organizations', orgId, 'transactions'],
    enabled: !!orgId,
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/organizations', orgId, 'accounts'],
    enabled: !!orgId,
  });

  const { data: txDetails } = useQuery<Transaction & { lines: TransactionLine[] }>({
    queryKey: ['/api/transactions', selectedTx?.id],
    enabled: !!selectedTx,
  });

  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return `Account #${accountId}`;
    return lang === 'ar' && account.nameAr ? account.nameAr : account.name;
  };

  const getAccountCode = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.code || '';
  };

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      posted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      draft: 'bg-muted text-muted-foreground border-border',
      voided: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels: Record<string, string> = lang === 'ar'
      ? { posted: 'مُرحّل', pending: 'قيد الانتظار', draft: 'مسودة', voided: 'ملغي' }
      : { posted: 'Posted', pending: 'Pending', draft: 'Draft', voided: 'Voided' };
    return (
      <Badge variant="outline" className={colors[status || 'draft'] || ''}>
        {labels[status || 'draft'] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      invoice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      payment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      transfer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      expense: 'bg-red-500/20 text-red-400 border-red-500/30',
      adjustment: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const labels: Record<string, string> = lang === 'ar'
      ? { invoice: 'فاتورة', payment: 'دفعة', transfer: 'تحويل', expense: 'مصروف', adjustment: 'تسوية' }
      : { invoice: 'Invoice', payment: 'Payment', transfer: 'Transfer', expense: 'Expense', adjustment: 'Adjustment' };
    return (
      <Badge variant="outline" className={colors[type] || ''}>
        {labels[type] || type}
      </Badge>
    );
  };

  return (
    <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-2xl font-bold">{t.transactions}</h1>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'القيود اليومية والمعاملات المالية' : 'Journal Entries & Financial Transactions'}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-transaction">
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {lang === 'ar' ? 'قيد جديد' : 'New Entry'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي القيود' : 'Total Entries'}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-xl font-bold">{transactions.length}</p>
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
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'مُرحّلة' : 'Posted'}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-xl font-bold text-emerald-400">
                    {transactions.filter(tx => tx.status === 'posted').length}
                  </p>
                )}
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-xl font-bold text-amber-400">
                    {transactions.filter(tx => tx.status === 'pending' || tx.status === 'draft').length}
                  </p>
                )}
              </div>
              <ArrowDownLeft className="w-5 h-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            {lang === 'ar' ? 'دفتر اليومية' : 'Journal Ledger'}
          </CardTitle>
          <CardDescription>
            {lang === 'ar' ? 'القيود المحاسبية بنظام القيد المزدوج' : 'Double-entry accounting journal entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{lang === 'ar' ? 'لا توجد قيود محاسبية بعد' : 'No journal entries yet'}</p>
              <Button variant="outline" className="mt-4" data-testid="button-add-first-transaction">
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {lang === 'ar' ? 'إضافة أول قيد' : 'Add First Entry'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`flex items-center justify-between p-4 rounded-lg bg-background/50 hover-elevate cursor-pointer border border-transparent hover:border-primary/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                  data-testid={`transaction-row-${tx.id}`}
                >
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className={`flex flex-col ${isRTL ? 'text-right' : ''}`}>
                      <span className="font-medium">{tx.description}</span>
                      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {tx.reference && (
                          <>
                            <Hash className="w-3 h-3" />
                            <span>{tx.reference}</span>
                            <span>•</span>
                          </>
                        )}
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tx.date, lang)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {getTypeBadge(tx.type)}
                    {getStatusBadge(tx.status)}
                    <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FileText className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'تفاصيل القيد' : 'Journal Entry Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedTx?.reference && `#${selectedTx.reference} • `}
              {selectedTx && formatDate(selectedTx.date, lang)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium">{selectedTx.description}</p>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {getTypeBadge(selectedTx.type)}
                  {getStatusBadge(selectedTx.status)}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className={`grid grid-cols-4 gap-4 p-3 bg-muted/50 font-medium text-sm ${isRTL ? 'text-right' : ''}`}>
                  <div>{lang === 'ar' ? 'الحساب' : 'Account'}</div>
                  <div>{lang === 'ar' ? 'البيان' : 'Description'}</div>
                  <div className="text-right">{lang === 'ar' ? 'مدين' : 'Debit'}</div>
                  <div className="text-right">{lang === 'ar' ? 'دائن' : 'Credit'}</div>
                </div>
                
                {txDetails?.lines && txDetails.lines.length > 0 ? (
                  <>
                    {txDetails.lines.map((line, idx) => (
                      <div key={line.id} className={`grid grid-cols-4 gap-4 p-3 border-t ${isRTL ? 'text-right' : ''}`}>
                        <div className="font-medium">
                          <span className="text-muted-foreground text-xs">{getAccountCode(line.accountId)}</span>
                          <br />
                          {getAccountName(line.accountId)}
                        </div>
                        <div className="text-muted-foreground text-sm">{line.memo || '-'}</div>
                        <div className={`text-right ${parseFloat(line.debit || '0') > 0 ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                          {parseFloat(line.debit || '0') > 0 ? formatCurrency(parseFloat(line.debit || '0'), 'USD', lang) : '-'}
                        </div>
                        <div className={`text-right ${parseFloat(line.credit || '0') > 0 ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                          {parseFloat(line.credit || '0') > 0 ? formatCurrency(parseFloat(line.credit || '0'), 'USD', lang) : '-'}
                        </div>
                      </div>
                    ))}
                    <div className={`grid grid-cols-4 gap-4 p-3 border-t bg-muted/30 font-bold ${isRTL ? 'text-right' : ''}`}>
                      <div className="col-span-2">{lang === 'ar' ? 'الإجمالي' : 'Total'}</div>
                      <div className="text-right text-emerald-400">
                        {formatCurrency(
                          txDetails.lines.reduce((sum, l) => sum + parseFloat(l.debit || '0'), 0),
                          'USD',
                          lang
                        )}
                      </div>
                      <div className="text-right text-red-400">
                        {formatCurrency(
                          txDetails.lines.reduce((sum, l) => sum + parseFloat(l.credit || '0'), 0),
                          'USD',
                          lang
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {lang === 'ar' ? 'لا توجد تفاصيل سطور' : 'No line details available'}
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-end gap-2 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
                <Button>
                  {lang === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {orgId && (
        <AddTransactionModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          organizationId={orgId}
        />
      )}
    </div>
  );
}
