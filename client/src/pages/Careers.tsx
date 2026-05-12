import { useI18n } from "@/lib/i18n-context";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Clock, DollarSign, Heart, Zap, Users, Coffee, Plane, GraduationCap, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const content = {
  en: {
    back: "Back",
    title: "Careers at INFERA",
    subtitle: "Join Us in Shaping the Future of Finance",
    intro: "We're building the next generation of financial technology. Join our team of passionate innovators and make a global impact.",
    culture: {
      title: "Our Culture",
      items: [
        { icon: Zap, title: "Innovation First", desc: "We encourage bold ideas and creative problem-solving" },
        { icon: Users, title: "Collaborative", desc: "Work with talented people from diverse backgrounds" },
        { icon: Heart, title: "Work-Life Balance", desc: "Flexible schedules and remote work options" },
        { icon: GraduationCap, title: "Growth Mindset", desc: "Continuous learning and development opportunities" }
      ]
    },
    benefits: {
      title: "Benefits & Perks",
      items: [
        { icon: DollarSign, title: "Competitive Salary", desc: "Top-tier compensation packages" },
        { icon: Heart, title: "Health Insurance", desc: "Comprehensive medical, dental & vision" },
        { icon: Plane, title: "Paid Time Off", desc: "Generous vacation and sick leave" },
        { icon: Coffee, title: "Remote Work", desc: "Work from anywhere flexibility" },
        { icon: GraduationCap, title: "Learning Budget", desc: "$2,000 annual education allowance" },
        { icon: Building2, title: "Equity", desc: "Stock options for all employees" }
      ]
    },
    positions: {
      title: "Open Positions",
      apply: "Apply Now",
      jobs: [
        { title: "Senior Full-Stack Engineer", dept: "Engineering", location: "Remote", type: "Full-time", salary: "$120k-$180k" },
        { title: "AI/ML Engineer", dept: "AI Team", location: "Remote", type: "Full-time", salary: "$140k-$200k" },
        { title: "Product Manager", dept: "Product", location: "Dubai, UAE", type: "Full-time", salary: "$100k-$140k" },
        { title: "Senior UX Designer", dept: "Design", location: "Remote", type: "Full-time", salary: "$90k-$130k" },
        { title: "DevOps Engineer", dept: "Infrastructure", location: "Remote", type: "Full-time", salary: "$110k-$160k" },
        { title: "Financial Analyst", dept: "Finance", location: "London, UK", type: "Full-time", salary: "$80k-$110k" },
        { title: "Customer Success Manager", dept: "Support", location: "Remote", type: "Full-time", salary: "$70k-$100k" },
        { title: "Sales Executive", dept: "Sales", location: "New York, USA", type: "Full-time", salary: "$90k-$150k + Commission" }
      ]
    },
    noMatch: {
      title: "Don't see a role that fits?",
      text: "We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.",
      button: "Send Resume"
    }
  },
  ar: {
    back: "رجوع",
    title: "الوظائف في INFERA",
    subtitle: "انضم إلينا في تشكيل مستقبل التمويل",
    intro: "نحن نبني الجيل القادم من التكنولوجيا المالية. انضم إلى فريقنا من المبتكرين المتحمسين وأحدث تأثيراً عالمياً.",
    culture: {
      title: "ثقافتنا",
      items: [
        { icon: Zap, title: "الابتكار أولاً", desc: "نشجع الأفكار الجريئة وحل المشكلات الإبداعي" },
        { icon: Users, title: "التعاون", desc: "اعمل مع أشخاص موهوبين من خلفيات متنوعة" },
        { icon: Heart, title: "التوازن بين العمل والحياة", desc: "جداول مرنة وخيارات العمل عن بُعد" },
        { icon: GraduationCap, title: "عقلية النمو", desc: "فرص التعلم والتطوير المستمر" }
      ]
    },
    benefits: {
      title: "المزايا والفوائد",
      items: [
        { icon: DollarSign, title: "راتب تنافسي", desc: "حزم تعويضات من الدرجة الأولى" },
        { icon: Heart, title: "تأمين صحي", desc: "تأمين طبي وأسنان ورؤية شامل" },
        { icon: Plane, title: "إجازات مدفوعة", desc: "إجازات سنوية ومرضية سخية" },
        { icon: Coffee, title: "العمل عن بُعد", desc: "مرونة العمل من أي مكان" },
        { icon: GraduationCap, title: "ميزانية التعلم", desc: "$2,000 بدل تعليم سنوي" },
        { icon: Building2, title: "أسهم", desc: "خيارات أسهم لجميع الموظفين" }
      ]
    },
    positions: {
      title: "الوظائف المتاحة",
      apply: "تقدم الآن",
      jobs: [
        { title: "مهندس Full-Stack أول", dept: "الهندسة", location: "عن بُعد", type: "دوام كامل", salary: "$120k-$180k" },
        { title: "مهندس AI/ML", dept: "فريق الذكاء الاصطناعي", location: "عن بُعد", type: "دوام كامل", salary: "$140k-$200k" },
        { title: "مدير منتج", dept: "المنتجات", location: "دبي، الإمارات", type: "دوام كامل", salary: "$100k-$140k" },
        { title: "مصمم UX أول", dept: "التصميم", location: "عن بُعد", type: "دوام كامل", salary: "$90k-$130k" },
        { title: "مهندس DevOps", dept: "البنية التحتية", location: "عن بُعد", type: "دوام كامل", salary: "$110k-$160k" },
        { title: "محلل مالي", dept: "المالية", location: "لندن، المملكة المتحدة", type: "دوام كامل", salary: "$80k-$110k" },
        { title: "مدير نجاح العملاء", dept: "الدعم", location: "عن بُعد", type: "دوام كامل", salary: "$70k-$100k" },
        { title: "مدير مبيعات", dept: "المبيعات", location: "نيويورك، الولايات المتحدة", type: "دوام كامل", salary: "$90k-$150k + عمولة" }
      ]
    },
    noMatch: {
      title: "لم تجد الوظيفة المناسبة؟",
      text: "نحن نبحث دائماً عن المواهب. أرسل لنا سيرتك الذاتية وسنضعك في الاعتبار للفرص المستقبلية.",
      button: "أرسل السيرة الذاتية"
    }
  }
};

export default function Careers() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-careers-title">
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
          <h2 className="text-2xl font-bold mb-8 text-center">{t.culture.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.culture.items.map((item, index) => (
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
            <h2 className="text-2xl font-bold mb-8 text-center">{t.benefits.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.benefits.items.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            {t.positions.title}
          </h2>
          <div className="space-y-4">
            {t.positions.jobs.map((job, index) => (
              <Card key={index} className="p-6 hover-elevate">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <Badge variant="secondary">{job.dept}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <Button data-testid={`button-apply-${index}`}>
                    {t.positions.apply}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t.noMatch.title}</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t.noMatch.text}</p>
            <Button size="lg" data-testid="button-send-resume">
              {t.noMatch.button}
            </Button>
          </Card>
        </section>

        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          © {new Date().getFullYear()} INFERA Finance AI GlobalCloud. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
