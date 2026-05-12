export interface RouteEntry {
  path: string;
  nameEn: string;
  nameAr: string;
  keywordsEn: string[];
  keywordsAr: string[];
  icon?: string;
  params?: Record<string, string>;
}

export interface ReportEntry {
  id: string;
  nameEn: string;
  nameAr: string;
  keywordsEn: string[];
  keywordsAr: string[];
}

export const reportTypes: ReportEntry[] = [
  {
    id: 'balance-sheet',
    nameEn: 'Balance Sheet',
    nameAr: 'الميزانية العمومية',
    keywordsEn: ['balance sheet', 'balance', 'assets liabilities', 'financial position'],
    keywordsAr: ['الميزانية العمومية', 'الميزانية', 'المركز المالي', 'الاصول والخصوم'],
  },
  {
    id: 'income-statement',
    nameEn: 'Income Statement',
    nameAr: 'قائمة الدخل',
    keywordsEn: ['income statement', 'income', 'profit loss', 'profit and loss', 'p&l', 'revenue expenses'],
    keywordsAr: ['قائمة الدخل', 'الدخل', 'الارباح والخسائر', 'الايرادات والمصروفات'],
  },
  {
    id: 'cash-flow-statement',
    nameEn: 'Cash Flow Statement',
    nameAr: 'قائمة التدفقات النقدية',
    keywordsEn: ['cash flow statement', 'cash flow', 'cash flows', 'liquidity statement'],
    keywordsAr: ['قائمة التدفقات النقدية', 'التدفقات النقدية', 'تدفق النقد'],
  },
];

export const navigationRoutes: RouteEntry[] = [
  {
    path: '/dashboard',
    nameEn: 'Dashboard',
    nameAr: 'لوحة التحكم',
    keywordsEn: ['dashboard', 'home', 'main', 'overview', 'start'],
    keywordsAr: ['لوحة التحكم', 'الرئيسية', 'البداية', 'نظرة عامة', 'الصفحة الرئيسية'],
  },
  {
    path: '/accounts',
    nameEn: 'Accounts',
    nameAr: 'الحسابات',
    keywordsEn: ['accounts', 'chart of accounts', 'ledger', 'account'],
    keywordsAr: ['الحسابات', 'دليل الحسابات', 'حساب', 'حساباتي'],
  },
  {
    path: '/transactions',
    nameEn: 'Transactions',
    nameAr: 'المعاملات',
    keywordsEn: ['transactions', 'journal', 'entries', 'transaction', 'journal entries'],
    keywordsAr: ['المعاملات', 'القيود', 'الحركات', 'القيود اليومية', 'معاملة'],
  },
  {
    path: '/invoices',
    nameEn: 'Invoices',
    nameAr: 'الفواتير',
    keywordsEn: ['invoices', 'bills', 'billing', 'invoice', 'receivables', 'payables'],
    keywordsAr: ['الفواتير', 'فاتورة', 'الفوترة', 'المستحقات', 'الذمم'],
  },
  {
    path: '/budgets',
    nameEn: 'Budgets',
    nameAr: 'الميزانيات',
    keywordsEn: ['budgets', 'budget', 'planning', 'forecast', 'budgeting'],
    keywordsAr: ['الميزانيات', 'ميزانية', 'التخطيط', 'التوقعات'],
  },
  {
    path: '/cash-flow',
    nameEn: 'Cash Flow',
    nameAr: 'التدفق النقدي',
    keywordsEn: ['cash flow', 'cashflow', 'cash', 'liquidity', 'money flow'],
    keywordsAr: ['التدفق النقدي', 'السيولة', 'النقد', 'تدفق الأموال'],
  },
  {
    path: '/reports',
    nameEn: 'Reports',
    nameAr: 'التقارير',
    keywordsEn: ['reports', 'report', 'financial reports', 'statements', 'balance sheet', 'income statement'],
    keywordsAr: ['التقارير', 'تقرير', 'القوائم المالية', 'الميزانية العمومية', 'قائمة الدخل'],
  },
  {
    path: '/ai-insights',
    nameEn: 'AI Insights',
    nameAr: 'رؤى الذكاء الاصطناعي',
    keywordsEn: ['ai insights', 'insights', 'ai', 'analytics', 'analysis', 'recommendations'],
    keywordsAr: ['رؤى الذكاء الاصطناعي', 'الرؤى', 'التحليلات', 'التوصيات', 'الذكاء الاصطناعي'],
  },
  {
    path: '/compliance',
    nameEn: 'Compliance',
    nameAr: 'الامتثال',
    keywordsEn: ['compliance', 'regulations', 'regulatory', 'audit', 'legal'],
    keywordsAr: ['الامتثال', 'اللوائح', 'التنظيمات', 'التدقيق', 'القانونية'],
  },
  {
    path: '/contacts',
    nameEn: 'Contacts',
    nameAr: 'جهات الاتصال',
    keywordsEn: ['contacts', 'customers', 'vendors', 'suppliers', 'clients', 'contact'],
    keywordsAr: ['جهات الاتصال', 'العملاء', 'الموردين', 'المزودين', 'جهة اتصال'],
  },
  {
    path: '/settings',
    nameEn: 'Settings',
    nameAr: 'الإعدادات',
    keywordsEn: ['settings', 'preferences', 'configuration', 'config', 'options'],
    keywordsAr: ['الإعدادات', 'التفضيلات', 'الخيارات', 'التكوين'],
  },
  {
    path: '/payment-gateways',
    nameEn: 'Payment Gateways',
    nameAr: 'بوابات الدفع',
    keywordsEn: ['payment gateways', 'payments', 'payment', 'stripe', 'gateway', 'pay'],
    keywordsAr: ['بوابات الدفع', 'الدفع', 'المدفوعات', 'بوابة الدفع'],
  },
];

