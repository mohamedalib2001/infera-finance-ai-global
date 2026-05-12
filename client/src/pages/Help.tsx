import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n-context";
import {
  ArrowLeft,
  Languages,
  BookOpen,
  MessageCircle,
  FileQuestion,
  Video,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";

export default function Help() {
  const { lang, setLang, isRTL } = useI18n();
  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const helpCategories = [
    {
      icon: BookOpen,
      title: { en: "Getting Started", ar: "البدء" },
      description: { en: "Learn the basics of using INFERA Finance AI", ar: "تعلم أساسيات استخدام INFERA Finance AI" },
      articles: [
        { en: "Creating your first organization", ar: "إنشاء أول منظمة لك" },
        { en: "Setting up your chart of accounts", ar: "إعداد دليل الحسابات" },
        { en: "Recording your first transaction", ar: "تسجيل أول معاملة لك" },
      ],
    },
    {
      icon: FileQuestion,
      title: { en: "FAQs", ar: "الأسئلة الشائعة" },
      description: { en: "Find answers to common questions", ar: "اعثر على إجابات للأسئلة الشائعة" },
      articles: [
        { en: "How do I generate financial reports?", ar: "كيف أنشئ تقارير مالية؟" },
        { en: "How does AI analysis work?", ar: "كيف يعمل تحليل الذكاء الاصطناعي؟" },
        { en: "Managing user permissions", ar: "إدارة صلاحيات المستخدمين" },
      ],
    },
    {
      icon: Video,
      title: { en: "Video Tutorials", ar: "دروس فيديو" },
      description: { en: "Step-by-step video guides", ar: "أدلة فيديو خطوة بخطوة" },
      articles: [
        { en: "Dashboard overview walkthrough", ar: "جولة نظرة عامة على لوحة التحكم" },
        { en: "Advanced reporting features", ar: "ميزات التقارير المتقدمة" },
        { en: "Multi-organization management", ar: "إدارة المنظمات المتعددة" },
      ],
    },
    {
      icon: MessageCircle,
      title: { en: "Contact Support", ar: "اتصل بالدعم" },
      description: { en: "Get help from our support team", ar: "احصل على مساعدة من فريق الدعم" },
      articles: [
        { en: "Submit a support ticket", ar: "تقديم تذكرة دعم" },
        { en: "Live chat with support", ar: "دردشة مباشرة مع الدعم" },
        { en: "Schedule a consultation", ar: "جدولة استشارة" },
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
            {isRTL ? "مركز المساعدة" : "Help Center"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL
              ? "اعثر على إجابات لأسئلتك، واطلع على الدروس، وتواصل مع فريق الدعم"
              : "Find answers to your questions, browse tutorials, and connect with our support team"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover-elevate transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title[lang]}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description[lang]}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li key={i} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      {article[lang]}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                {isRTL ? "هل تحتاج مساعدة إضافية؟" : "Need More Help?"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isRTL
                  ? "تواصل مع فريق الدعم المتخصص"
                  : "Reach out to our dedicated support team"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@infera.finance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+1 (800) 123-4567</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
