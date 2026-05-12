// INFERA Finance AI GlobalCloud - Internationalization
export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    transactions: 'Transactions',
    invoices: 'Invoices',
    budgets: 'Budgets',
    cashFlow: 'Cash Flow',
    reports: 'Reports',
    aiInsights: 'AI Insights',
    settings: 'Settings',
    contacts: 'Contacts',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    financialOverview: 'Financial Overview',
    totalAssets: 'Total Assets',
    totalLiabilities: 'Total Liabilities',
    netWorth: 'Net Worth',
    revenue: 'Revenue',
    expenses: 'Expenses',
    netIncome: 'Net Income',
    cashBalance: 'Cash Balance',
    accountsReceivable: 'Accounts Receivable',
    accountsPayable: 'Accounts Payable',
    
    // AI
    aiAssistant: 'AI CFO Assistant',
    askAI: 'Ask INFERA AI...',
    aiRecommendations: 'AI Recommendations',
    financialForecast: 'Financial Forecast',
    riskAlerts: 'Risk Alerts',
    opportunities: 'Opportunities',
    
    // Status
    posted: 'Posted',
    pending: 'Pending',
    draft: 'Draft',
    paid: 'Paid',
    overdue: 'Overdue',
    active: 'Active',
    
    // Actions
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    export: 'Export',
    import: 'Import',
    filter: 'Filter',
    search: 'Search',
    
    // Time
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    lastMonth: 'Last Month',
    lastYear: 'Last Year',
    
    // Coming Soon
    comingSoon: 'Coming Soon',
    launchingQ1: 'Launching Q1 2026',
    stayTuned: 'Stay tuned for the future of finance',
    emailPlaceholder: 'Enter your email',
    subscribe: 'Subscribe',
    subscribed: 'Subscribed!',
    globalFinancialCloud: 'Global Financial Cloud',
    poweredByAI: 'Powered by AI',
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    accounts: 'الحسابات',
    transactions: 'المعاملات',
    invoices: 'الفواتير',
    budgets: 'الميزانيات',
    cashFlow: 'التدفق النقدي',
    reports: 'التقارير',
    aiInsights: 'رؤى الذكاء الاصطناعي',
    settings: 'الإعدادات',
    contacts: 'جهات الاتصال',
    
    // Dashboard
    welcomeBack: 'مرحباً بعودتك',
    financialOverview: 'نظرة مالية عامة',
    totalAssets: 'إجمالي الأصول',
    totalLiabilities: 'إجمالي الالتزامات',
    netWorth: 'صافي الثروة',
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    netIncome: 'صافي الدخل',
    cashBalance: 'الرصيد النقدي',
    accountsReceivable: 'الذمم المدينة',
    accountsPayable: 'الذمم الدائنة',
    
    // AI
    aiAssistant: 'مساعد المدير المالي الذكي',
    askAI: 'اسأل INFERA AI...',
    aiRecommendations: 'توصيات الذكاء الاصطناعي',
    financialForecast: 'التوقعات المالية',
    riskAlerts: 'تنبيهات المخاطر',
    opportunities: 'الفرص',
    
    // Status
    posted: 'مُرحّل',
    pending: 'قيد الانتظار',
    draft: 'مسودة',
    paid: 'مدفوع',
    overdue: 'متأخر',
    active: 'نشط',
    
    // Actions
    create: 'إنشاء',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    export: 'تصدير',
    import: 'استيراد',
    filter: 'تصفية',
    search: 'بحث',
    
    // Time
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذه السنة',
    lastMonth: 'الشهر الماضي',
    lastYear: 'السنة الماضية',
    
    // Coming Soon
    comingSoon: 'قريباً',
    launchingQ1: 'الإطلاق في الربع الأول 2026',
    stayTuned: 'ترقبوا مستقبل التمويل',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    subscribe: 'اشترك',
    subscribed: 'تم الاشتراك!',
    globalFinancialCloud: 'السحابة المالية العالمية',
    poweredByAI: 'مدعوم بالذكاء الاصطناعي',
  }
};

export function useTranslation(lang: Language = 'en') {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  return { t, isRTL, lang };
}

export function formatCurrency(amount: number, currency: string = 'USD', lang: Language = 'en'): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, lang: Language = 'en'): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(date: Date | string, lang: Language = 'en'): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}
