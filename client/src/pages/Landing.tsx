import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ChevronRight,
  Sparkles,
  Shield,
  Globe,
  Zap,
  TrendingUp,
  PieChart,
  Wallet,
  Building2,
  Users,
  BarChart3,
  Brain,
  Lock,
  CheckCircle2,
  ArrowRight,
  Languages,
  Play,
  Star,
  Award,
  Clock,
  Target,
  Layers,
  LineChart,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={countRef}>{count.toLocaleString()}{suffix}</span>;
}

function FloatingElement({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const { lang, setLang, isRTL } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang(lang === "en" ? "ar" : "en");
  };

  const services = [
    { icon: Building2, title: { en: "Enterprise Finance", ar: "تمويل المؤسسات" }, desc: { en: "Complete financial management", ar: "إدارة مالية متكاملة" } },
    { icon: Brain, title: { en: "AI Analytics", ar: "تحليلات الذكاء الاصطناعي" }, desc: { en: "Predictive insights", ar: "رؤى تنبؤية" } },
    { icon: Globe, title: { en: "Multi-Currency", ar: "متعدد العملات" }, desc: { en: "Global transactions", ar: "معاملات عالمية" } },
    { icon: Shield, title: { en: "Bank-Grade Security", ar: "أمان مصرفي" }, desc: { en: "Enterprise protection", ar: "حماية مؤسسية" } },
    { icon: BarChart3, title: { en: "Real-time Reports", ar: "تقارير فورية" }, desc: { en: "Live dashboards", ar: "لوحات مباشرة" } },
    { icon: Wallet, title: { en: "Cash Flow", ar: "التدفق النقدي" }, desc: { en: "Automated forecasting", ar: "توقعات آلية" } },
  ];

  const stats = [
    { value: 50000, suffix: "+", label: { en: "Active Users", ar: "مستخدم نشط" } },
    { value: 99.9, suffix: "%", label: { en: "Uptime", ar: "وقت التشغيل" } },
    { value: 150, suffix: "+", label: { en: "Countries", ar: "دولة" } },
    { value: 5, suffix: "B+", label: { en: "Transactions", ar: "معاملة" } },
  ];

  const features = [
    {
      icon: LineChart,
      title: { en: "Intelligent Forecasting", ar: "التنبؤ الذكي" },
      desc: { en: "AI-powered predictions for cash flow, revenue, and expenses with 95% accuracy", ar: "تنبؤات مدعومة بالذكاء الاصطناعي للتدفق النقدي والإيرادات والمصروفات بدقة 95%" },
    },
    {
      icon: CreditCard,
      title: { en: "Automated Payments", ar: "الدفعات الآلية" },
      desc: { en: "Schedule and automate payments across multiple banks and currencies", ar: "جدولة وأتمتة الدفعات عبر بنوك وعملات متعددة" },
    },
    {
      icon: FileText,
      title: { en: "Smart Invoicing", ar: "الفوترة الذكية" },
      desc: { en: "Generate, send, and track invoices with automatic reminders", ar: "إنشاء وإرسال وتتبع الفواتير مع تذكيرات تلقائية" },
    },
    {
      icon: Settings,
      title: { en: "Custom Workflows", ar: "سير عمل مخصص" },
      desc: { en: "Build approval workflows tailored to your business processes", ar: "بناء سير عمل الموافقات المخصصة لعمليات أعمالك" },
    },
  ];

  const testimonials = [
    {
      name: { en: "Sarah Johnson", ar: "سارة جونسون" },
      role: { en: "CFO, TechCorp", ar: "المديرة المالية، تيك كورب" },
      quote: { en: "INFERA transformed how we manage our global finances. The AI insights are game-changing.", ar: "غيّرت INFERA طريقة إدارتنا لأموالنا العالمية. رؤى الذكاء الاصطناعي مذهلة." },
    },
    {
      name: { en: "Ahmed Al-Rashid", ar: "أحمد الراشد" },
      role: { en: "CEO, Global Ventures", ar: "الرئيس التنفيذي، جلوبال فنتشرز" },
      quote: { en: "The best financial platform we've used. Arabic support and RTL design are perfect.", ar: "أفضل منصة مالية استخدمناها. دعم اللغة العربية والتصميم من اليمين لليسار ممتاز." },
    },
    {
      name: { en: "Emily Chen", ar: "إيميلي تشين" },
      role: { en: "Finance Director, StartupX", ar: "مديرة الشؤون المالية، ستارت أب إكس" },
      quote: { en: "From invoicing to forecasting, everything just works. Saved us 20 hours per week.", ar: "من الفوترة إلى التنبؤ، كل شيء يعمل بسلاسة. وفرنا 20 ساعة أسبوعياً." },
    },
  ];

  const partners = ["Microsoft", "Google Cloud", "AWS", "Stripe", "Visa", "Mastercard"];

  return (
    <div className={`min-h-screen bg-background overflow-x-hidden ${isRTL ? "rtl" : "ltr"}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-500 to-cyan-500 rounded-xl blur opacity-30" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  INFERA
                </span>
              </motion.div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {[
                { href: "#features", label: { en: "Features", ar: "المميزات" } },
                { href: "#services", label: { en: "Services", ar: "الخدمات" } },
                { href: "/pricing", label: { en: "Pricing", ar: "الأسعار" } },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {item.label[lang]}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                data-testid="button-toggle-language"
              >
                <Languages className="w-5 h-5" />
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="button-login">
                  {isRTL ? "تسجيل الدخول" : "Login"}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" data-testid="button-get-started">
                  {isRTL ? "ابدأ الآن" : "Get Started"}
                  <ChevronRight className="w-4 h-4 ms-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={isRTL ? "order-2 lg:order-1" : ""}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                  <Sparkles className="w-4 h-4 me-2" />
                  {isRTL ? "منصة مالية مدعومة بالذكاء الاصطناعي" : "AI-Powered Financial Platform"}
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  {isRTL ? "أطلق العنان لقوة" : "Unleash the Power of"}
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  {isRTL ? "الإدارة المالية الذكية" : "Intelligent Finance"}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground mb-8 max-w-lg"
              >
                {isRTL
                  ? "منصة سحابية موحدة للإدارة المالية والتحليلات والتنبؤات والأتمتة للأفراد والشركات والمؤسسات الكبيرة."
                  : "A unified cloud platform for financial management, analytics, forecasting, and automation for individuals, businesses, and enterprises."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg px-8" data-testid="button-hero-start">
                    <Sparkles className="w-5 h-5 me-2" />
                    {isRTL ? "ابدأ مجاناً" : "Start Free"}
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8 group" data-testid="button-hero-demo">
                  <Play className="w-5 h-5 me-2 group-hover:text-primary transition-colors" />
                  {isRTL ? "شاهد العرض" : "Watch Demo"}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {isRTL ? "لا حاجة لبطاقة ائتمان" : "No credit card required"}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {isRTL ? "14 يوم تجربة مجانية" : "14-day free trial"}
                </span>
              </motion.div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`relative ${isRTL ? "order-1 lg:order-2" : ""}`}
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
                
                {/* Main Dashboard Card */}
                <Card className="relative bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden">
                  <CardContent className="p-6">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? "إجمالي الرصيد" : "Total Balance"}</p>
                        <p className="text-3xl font-bold">$2,847,392.00</p>
                      </div>
                      <div className="flex items-center gap-2 text-green-500">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold">+23.5%</span>
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5 rounded-xl mb-6 flex items-end justify-around px-4 pb-4">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                          className="w-4 bg-gradient-to-t from-primary to-purple-500 rounded-t-sm"
                        />
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: isRTL ? "الإيرادات" : "Revenue", value: "$1.2M", change: "+12%" },
                        { label: isRTL ? "المصروفات" : "Expenses", value: "$845K", change: "-8%" },
                        { label: isRTL ? "الأرباح" : "Profit", value: "$355K", change: "+24%" },
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="font-bold">{stat.value}</p>
                          <p className={`text-xs ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                            {stat.change}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Cards */}
                <FloatingElement delay={0} className="absolute -top-4 -right-4 z-10">
                  <Card className="bg-background/80 backdrop-blur-xl border-green-500/30 shadow-lg shadow-green-500/10">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isRTL ? "دخل جديد" : "New Income"}</p>
                        <p className="font-bold text-green-500">+$45,230</p>
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>

                <FloatingElement delay={1} className="absolute -bottom-4 -left-4 z-10">
                  <Card className="bg-background/80 backdrop-blur-xl border-primary/30 shadow-lg shadow-primary/10">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isRTL ? "توقع الذكاء الاصطناعي" : "AI Prediction"}</p>
                        <p className="font-bold text-primary">{isRTL ? "نمو +18%" : "+18% Growth"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-sm text-muted-foreground">
              {isRTL ? "موثوق به من قبل الشركات الرائدة حول العالم" : "Trusted by leading companies worldwide"}
            </p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {partners.map((partner, i) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-2xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground">{stat.label[lang]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {isRTL ? "خدماتنا" : "Our Services"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? "كل ما تحتاجه لإدارة أموالك" : "Everything You Need to Manage Your Finances"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "مجموعة شاملة من الأدوات المالية المدعومة بالذكاء الاصطناعي"
                : "A comprehensive suite of AI-powered financial tools"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group hover-elevate">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <service.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.title[lang]}</h3>
                    <p className="text-muted-foreground">{service.desc[lang]}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {isRTL ? "المميزات" : "Features"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? "مميزات قوية لنمو أعمالك" : "Powerful Features for Your Business Growth"}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50 hover-elevate">
                  <CardContent className="p-8 flex gap-6">
                    <div className="shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title[lang]}</h3>
                      <p className="text-muted-foreground">{feature.desc[lang]}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {isRTL ? "آراء العملاء" : "Testimonials"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? "ماذا يقول عملاؤنا" : "What Our Customers Say"}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full bg-background/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.quote[lang]}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                        {testimonial.name.en.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name[lang]}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role[lang]}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                {isRTL ? "الأمان" : "Security"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {isRTL ? "أمان على مستوى البنوك" : "Bank-Level Security"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {isRTL
                  ? "بياناتك محمية بأعلى معايير الأمان المصرفي. نستخدم التشفير من الطرف إلى الطرف وأحدث تقنيات الأمان."
                  : "Your data is protected with the highest banking security standards. We use end-to-end encryption and the latest security technologies."}
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: { en: "256-bit SSL Encryption", ar: "تشفير SSL 256-bit" } },
                  { icon: Lock, text: { en: "Two-Factor Authentication", ar: "مصادقة ثنائية" } },
                  { icon: Award, text: { en: "SOC 2 Type II Certified", ar: "شهادة SOC 2 Type II" } },
                  { icon: Clock, text: { en: "24/7 Security Monitoring", ar: "مراقبة أمنية على مدار الساعة" } },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.text[lang]}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <Card className="relative bg-background/50 backdrop-blur-xl border-border/50 p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-6">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {isRTL ? "بياناتك محمية" : "Your Data is Protected"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isRTL
                      ? "نحن ملتزمون بحماية خصوصيتك وأمان بياناتك"
                      : "We are committed to protecting your privacy and data security"}
                  </p>
                  <div className="flex gap-4">
                    <Badge variant="outline" className="px-4 py-2">GDPR</Badge>
                    <Badge variant="outline" className="px-4 py-2">ISO 27001</Badge>
                    <Badge variant="outline" className="px-4 py-2">PCI DSS</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-cyan-600">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <CardContent className="relative p-12 md:p-16 text-center text-white">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-bold mb-4"
                >
                  {isRTL ? "ابدأ رحلتك المالية اليوم" : "Start Your Financial Journey Today"}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
                >
                  {isRTL
                    ? "انضم إلى آلاف المستخدمين الذين يثقون بمنصتنا لإدارة أموالهم بذكاء"
                    : "Join thousands of users who trust our platform to manage their finances intelligently"}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-cta-register">
                      {isRTL ? "سجل الآن مجاناً" : "Register Now Free"}
                      <ArrowRight className="w-5 h-5 ms-2" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20" data-testid="button-cta-pricing">
                      {isRTL ? "عرض الأسعار" : "View Pricing"}
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer - INFERA Finance AI Global Specific */}
      <footer className="py-16 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            
            {/* Column 1: Platform Identity */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
                    INFERA Finance AI Global
                  </span>
                  <span className="text-xs text-muted-foreground">™</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {isRTL
                  ? "منصة سحابية مؤسسية للإدارة المالية الذكية. تقدم المحاسبة، التحليلات بالذكاء الاصطناعي، والتقارير المالية للشركات والمؤسسات حول العالم."
                  : "Enterprise cloud platform for intelligent financial management. Delivering accounting, AI-powered analytics, and financial reporting for businesses and institutions worldwide."}
              </p>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
                {isRTL ? "الشركة" : "Company"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-about">
                      {isRTL ? "من نحن" : "About"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/careers">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-careers">
                      {isRTL ? "الوظائف" : "Careers"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-contact">
                      {isRTL ? "اتصل بنا" : "Contact"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/security">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-security">
                      {isRTL ? "الأمان" : "Security"}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
                {isRTL ? "القانونية" : "Legal"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-privacy">
                      {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-terms">
                      {isRTL ? "شروط الخدمة" : "Terms of Service"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/cookies">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-cookies">
                      {isRTL ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect / Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
                {isRTL ? "الدعم" : "Support"}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/help">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-help">
                      {isRTL ? "مركز المساعدة" : "Help Center"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/docs">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-docs">
                      {isRTL ? "الوثائق" : "Documentation"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/status">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm" data-testid="link-footer-status">
                      {isRTL ? "حالة النظام" : "System Status"}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-start">
                © {new Date().getFullYear()} INFERA Finance AI Global™. {isRTL ? "جميع الحقوق محفوظة." : "All rights reserved."}
              </p>
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted-foreground">
                  {isRTL ? "صُنع بأمان مصرفي" : "Built with bank-grade security"}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">ISO 27001</Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">GDPR</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
