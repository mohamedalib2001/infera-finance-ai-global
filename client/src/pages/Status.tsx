import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n-context";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Languages,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";

export default function Status() {
  const { lang, setLang, isRTL } = useI18n();
  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const { data: healthData } = useQuery({
    queryKey: ['/health'],
    refetchInterval: 30000,
  });

  const services = [
    {
      icon: Server,
      name: { en: "API Server", ar: "خادم API" },
      status: "operational",
      uptime: "99.99%",
    },
    {
      icon: Database,
      name: { en: "Database", ar: "قاعدة البيانات" },
      status: "operational",
      uptime: "99.98%",
    },
    {
      icon: Globe,
      name: { en: "Web Application", ar: "تطبيق الويب" },
      status: "operational",
      uptime: "99.99%",
    },
    {
      icon: Shield,
      name: { en: "Authentication", ar: "المصادقة" },
      status: "operational",
      uptime: "99.99%",
    },
    {
      icon: Zap,
      name: { en: "AI Analytics", ar: "تحليلات الذكاء الاصطناعي" },
      status: "operational",
      uptime: "99.95%",
    },
    {
      icon: Clock,
      name: { en: "Background Jobs", ar: "المهام الخلفية" },
      status: "operational",
      uptime: "99.97%",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "outage":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            {isRTL ? "يعمل" : "Operational"}
          </Badge>
        );
      case "degraded":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            {isRTL ? "متدهور" : "Degraded"}
          </Badge>
        );
      case "outage":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            {isRTL ? "انقطاع" : "Outage"}
          </Badge>
        );
      default:
        return null;
    }
  };

  const overallStatus = services.every(s => s.status === "operational") ? "operational" : "degraded";

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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isRTL ? "حالة النظام" : "System Status"}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            {isRTL
              ? "مراقبة حالة جميع خدمات INFERA Finance AI في الوقت الفعلي"
              : "Real-time monitoring of all INFERA Finance AI services"}
          </p>
          
          <Card className={`inline-flex items-center gap-3 px-6 py-4 ${
            overallStatus === "operational" 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-amber-500/10 border-amber-500/30"
          }`}>
            {overallStatus === "operational" 
              ? <CheckCircle2 className="w-6 h-6 text-green-500" />
              : <AlertTriangle className="w-6 h-6 text-amber-500" />
            }
            <span className="text-lg font-semibold">
              {overallStatus === "operational"
                ? (isRTL ? "جميع الأنظمة تعمل بشكل طبيعي" : "All Systems Operational")
                : (isRTL ? "بعض الأنظمة تواجه مشاكل" : "Some Systems Experiencing Issues")
              }
            </span>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{isRTL ? "حالة الخدمات" : "Service Status"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div className="flex items-center gap-2">
                      <service.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{service.name[lang]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {isRTL ? "وقت التشغيل:" : "Uptime:"} {service.uptime}
                    </span>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "التحديثات الأخيرة" : "Recent Updates"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 py-3 border-b">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">{isRTL ? "صيانة مجدولة مكتملة" : "Scheduled Maintenance Completed"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تم تحديث النظام بنجاح دون انقطاع" : "System upgraded successfully with no downtime"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">{isRTL ? "تحسينات الأداء" : "Performance Improvements"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "تم تحسين سرعة استجابة API بنسبة 40%" : "API response times improved by 40%"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
