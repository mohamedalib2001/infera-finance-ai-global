import { useI18n } from "@/lib/i18n-context";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Shield, Lock, Server, Eye, FileCheck, AlertTriangle, CheckCircle, Key, Database, Cloud, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const content = {
  en: {
    back: "Back",
    title: "Security",
    subtitle: "Enterprise-Grade Protection for Your Financial Data",
    intro: "At INFERA, security isn't just a feature—it's the foundation of everything we build. Your financial data deserves the highest level of protection.",
    certifications: {
      title: "Certifications & Compliance",
      items: [
        { name: "ISO 27001", desc: "Information Security Management", status: "Certified" },
        { name: "SOC 2 Type II", desc: "Service Organization Control", status: "In Progress" },
        { name: "GDPR", desc: "EU Data Protection Regulation", status: "Compliant" },
        { name: "PCI DSS", desc: "Payment Card Industry Standard", status: "Certified" }
      ]
    },
    infrastructure: {
      title: "Infrastructure Security",
      items: [
        { icon: Cloud, title: "Cloud Security", desc: "Hosted on enterprise-grade cloud infrastructure with 99.99% uptime SLA" },
        { icon: Database, title: "Data Encryption", desc: "AES-256 encryption at rest and TLS 1.3 in transit" },
        { icon: Server, title: "Isolated Environments", desc: "Multi-tenant architecture with strict data isolation" },
        { icon: RefreshCw, title: "Automated Backups", desc: "Real-time replication with point-in-time recovery" }
      ]
    },
    practices: {
      title: "Security Practices",
      items: [
        { icon: Key, title: "Multi-Factor Authentication", desc: "Secure login with MFA support including biometrics, SMS, and authenticator apps" },
        { icon: Users, title: "Role-Based Access Control", desc: "Granular permissions with 7 predefined roles and custom role creation" },
        { icon: Eye, title: "Audit Logging", desc: "Complete audit trail of all user actions with IP tracking and timestamps" },
        { icon: Lock, title: "Session Management", desc: "Automatic session timeout, device management, and suspicious activity detection" },
        { icon: FileCheck, title: "Vulnerability Scanning", desc: "Continuous automated security scanning and penetration testing" },
        { icon: AlertTriangle, title: "Incident Response", desc: "24/7 security monitoring with rapid incident response team" }
      ]
    },
    dataProtection: {
      title: "Data Protection",
      items: [
        "All data encrypted with AES-256 encryption",
        "Geographic data residency options available",
        "Regular third-party security audits",
        "Strict data retention and deletion policies",
        "Privacy by design principles",
        "No data sharing with third parties"
      ]
    },
    bugBounty: {
      title: "Security Bug Bounty",
      text: "We partner with the security research community to identify and fix vulnerabilities. If you discover a security issue, please report it responsibly.",
      button: "Report a Vulnerability",
      email: "security@inferafinance.com"
    }
  },
  ar: {
    back: "رجوع",
    title: "الأمان",
    subtitle: "حماية على مستوى المؤسسات لبياناتك المالية",
    intro: "في INFERA، الأمان ليس مجرد ميزة - إنه أساس كل ما نبنيه. بياناتك المالية تستحق أعلى مستوى من الحماية.",
    certifications: {
      title: "الشهادات والامتثال",
      items: [
        { name: "ISO 27001", desc: "إدارة أمن المعلومات", status: "معتمد" },
        { name: "SOC 2 Type II", desc: "مراقبة منظمات الخدمات", status: "قيد التنفيذ" },
        { name: "GDPR", desc: "لائحة حماية البيانات الأوروبية", status: "ملتزم" },
        { name: "PCI DSS", desc: "معيار صناعة بطاقات الدفع", status: "معتمد" }
      ]
    },
    infrastructure: {
      title: "أمن البنية التحتية",
      items: [
        { icon: Cloud, title: "أمان السحابة", desc: "مستضاف على بنية تحتية سحابية على مستوى المؤسسات مع اتفاقية مستوى خدمة 99.99%" },
        { icon: Database, title: "تشفير البيانات", desc: "تشفير AES-256 للبيانات المخزنة و TLS 1.3 للبيانات المنقولة" },
        { icon: Server, title: "بيئات معزولة", desc: "بنية متعددة المستأجرين مع عزل صارم للبيانات" },
        { icon: RefreshCw, title: "نسخ احتياطي تلقائي", desc: "تكرار في الوقت الفعلي مع استرداد نقطة زمنية" }
      ]
    },
    practices: {
      title: "ممارسات الأمان",
      items: [
        { icon: Key, title: "المصادقة متعددة العوامل", desc: "تسجيل دخول آمن مع دعم MFA بما في ذلك القياسات الحيوية والرسائل القصيرة وتطبيقات المصادقة" },
        { icon: Users, title: "التحكم في الوصول بناءً على الدور", desc: "صلاحيات دقيقة مع 7 أدوار محددة مسبقاً وإنشاء أدوار مخصصة" },
        { icon: Eye, title: "سجل التدقيق", desc: "مسار تدقيق كامل لجميع إجراءات المستخدمين مع تتبع IP والطوابع الزمنية" },
        { icon: Lock, title: "إدارة الجلسات", desc: "انتهاء تلقائي للجلسات وإدارة الأجهزة واكتشاف النشاط المشبوه" },
        { icon: FileCheck, title: "فحص الثغرات", desc: "فحص أمني آلي مستمر واختبار الاختراق" },
        { icon: AlertTriangle, title: "الاستجابة للحوادث", desc: "مراقبة أمنية على مدار الساعة مع فريق استجابة سريع للحوادث" }
      ]
    },
    dataProtection: {
      title: "حماية البيانات",
      items: [
        "جميع البيانات مشفرة بتشفير AES-256",
        "خيارات إقامة البيانات الجغرافية متاحة",
        "تدقيقات أمنية منتظمة من جهات خارجية",
        "سياسات صارمة للاحتفاظ بالبيانات وحذفها",
        "مبادئ الخصوصية بالتصميم",
        "لا مشاركة للبيانات مع أطراف ثالثة"
      ]
    },
    bugBounty: {
      title: "مكافأة اكتشاف الثغرات",
      text: "نتشارك مع مجتمع الباحثين الأمنيين لتحديد وإصلاح الثغرات. إذا اكتشفت مشكلة أمنية، يرجى الإبلاغ عنها بشكل مسؤول.",
      button: "الإبلاغ عن ثغرة",
      email: "security@inferafinance.com"
    }
  }
};

export default function Security() {
  const { lang } = useI18n();
  const t = content[lang];
  const isRTL = lang === "ar";

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t.back}
          </Button>
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-security-title">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            {t.subtitle}
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t.intro}
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.certifications.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.certifications.items.map((cert, index) => (
              <Card key={index} className="p-6 text-center hover-elevate">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">{cert.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{cert.desc}</p>
                <Badge variant={cert.status === "Certified" || cert.status === "معتمد" || cert.status === "Compliant" || cert.status === "ملتزم" ? "default" : "secondary"}>
                  {cert.status}
                </Badge>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.infrastructure.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.infrastructure.items.map((item, index) => (
              <Card key={index} className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.practices.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.practices.items.map((item, index) => (
              <Card key={index} className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.dataProtection.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.dataProtection.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-16">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
            <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t.bugBounty.title}</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t.bugBounty.text}</p>
            <Button size="lg" data-testid="button-report-vulnerability">
              {t.bugBounty.button}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">{t.bugBounty.email}</p>
          </Card>
        </section>

        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          © {new Date().getFullYear()} INFERA Finance AI GlobalCloud. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
