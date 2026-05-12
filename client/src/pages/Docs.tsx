import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n-context";
import {
  ArrowLeft,
  Languages,
  BookOpen,
  Code2,
  Zap,
  Shield,
  Database,
  Users,
  BarChart3,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function Docs() {
  const { lang, setLang, isRTL } = useI18n();
  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const docSections = [
    {
      icon: BookOpen,
      title: { en: "Introduction", ar: "المقدمة" },
      description: { en: "Overview of INFERA Finance AI platform", ar: "نظرة عامة على منصة INFERA Finance AI" },
      links: [
        { en: "Platform Overview", ar: "نظرة عامة على المنصة" },
        { en: "Key Features", ar: "الميزات الرئيسية" },
        { en: "System Requirements", ar: "متطلبات النظام" },
      ],
    },
    {
      icon: Zap,
      title: { en: "Quick Start", ar: "البدء السريع" },
      description: { en: "Get up and running in minutes", ar: "ابدأ في دقائق" },
      links: [
        { en: "Account Setup", ar: "إعداد الحساب" },
        { en: "First Steps", ar: "الخطوات الأولى" },
        { en: "Basic Configuration", ar: "التكوين الأساسي" },
      ],
    },
    {
      icon: Database,
      title: { en: "Accounting", ar: "المحاسبة" },
      description: { en: "Chart of accounts and transactions", ar: "دليل الحسابات والمعاملات" },
      links: [
        { en: "Chart of Accounts", ar: "دليل الحسابات" },
        { en: "Journal Entries", ar: "قيود اليومية" },
        { en: "Period Closing", ar: "إغلاق الفترة" },
      ],
    },
    {
      icon: BarChart3,
      title: { en: "Reports", ar: "التقارير" },
      description: { en: "Financial statements and analytics", ar: "البيانات المالية والتحليلات" },
      links: [
        { en: "Balance Sheet", ar: "الميزانية العمومية" },
        { en: "Income Statement", ar: "قائمة الدخل" },
        { en: "Cash Flow Statement", ar: "قائمة التدفقات النقدية" },
      ],
    },
    {
      icon: Users,
      title: { en: "User Management", ar: "إدارة المستخدمين" },
      description: { en: "Roles, permissions, and access control", ar: "الأدوار والصلاحيات والتحكم في الوصول" },
      links: [
        { en: "User Roles", ar: "أدوار المستخدمين" },
        { en: "Permissions", ar: "الصلاحيات" },
        { en: "Multi-Organization", ar: "تعدد المنظمات" },
      ],
    },
    {
      icon: Code2,
      title: { en: "API Reference", ar: "مرجع API" },
      description: { en: "Developer documentation and APIs", ar: "توثيق المطورين وAPIs" },
      links: [
        { en: "Authentication", ar: "المصادقة" },
        { en: "Endpoints", ar: "نقاط النهاية" },
        { en: "Webhooks", ar: "Webhooks" },
      ],
    },
    {
      icon: Shield,
      title: { en: "Security", ar: "الأمان" },
      description: { en: "Security practices and compliance", ar: "ممارسات الأمان والامتثال" },
      links: [
        { en: "Data Protection", ar: "حماية البيانات" },
        { en: "Encryption", ar: "التشفير" },
        { en: "Compliance", ar: "الامتثال" },
      ],
    },
    {
      icon: FileText,
      title: { en: "Integrations", ar: "التكاملات" },
      description: { en: "Connect with other services", ar: "الاتصال بالخدمات الأخرى" },
      links: [
        { en: "Payment Gateways", ar: "بوابات الدفع" },
        { en: "Banking APIs", ar: "واجهات البنوك" },
        { en: "Third-Party Apps", ar: "تطبيقات الطرف الثالث" },
      ],
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 me-2" />
              {isRTL ? "العودة" : "Back"}
            </Button>
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              INFERA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggleLang} data-testid="button-toggle-language">
              <Languages className="w-4 h-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isRTL ? "الوثائق" : "Documentation"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL
              ? "دليلك الشامل لاستخدام منصة INFERA Finance AI Global"
              : "Your comprehensive guide to using INFERA Finance AI Global platform"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section, index) => (
            <Card key={index} className="hover-elevate transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title[lang]}</CardTitle>
                    <p className="text-sm text-muted-foreground">{section.description[lang]}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      {link[lang]}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