const navigationIntentsEn = [
  'go to', 'open', 'show', 'take me to', 'navigate to', 'view', 'display', 'see', 'access', 'visit'
];

const navigationIntentsAr = [
  'اذهب الى', 'اذهب إلى', 'افتح', 'اعرض', 'انتقل الى', 'انتقل إلى', 'خذني الى', 'خذني إلى',
  'اريد', 'أريد', 'فتح', 'عرض', 'اظهر', 'أظهر', 'دخول'
];

const printIntentsEn = [
  'print', 'download', 'export', 'generate pdf', 'pdf', 'save as pdf'
];

const printIntentsAr = [
  'اطبع', 'طباعة', 'حمل', 'تحميل', 'صدر', 'تصدير', 'انشئ pdf', 'حفظ pdf'
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[ًٌٍَُِّْ]/g, '')
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

export interface NavigationAction {
  type: 'navigate';
  target: string;
  path: string;
  nameEn: string;
  nameAr: string;
  confidence: number;
  params?: Record<string, string>;
  year?: number;
}

export interface PrintAction {
  type: 'print';
  reportType: string;
  reportNameEn: string;
  reportNameAr: string;
  confidence: number;
  year?: number;
}

// Extract year from query (supports both Arabic and English numbers)
function extractYear(query: string): number | null {
  // Arabic to English number mapping
  const arabicNums: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  // Convert Arabic numbers to English
  let normalizedQuery = query;
  for (const [ar, en] of Object.entries(arabicNums)) {
    normalizedQuery = normalizedQuery.replace(new RegExp(ar, 'g'), en);
  }
  
  // Look for 4-digit year pattern (2000-2099)
  const yearMatch = normalizedQuery.match(/\b(20[0-9]{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  
  return null;
}

export type AIAction = NavigationAction | PrintAction;

export function detectNavigationIntent(query: string, language: 'en' | 'ar'): NavigationAction | null {
  const normalizedQuery = normalizeText(query);
  
  // Check both languages' intents to support mixed usage
  const allIntents = [...navigationIntentsAr, ...navigationIntentsEn];
  const hasNavigationIntent = allIntents.some(intent => 
    normalizedQuery.includes(normalizeText(intent))
  );
  
  if (!hasNavigationIntent && !normalizedQuery.includes('page') && !normalizedQuery.includes('صفحه')) {
    // Check exact matches in both languages
    for (const route of navigationRoutes) {
      const allKeywords = [...route.keywordsAr, ...route.keywordsEn];
      for (const keyword of allKeywords) {
        if (normalizedQuery === normalizeText(keyword)) {
          return {
            type: 'navigate',
            target: route.path.replace('/', ''),
            path: route.path,
            nameEn: route.nameEn,
            nameAr: route.nameAr,
            confidence: 0.7,
          };
        }
      }
    }
    return null;
  }
  
  // Extract year if mentioned
  const year = extractYear(query);
  
  // Check for specific report types first (more specific matching)
  for (const report of reportTypes) {
    const allKeywords = [...report.keywordsAr, ...report.keywordsEn];
    for (const keyword of allKeywords) {
      if (normalizedQuery.includes(normalizeText(keyword))) {
        return {
          type: 'navigate',
          target: 'reports',
          path: '/reports',
          nameEn: report.nameEn,
          nameAr: report.nameAr,
          confidence: 0.95,
          params: { tab: report.id },
          year: year || undefined,
        };
      }
    }
  }
  
  // Check partial matches in both languages for general pages
  for (const route of navigationRoutes) {
    const allKeywords = [...route.keywordsAr, ...route.keywordsEn];
    
    for (const keyword of allKeywords) {
      if (normalizedQuery.includes(normalizeText(keyword))) {
        return {
          type: 'navigate',
          target: route.path.replace('/', ''),
          path: route.path,
          nameEn: route.nameEn,
          nameAr: route.nameAr,
          confidence: 0.9,
        };
      }
    }
  }
  
  return null;
}

export function detectPrintIntent(query: string, language: 'en' | 'ar'): PrintAction | null {
  const normalizedQuery = normalizeText(query);
  
  // Check for print/download intents
  const allPrintIntents = [...printIntentsAr, ...printIntentsEn];
  const hasPrintIntent = allPrintIntents.some(intent => 
    normalizedQuery.includes(normalizeText(intent))
  );
  
  if (!hasPrintIntent) {
    return null;
  }
  
  // Extract year if mentioned
  const year = extractYear(query);
  
  // Check which report type to print
  for (const report of reportTypes) {
    const allKeywords = [...report.keywordsAr, ...report.keywordsEn];
    for (const keyword of allKeywords) {
      if (normalizedQuery.includes(normalizeText(keyword))) {
        return {
          type: 'print',
          reportType: report.id,
          reportNameEn: report.nameEn,
          reportNameAr: report.nameAr,
          confidence: 0.95,
          year: year || undefined,
        };
      }
    }
  }
  
  // Default to printing all reports if no specific type mentioned
  return {
    type: 'print',
    reportType: 'all',
    reportNameEn: 'Financial Reports',
    reportNameAr: 'التقارير المالية',
    confidence: 0.8,
    year: year || undefined,
  };
}

export function detectAIAction(query: string, language: 'en' | 'ar'): AIAction | null {
  // Check print intent first (more specific)
  const printAction = detectPrintIntent(query, language);
  if (printAction) {
    return printAction;
  }
  
  // Then check navigation intent
  const navAction = detectNavigationIntent(query, language);
  if (navAction) {
    return navAction;
  }
  
  return null;
}
