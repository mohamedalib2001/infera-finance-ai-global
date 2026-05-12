import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Printer, BarChart3, TrendingUp, TrendingDown, 
  Wallet, Building, DollarSign, Calendar, ArrowUpRight, ArrowDownRight,
  FileDown, Loader2, ChevronLeft, ChevronRight, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import type { Account, Organization, CashFlow } from "@shared/schema";

export default function Reports() {
  const { t, lang, isRTL } = useI18n();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("balance-sheet");
  const [showPrintView, setShowPrintView] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [printTriggered, setPrintTriggered] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchYear, setSearchYear] = useState("");
  
  // Handle URL parameters for tab selection and year
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tabParam = params.get('tab');
    const yearParam = params.get('year');
    
    if (tabParam && ['balance-sheet', 'income-statement', 'cash-flow-statement'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    if (yearParam) {
      const year = parseInt(yearParam, 10);
      if (year >= 1900 && year <= currentYear + 10) {
        setSelectedYear(year);
      }
    }
  }, [searchString, currentYear]);
  
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };
  
  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };
  
  const handleYearSearch = () => {
    const year = parseInt(searchYear);
    if (year && year >= 1900 && year <= currentYear) {
      setSelectedYear(year);
      setSearchYear("");
    }
  };

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const orgId = organizations[0]?.id;
  const orgName = organizations[0]?.name || 'INFERA Finance';

  // Fetch financial report data filtered by selected year
  const { data: financialData, isLoading } = useQuery<{
    accounts: Account[];
    cashFlows: CashFlow[];
    year: number;
  }>({
    queryKey: ['/api/reports/financial', { orgId, year: selectedYear }],
    queryFn: async () => {
      const res = await fetch(`/api/reports/financial?orgId=${orgId}&year=${selectedYear}`);
      if (!res.ok) throw new Error('Failed to fetch financial data');
      return res.json();
    },
    enabled: !!orgId,
  });

  const accounts = financialData?.accounts || [];
  const cashFlows = financialData?.cashFlows || [];

  const assets = accounts.filter(a => a.type === 'asset');
  const liabilities = accounts.filter(a => a.type === 'liability');
  const equity = accounts.filter(a => a.type === 'equity');
  const revenue = accounts.filter(a => a.type === 'revenue');
  const expenses = accounts.filter(a => a.type === 'expense');

  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalEquity = equity.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalRevenue = revenue.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const totalExpenses = expenses.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
  const netIncome = totalRevenue - totalExpenses;

  const operatingCF = cashFlows.filter(cf => cf.type === 'operating').reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);
  const investingCF = cashFlows.filter(cf => cf.type === 'investing').reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);
  const financingCF = cashFlows.filter(cf => cf.type === 'financing').reduce((sum, cf) => sum + parseFloat(cf.amount || '0'), 0);
  const netCashFlow = operatingCF + investingCF + financingCF;

  const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const response = await fetch(`/api/reports/pdf?orgId=${orgId}&year=${selectedYear}&lang=${lang}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `INFERA_Financial_Report_${selectedYear}_${lang}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle print action from URL - wait for data to be ready
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const actionParam = params.get('action');
    
    if (actionParam === 'print' && !printTriggered && orgId && !isLoading) {
      setPrintTriggered(true);
      // Clear URL params after handling
      setLocation('/reports', { replace: true });
      // Trigger PDF download
      handleDownloadPDF();
    }
  }, [searchString, printTriggered, orgId, isLoading]);

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrintView(false), 1000);
    }, 500);
  };

  const handleDownloadCSV = (reportType: string) => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'balance-sheet') {
      filename = `balance_sheet_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = lang === 'ar' 
        ? 'النوع,الكود,الاسم,الرصيد\n'
        : 'Type,Code,Name,Balance\n';
      
      assets.forEach(a => {
        csvContent += `${lang === 'ar' ? 'أصل' : 'Asset'},${a.code},"${a.name}",${a.balance}\n`;
      });
      csvContent += `,,${lang === 'ar' ? 'إجمالي الأصول' : 'Total Assets'},${totalAssets}\n\n`;
      
      liabilities.forEach(a => {
        csvContent += `${lang === 'ar' ? 'التزام' : 'Liability'},${a.code},"${a.name}",${a.balance}\n`;
      });
      csvContent += `,,${lang === 'ar' ? 'إجمالي الالتزامات' : 'Total Liabilities'},${totalLiabilities}\n\n`;
      
      equity.forEach(a => {
        csvContent += `${lang === 'ar' ? 'حقوق ملكية' : 'Equity'},${a.code},"${a.name}",${a.balance}\n`;
      });
      csvContent += `,,${lang === 'ar' ? 'إجمالي حقوق الملكية' : 'Total Equity'},${totalEquity}\n`;
    } else if (reportType === 'income-statement') {
      filename = `income_statement_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = lang === 'ar' 
        ? 'النوع,الكود,الاسم,المبلغ\n'
        : 'Type,Code,Name,Amount\n';
      
      revenue.forEach(a => {
        csvContent += `${lang === 'ar' ? 'إيراد' : 'Revenue'},${a.code},"${a.name}",${a.balance}\n`;
      });
      csvContent += `,,${lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'},${totalRevenue}\n\n`;
      
      expenses.forEach(a => {
        csvContent += `${lang === 'ar' ? 'مصروف' : 'Expense'},${a.code},"${a.name}",${a.balance}\n`;
      });
      csvContent += `,,${lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'},${totalExpenses}\n\n`;
      csvContent += `,,${lang === 'ar' ? 'صافي الدخل' : 'Net Income'},${netIncome}\n`;
    } else {
      filename = `cash_flow_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = lang === 'ar' 
        ? 'النوع,الفئة,الوصف,المبلغ,التاريخ\n'
        : 'Type,Category,Description,Amount,Date\n';
      
      cashFlows.forEach(cf => {
        const typeLabel = cf.type === 'operating' 
          ? (lang === 'ar' ? 'تشغيلي' : 'Operating')
          : cf.type === 'investing' 
          ? (lang === 'ar' ? 'استثماري' : 'Investing')
          : (lang === 'ar' ? 'تمويلي' : 'Financing');
        csvContent += `${typeLabel},"${cf.category}","${cf.description || ''}",${cf.amount},${cf.date}\n`;
      });
      csvContent += `\n,,${lang === 'ar' ? 'صافي التدفق النقدي' : 'Net Cash Flow'},${netCashFlow}\n`;
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const AccountRow = ({ account, indent = false }: { account: Account; indent?: boolean }) => (
    <div className={`flex items-center justify-between py-2 px-3 hover:bg-muted/30 rounded ${indent ? 'ml-4' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-xs text-muted-foreground font-mono">{account.code}</span>
        <span>{lang === 'ar' && account.nameAr ? account.nameAr : account.name}</span>
      </div>
      <span className="font-medium">{formatCurrency(parseFloat(account.balance || '0'), 'USD', lang)}</span>
    </div>
  );

  const SectionTotal = ({ label, amount, variant = 'default' }: { label: string; amount: number; variant?: 'default' | 'success' | 'danger' }) => (
    <div className={`flex items-center justify-between py-3 px-3 bg-muted/50 rounded-lg font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
      <span>{label}</span>
      <span className={variant === 'success' ? 'text-emerald-500' : variant === 'danger' ? 'text-red-500' : ''}>
        {formatCurrency(amount, 'USD', lang)}
      </span>
    </div>
  );

  const PrintableReportContent = () => {
    const textAlign = isRTL ? 'right' : 'left';
    const numAlign = isRTL ? 'left' : 'right';
    
    return (
    <>
      <header style={{ 
        borderBottom: '3px solid #0891b2', 
        paddingBottom: '16px', 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0891b2', margin: 0 }}>INFERA Finance AI GlobalCloud</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>{orgName}</p>
        </div>
        <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{lang === 'ar' ? 'تاريخ التقرير' : 'Report Date'}</p>
          <p style={{ fontSize: '14px', fontWeight: '500', margin: '2px 0' }}>{currentDate}</p>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{lang === 'ar' ? 'السنة المالية' : 'Fiscal Year'}: {selectedYear}</p>
        </div>
      </header>

      {activeTab === 'balance-sheet' && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px', textAlign }}>
          {lang === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet'}
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ textAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '15%' }}>{lang === 'ar' ? 'الكود' : 'Code'}</th>
              <th style={{ textAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '55%' }}>{lang === 'ar' ? 'اسم الحساب' : 'Account Name'}</th>
              <th style={{ textAlign: numAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '30%' }} data-type="number">{lang === 'ar' ? 'الرصيد' : 'Balance'}</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '10px', fontWeight: 'bold', color: '#059669', textAlign }}>
                {lang === 'ar' ? 'الأصول' : 'Assets'}
              </td>
            </tr>
            {assets.map(acc => (
              <tr key={acc.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '12px', textAlign }}>{acc.code}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>{lang === 'ar' && acc.nameAr ? acc.nameAr : acc.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign: numAlign, fontFamily: 'monospace' }} data-type="number">{formatAmount(parseFloat(acc.balance || '0'))}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#d1fae5' }}>
              <td colSpan={2} style={{ padding: '10px', fontWeight: 'bold', textAlign }}>{lang === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}</td>
              <td style={{ padding: '10px', textAlign: numAlign, fontWeight: 'bold', color: '#059669', fontFamily: 'monospace' }} data-type="number">{formatAmount(totalAssets)}</td>
            </tr>

            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '10px', fontWeight: 'bold', color: '#dc2626', paddingTop: '20px', textAlign }}>
                {lang === 'ar' ? 'الالتزامات' : 'Liabilities'}
              </td>
            </tr>
            {liabilities.map(acc => (
              <tr key={acc.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '12px', textAlign }}>{acc.code}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>{lang === 'ar' && acc.nameAr ? acc.nameAr : acc.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign: numAlign, fontFamily: 'monospace' }} data-type="number">{formatAmount(parseFloat(acc.balance || '0'))}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#fee2e2' }}>
              <td colSpan={2} style={{ padding: '10px', fontWeight: 'bold', textAlign }}>{lang === 'ar' ? 'إجمالي الالتزامات' : 'Total Liabilities'}</td>
              <td style={{ padding: '10px', textAlign: numAlign, fontWeight: 'bold', color: '#dc2626', fontFamily: 'monospace' }} data-type="number">{formatAmount(totalLiabilities)}</td>
            </tr>

            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb', paddingTop: '20px', textAlign }}>
                {lang === 'ar' ? 'حقوق الملكية' : 'Equity'}
              </td>
            </tr>
            {equity.map(acc => (
              <tr key={acc.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '12px', textAlign }}>{acc.code}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>{lang === 'ar' && acc.nameAr ? acc.nameAr : acc.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign: numAlign, fontFamily: 'monospace' }} data-type="number">{formatAmount(parseFloat(acc.balance || '0'))}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#dbeafe' }}>
              <td colSpan={2} style={{ padding: '10px', fontWeight: 'bold', textAlign }}>{lang === 'ar' ? 'إجمالي حقوق الملكية' : 'Total Equity'}</td>
              <td style={{ padding: '10px', textAlign: numAlign, fontWeight: 'bold', fontFamily: 'monospace' }} data-type="number">{formatAmount(totalEquity)}</td>
            </tr>

            <tr style={{ backgroundColor: '#cffafe', borderTop: '3px solid #0891b2' }}>
              <td colSpan={2} style={{ padding: '12px', fontWeight: 'bold', fontSize: '15px', textAlign }}>{lang === 'ar' ? 'إجمالي الالتزامات وحقوق الملكية' : 'Total Liabilities & Equity'}</td>
              <td style={{ padding: '12px', textAlign: numAlign, fontWeight: 'bold', fontSize: '15px', fontFamily: 'monospace' }} data-type="number">{formatAmount(totalLiabilities + totalEquity)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          borderRadius: '6px',
          backgroundColor: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? '#d1fae5' : '#fee2e2',
          color: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? '#065f46' : '#991b1b',
          textAlign
        }}>
          {Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 
            ? (lang === 'ar' ? '✓ الميزانية متوازنة' : '✓ Balance Sheet is Balanced')
            : (lang === 'ar' ? '✗ الميزانية غير متوازنة' : '✗ Balance Sheet is NOT Balanced')}
        </div>
      </section>
      )}

      {activeTab === 'income-statement' && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px', textAlign }}>
          {lang === 'ar' ? 'قائمة الدخل' : 'Income Statement'}
        </h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', textAlign }}>
          {lang === 'ar' ? `للسنة المالية المنتهية في 31 ديسمبر ${selectedYear}` : `For the Year Ended December 31, ${selectedYear}`}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ textAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '15%' }}>{lang === 'ar' ? 'الكود' : 'Code'}</th>
              <th style={{ textAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '55%' }}>{lang === 'ar' ? 'البند' : 'Item'}</th>
              <th style={{ textAlign: numAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '30%' }} data-type="number">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '10px', fontWeight: 'bold', color: '#059669', textAlign }}>
                {lang === 'ar' ? 'الإيرادات' : 'Revenue'}
              </td>
            </tr>
            {revenue.map(acc => (
              <tr key={acc.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '12px', textAlign }}>{acc.code}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>{lang === 'ar' && acc.nameAr ? acc.nameAr : acc.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign: numAlign, fontFamily: 'monospace' }} data-type="number">{formatAmount(parseFloat(acc.balance || '0'))}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#d1fae5' }}>
              <td colSpan={2} style={{ padding: '10px', fontWeight: 'bold', textAlign }}>{lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</td>
              <td style={{ padding: '10px', textAlign: numAlign, fontWeight: 'bold', color: '#059669', fontFamily: 'monospace' }} data-type="number">{formatAmount(totalRevenue)}</td>
            </tr>

            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '10px', fontWeight: 'bold', color: '#dc2626', paddingTop: '20px', textAlign }}>
                {lang === 'ar' ? 'المصروفات' : 'Expenses'}
              </td>
            </tr>
            {expenses.map(acc => (
              <tr key={acc.id}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '12px', textAlign }}>{acc.code}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>{lang === 'ar' && acc.nameAr ? acc.nameAr : acc.name}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign: numAlign, fontFamily: 'monospace' }} data-type="number">{formatAmount(parseFloat(acc.balance || '0'))}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#fee2e2' }}>
              <td colSpan={2} style={{ padding: '10px', fontWeight: 'bold', textAlign }}>{lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</td>
              <td style={{ padding: '10px', textAlign: numAlign, fontWeight: 'bold', color: '#dc2626', fontFamily: 'monospace' }} data-type="number">{formatAmount(totalExpenses)}</td>
            </tr>

            <tr style={{ backgroundColor: netIncome >= 0 ? '#d1fae5' : '#fee2e2', borderTop: '3px solid ' + (netIncome >= 0 ? '#059669' : '#dc2626') }}>
              <td colSpan={2} style={{ padding: '12px', fontWeight: 'bold', fontSize: '15px', textAlign }}>{lang === 'ar' ? 'صافي الدخل' : 'Net Income'}</td>
              <td style={{ padding: '12px', textAlign: numAlign, fontWeight: 'bold', fontSize: '15px', color: netIncome >= 0 ? '#059669' : '#dc2626', fontFamily: 'monospace' }} data-type="number">
                {formatAmount(netIncome)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', textAlign }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{lang === 'ar' ? 'هامش الربح' : 'Profit Margin'}</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#0891b2', margin: 0 }}>
              {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', textAlign }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{lang === 'ar' ? 'نسبة المصروفات' : 'Expense Ratio'}</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>
              {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </section>
      )}

      {activeTab === 'cash-flow' && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px', textAlign }}>
          {lang === 'ar' ? 'قائمة التدفقات النقدية' : 'Cash Flow Statement'}
        </h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', textAlign }}>
          {lang === 'ar' ? `للسنة المالية ${selectedYear}` : `For Fiscal Year ${selectedYear}`}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', direction: isRTL ? 'rtl' : 'ltr' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
            <span style={{ fontWeight: '500', textAlign }}>{lang === 'ar' ? 'الأنشطة التشغيلية' : 'Operating Activities'}</span>
            <span style={{ fontWeight: 'bold', color: operatingCF >= 0 ? '#059669' : '#dc2626', fontFamily: 'monospace' }} data-type="number">
              {formatAmount(operatingCF)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#ede9fe', borderRadius: '6px' }}>
            <span style={{ fontWeight: '500', textAlign }}>{lang === 'ar' ? 'الأنشطة الاستثمارية' : 'Investing Activities'}</span>
            <span style={{ fontWeight: 'bold', color: investingCF >= 0 ? '#059669' : '#dc2626', fontFamily: 'monospace' }} data-type="number">
              {formatAmount(investingCF)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
            <span style={{ fontWeight: '500', textAlign }}>{lang === 'ar' ? 'الأنشطة التمويلية' : 'Financing Activities'}</span>
            <span style={{ fontWeight: 'bold', color: financingCF >= 0 ? '#059669' : '#dc2626', fontFamily: 'monospace' }} data-type="number">
              {formatAmount(financingCF)}
            </span>
          </div>
        </div>

        <div style={{ 
          padding: '16px', 
          borderRadius: '6px', 
          fontWeight: 'bold', 
          fontSize: '16px', 
          borderTop: '3px solid ' + (netCashFlow >= 0 ? '#059669' : '#dc2626'),
          backgroundColor: netCashFlow >= 0 ? '#d1fae5' : '#fee2e2',
          display: 'flex',
          justifyContent: 'space-between',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          <span style={{ textAlign }}>{lang === 'ar' ? 'صافي التدفق النقدي' : 'Net Cash Flow'}</span>
          <span style={{ color: netCashFlow >= 0 ? '#059669' : '#dc2626', fontFamily: 'monospace' }} data-type="number">
            {formatAmount(netCashFlow)}
          </span>
        </div>

        {cashFlows.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '12px', textAlign }}>{lang === 'ar' ? 'تفاصيل التدفقات النقدية' : 'Cash Flow Details'}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', direction: isRTL ? 'rtl' : 'ltr' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ textAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '20%' }}>{lang === 'ar' ? 'النوع' : 'Type'}</th>
                  <th style={{ textAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '50%' }}>{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th style={{ textAlign: numAlign, padding: '10px', borderBottom: '2px solid #d1d5db', width: '30%' }} data-type="number">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                {cashFlows.map((cf, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        backgroundColor: cf.type === 'operating' ? '#dbeafe' : cf.type === 'investing' ? '#ede9fe' : '#fef3c7',
                        color: cf.type === 'operating' ? '#1e40af' : cf.type === 'investing' ? '#6b21a8' : '#92400e'
                      }}>
                        {cf.type === 'operating' ? (lang === 'ar' ? 'تشغيلي' : 'Operating') :
                         cf.type === 'investing' ? (lang === 'ar' ? 'استثماري' : 'Investing') :
                         (lang === 'ar' ? 'تمويلي' : 'Financing')}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb', textAlign }}>{cf.description || cf.category}</td>
                    <td style={{ 
                      padding: '8px 10px', 
                      borderBottom: '1px solid #e5e7eb', 
                      textAlign: numAlign,
                      fontFamily: 'monospace',
                      color: parseFloat(cf.amount || '0') >= 0 ? '#059669' : '#dc2626'
                    }} data-type="number">
                      {formatAmount(parseFloat(cf.amount || '0'))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      <footer style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '12px', color: '#888' }}>
        <p style={{ margin: '4px 0' }}>{lang === 'ar' ? 'تم إنشاء هذا التقرير بواسطة' : 'Generated by'} INFERA Finance AI GlobalCloud</p>
        <p style={{ margin: '4px 0' }}>{currentDate}</p>
      </footer>
    </>
  );
  };

  const printContent = (
    <div 
      ref={printRef} 
      id="printable-report" 
      className="print-container"
      style={{ 
        display: showPrintView ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100vh',
        zIndex: showPrintView ? 999999 : -1,
        overflow: 'visible',
        fontFamily: isRTL ? '"Segoe UI", "Tahoma", Arial, sans-serif' : 'Arial, sans-serif',
        padding: '24px',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
        fontSize: '14px',
        lineHeight: '1.6',
        background: 'white',
        color: 'black'
      }} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <PrintableReportContent />
    </div>
  );

  return (
    <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {createPortal(printContent, document.body)}
      
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''} no-print`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-xl sm:text-2xl font-bold">{t.reports}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === 'ar' ? 'التقارير المالية والقوائم المحاسبية' : 'Financial Reports & Statements'}
          </p>
        </div>
        <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button 
            variant="outline" 
            data-testid="button-download-csv"
            onClick={() => handleDownloadCSV(activeTab)}
          >
            <FileDown className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {lang === 'ar' ? 'تنزيل CSV' : 'Download CSV'}
          </Button>
          <Button 
            variant="outline" 
            data-testid="button-print-report"
            onClick={handlePrint}
          >
            <Printer className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {lang === 'ar' ? 'طباعة' : 'Print'}
          </Button>
          <Button 
            variant="default" 
            data-testid="button-download-pdf"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : (
              <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {isGeneratingPDF 
              ? (lang === 'ar' ? 'جاري التحميل...' : 'Generating...')
              : (lang === 'ar' ? 'تنزيل PDF' : 'Download PDF')
            }
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50 no-print">
        <CardContent className="py-3 sm:py-4">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm sm:text-base">
                {lang === 'ar' ? 'السنة المالية' : 'Fiscal Year'}
              </span>
            </div>
            
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handlePreviousYear}
                data-testid="button-previous-year"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
              
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-32" data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleNextYear}
                disabled={selectedYear >= currentYear}
                data-testid="button-next-year"
              >
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Input
                type="number"
                placeholder={lang === 'ar' ? 'ابحث عن سنة...' : 'Search year...'}
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleYearSearch()}
                className="w-36"
                min="1900"
                max={currentYear}
                data-testid="input-search-year"
              />
              <Button 
                variant="secondary" 
                size="icon"
                onClick={handleYearSearch}
                data-testid="button-search-year"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 no-print">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balance-sheet" data-testid="tab-balance-sheet">
            <Building className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {lang === 'ar' ? 'الميزانية' : 'Balance Sheet'}
          </TabsTrigger>
          <TabsTrigger value="income-statement" data-testid="tab-income-statement">
            <TrendingUp className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {lang === 'ar' ? 'قائمة الدخل' : 'Income'}
          </TabsTrigger>
          <TabsTrigger value="cash-flow" data-testid="tab-cash-flow">
            <DollarSign className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {lang === 'ar' ? 'التدفقات' : 'Cash Flow'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Building className="w-5 h-5 text-primary" />
                {lang === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet'}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' ? `كما في 31 ديسمبر ${selectedYear}` : `As of December 31, ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {lang === 'ar' ? 'الأصول' : 'Assets'}
                    </h3>
                    {assets.map(acc => <AccountRow key={acc.id} account={acc} indent />)}
                    <SectionTotal label={lang === 'ar' ? 'إجمالي الأصول' : 'Total Assets'} amount={totalAssets} variant="success" />
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      {lang === 'ar' ? 'الالتزامات' : 'Liabilities'}
                    </h3>
                    {liabilities.map(acc => <AccountRow key={acc.id} account={acc} indent />)}
                    <SectionTotal label={lang === 'ar' ? 'إجمالي الالتزامات' : 'Total Liabilities'} amount={totalLiabilities} variant="danger" />
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Wallet className="w-4 h-4 text-blue-500" />
                      {lang === 'ar' ? 'حقوق الملكية' : 'Equity'}
                    </h3>
                    {equity.map(acc => <AccountRow key={acc.id} account={acc} indent />)}
                    <SectionTotal label={lang === 'ar' ? 'إجمالي حقوق الملكية' : 'Total Equity'} amount={totalEquity} />
                  </div>

                  <div className="border-t pt-4">
                    <SectionTotal 
                      label={lang === 'ar' ? 'إجمالي الالتزامات وحقوق الملكية' : 'Total Liabilities & Equity'} 
                      amount={totalLiabilities + totalEquity} 
                    />
                  </div>

                  <div className={`p-4 rounded-lg ${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? (
                        <>
                          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">
                            {lang === 'ar' ? 'الميزانية متوازنة' : 'Balance Sheet is Balanced'}
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                          <span className="text-red-500 font-medium">
                            {lang === 'ar' ? 'الميزانية غير متوازنة' : 'Balance Sheet is NOT Balanced'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="w-5 h-5 text-primary" />
                {lang === 'ar' ? 'قائمة الدخل' : 'Income Statement'}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' ? `للسنة المالية المنتهية في 31 ديسمبر ${selectedYear}` : `For the Year Ended December 31, ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {lang === 'ar' ? 'الإيرادات' : 'Revenue'}
                    </h3>
                    {revenue.map(acc => <AccountRow key={acc.id} account={acc} indent />)}
                    <SectionTotal label={lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'} amount={totalRevenue} variant="success" />
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      {lang === 'ar' ? 'المصروفات' : 'Expenses'}
                    </h3>
                    {expenses.map(acc => <AccountRow key={acc.id} account={acc} indent />)}
                    <SectionTotal label={lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'} amount={totalExpenses} variant="danger" />
                  </div>

                  <div className="border-t pt-4">
                    <div className={`flex items-center justify-between py-4 px-4 rounded-lg font-bold text-lg ${netIncome >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{lang === 'ar' ? 'صافي الدخل' : 'Net Income'}</span>
                      <span className={netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {formatCurrency(netIncome, 'USD', lang)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'هامش الربح' : 'Profit Margin'}</p>
                        <p className="text-2xl font-bold text-primary">
                          {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'نسبة المصروفات' : 'Expense Ratio'}</p>
                        <p className="text-2xl font-bold text-amber-500">
                          {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <DollarSign className="w-5 h-5 text-primary" />
                {lang === 'ar' ? 'قائمة التدفقات النقدية' : 'Cash Flow Statement'}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' ? `للسنة المالية ${selectedYear}` : `For Fiscal Year ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{lang === 'ar' ? 'الأنشطة التشغيلية' : 'Operating Activities'}</span>
                      </div>
                      <span className={`font-bold ${operatingCF >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(operatingCF, 'USD', lang)}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Building className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">{lang === 'ar' ? 'الأنشطة الاستثمارية' : 'Investing Activities'}</span>
                      </div>
                      <span className={`font-bold ${investingCF >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(investingCF, 'USD', lang)}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Wallet className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">{lang === 'ar' ? 'الأنشطة التمويلية' : 'Financing Activities'}</span>
                      </div>
                      <span className={`font-bold ${financingCF >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(financingCF, 'USD', lang)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className={`flex items-center justify-between py-4 px-4 rounded-lg font-bold text-lg ${netCashFlow >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{lang === 'ar' ? 'صافي التدفق النقدي' : 'Net Cash Flow'}</span>
                      <span className={netCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {formatCurrency(netCashFlow, 'USD', lang)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <h4 className="font-medium text-muted-foreground">
                      {lang === 'ar' ? 'تفاصيل التدفقات النقدية' : 'Cash Flow Details'}
                    </h4>
                    {cashFlows.slice(0, 8).map((cf, idx) => (
                      <div key={idx} className={`flex items-center justify-between py-2 px-3 hover:bg-muted/30 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Badge variant="outline" className="text-xs">
                            {cf.type === 'operating' ? (lang === 'ar' ? 'تشغيلي' : 'Oper') :
                             cf.type === 'investing' ? (lang === 'ar' ? 'استثماري' : 'Invest') :
                             (lang === 'ar' ? 'تمويلي' : 'Fin')}
                          </Badge>
                          <span className="text-sm">{cf.description || cf.category}</span>
                        </div>
                        <span className={`font-medium ${parseFloat(cf.amount || '0') >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {formatCurrency(parseFloat(cf.amount || '0'), 'USD', lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
