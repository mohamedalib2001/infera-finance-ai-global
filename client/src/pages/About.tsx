import { useI18n } from "@/lib/i18n-context";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Target, Eye, Heart, Users, Award, Globe, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const content = {
  en: {
    back: "Back",
    title: "About INFERA",
    subtitle: "Empowering Financial Excellence Through Innovation",
    story: {
      title: "Our Story",
      p1: "Founded with a vision to revolutionize financial management, INFERA Finance AI GlobalCloud emerged from a deep understanding of the challenges businesses face in managing their finances effectively.",
      p2: "Our team of financial experts, technologists, and AI specialists came together to create a platform that combines cutting-edge artificial intelligence with robust accounting principles, delivering a solution that transforms how organizations approach financial management.",
      p3: "Today, INFERA serves thousands of businesses worldwide, from startups to enterprise organizations, helping them achieve financial clarity, compliance, and growth."
    },
    mission: {
      title: "Our Mission",
      text: "To democratize access to enterprise-grade financial tools, enabling organizations of all sizes to make data-driven decisions with confidence and achieve sustainable growth."
    },
    vision: {
      title: "Our Vision",
      text: "To become the world's most trusted AI-powered financial management platform, setting the standard for innovation, security, and user experience in financial technology."
    },
    values: {
      title: "Our Values",
      items: [
        { icon: Shield, title: "Security First", desc: "Your financial data is protected with bank-grade encryption and security protocols." },
        { icon: Heart, title: "Customer Focus", desc: "Every feature we build starts with understanding our customers' needs." },
        { icon: TrendingUp, title: "Innovation", desc: "We continuously push boundaries to deliver cutting-edge financial solutions." },
        { icon: Globe, title: "Global Reach", desc: "Supporting businesses across the world with multi-currency and multi-language capabilities." }
      ]
    },
    stats: {
      title: "INFERA by the Numbers",
      items: [
        { value: "10,000+", label: "Active Users" },
        { value: "50+", label: "Countries" },
        { value: "$2B+", label: "Transactions Processed" },
        { value: "99.9%", label: "Uptime" }
      ]
    },
    leadership: {
      title: "Leadership Team",
      members: [
        { name: "Mohamed Ali", role: "Founder & CEO", desc: "Visionary leader with 15+ years in FinTech" },
        { name: "Sarah Ahmed", role: "Chief Technology Officer", desc: "AI and cloud infrastructure expert" },
        { name: "David Chen", role: "Chief Financial Officer", desc: "Former Big 4 partner with global experience" },
        { name: "Fatima Hassan", role: "VP of Product", desc: "Product strategist focused on user experience" }
      ]
    }
  },
  ar: {
    back: "رجوع",
    title: "عن INFERA",
    subtitle: "تمكين التميز المالي من خلال الابتكار",
    story: {
      title: "قصتنا",
      p1: "تأسست INFERA Finance AI GlobalCloud برؤية لإحداث ثورة في الإدارة المالية، انطلاقاً من فهم عميق للتحديات التي تواجهها الشركات في إدارة شؤونها المالية بفعالية.",
      p2: "اجتمع فريقنا من الخبراء الماليين والتقنيين ومتخصصي الذكاء الاصطناعي لإنشاء منصة تجمع بين الذكاء الاصطناعي المتطور ومبادئ المحاسبة الراسخة، لتقديم حل يغير طريقة تعامل المؤسسات مع الإدارة المالية.",
      p3: "اليوم، تخدم INFERA آلاف الشركات حول العالم، من الشركات الناشئة إلى المؤسسات الكبرى، مساعدةً إياها على تحقيق الوضوح المالي والامتثال والنمو."
    },
    mission: {
      title: "رسالتنا",
      text: "إتاحة الوصول إلى أدوات مالية على مستوى المؤسسات للجميع، وتمكين المنظمات من جميع الأحجام من اتخاذ قرارات مبنية على البيانات بثقة وتحقيق نمو مستدام."
    },
    vision: {
      title: "رؤيتنا",
      text: "أن نصبح المنصة الأكثر موثوقية في العالم للإدارة المالية المدعومة بالذكاء الاصطناعي، ووضع معايير جديدة للابتكار والأمان وتجربة المستخدم في التكنولوجيا المالية."
    },
    values: {
      title: "قيمنا",
      items: [
        { icon: Shield, title: "الأمان أولاً", desc: "بياناتك المالية محمية بتشفير وبروتوكولات أمان على مستوى البنوك." },
        { icon: Heart, title: "التركيز على العميل", desc: "كل ميزة نبنيها تبدأ بفهم احتياجات عملائنا." },
        { icon: TrendingUp, title: "الابتكار", desc: "نتجاوز الحدود باستمرار لتقديم حلول مالية متطورة." },
        { icon: Globe, title: "الانتشار العالمي", desc: "دعم الشركات حول العالم بإمكانيات متعددة العملات واللغات." }
      ]
    },
    stats: {
      title: "INFERA بالأرقام",
      items: [
        { value: "+10,000", label: "مستخدم نشط" },
        { value: "+50", label: "دولة" },
        { value: "+$2B", label: "معاملات معالجة" },
        { value: "99.9%", label: "وقت التشغيل" }
      ]
    },
    leadership: {
      title: "فريق القيادة",
      members: [
        { name: "محمد علي", role: "المؤسس والرئيس التنفيذي", desc: "قائد رؤيوي بخبرة 15+ عاماً في التكنولوجيا المالية" },
        { name: "سارة أحمد", role: "المدير التقني", desc: "خبيرة في الذكاء الاصطناعي والبنية التحتية السحابية" },
        { name: "ديفيد تشين", role: "المدير المالي", desc: "شريك سابق في Big 4 بخبرة عالمية" },
        { name: "فاطمة حسن", role: "نائب رئيس المنتجات", desc: "استراتيجية منتجات تركز على تجربة المستخدم" }
      ]
    }
  }
};

export default function About() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-about-title">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <section className="mb-16">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              {t.story.title}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t.story.p1}</p>
              <p>{t.story.p2}</p>
              <p>{t.story.p3}</p>
            </div>
          </Card>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t.mission.title}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.mission.text}</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">{t.vision.title}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.vision.text}</p>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.values.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.values.items.map((item, index) => (
              <Card key={index} className="p-6 text-center hover-elevate">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5">
            <h2 className="text-2xl font-bold mb-8 text-center">{t.stats.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {t.stats.items.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t.leadership.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.leadership.members.map((member, index) => (
              <Card key={index} className="p-6 text-center hover-elevate">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          © {new Date().getFullYear()} INFERA Finance AI GlobalCloud. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
