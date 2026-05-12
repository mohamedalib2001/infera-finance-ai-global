import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Globe, Crown, Zap } from "lucide-react";

const plans = [
  {
    id: "free",
    name: { en: "Free", ar: "مجاني" },
    price: { monthly: 0, yearly: 0 },
    description: { en: "For individuals getting started", ar: "للأفراد الذين يبدؤون" },
    features: {
      en: [
        "1 Organization",
        "Up to 100 transactions/month",
        "Basic reports",
        "Email support",
      ],
      ar: [
        "مؤسسة واحدة",
        "حتى 100 معاملة/شهر",
        "تقارير أساسية",
        "دعم بالبريد الإلكتروني",
      ],
    },
    icon: Zap,
    popular: false,
  },
  {
    id: "starter",
    name: { en: "Starter", ar: "المبتدئ" },
    price: { monthly: 29, yearly: 290 },
    description: { en: "For small businesses", ar: "للأعمال الصغيرة" },
    features: {
      en: [
        "3 Organizations",
        "Up to 1,000 transactions/month",
        "Advanced reports",
        "Invoice management",
        "Budget tracking",
        "Priority email support",
      ],
      ar: [
        "3 مؤسسات",
        "حتى 1,000 معاملة/شهر",
        "تقارير متقدمة",
        "إدارة الفواتير",
        "تتبع الميزانية",
        "دعم بريد إلكتروني أولوي",
      ],
    },
    icon: Building2,
    popular: false,
  },
  {
    id: "professional",
    name: { en: "Professional", ar: "المحترف" },
    price: { monthly: 99, yearly: 990 },
    description: { en: "For growing companies", ar: "للشركات النامية" },
    features: {
      en: [
        "10 Organizations",
        "Unlimited transactions",
        "AI-powered insights",
        "Cash flow forecasting",
        "Multi-currency support",
        "API access",
        "24/7 Priority support",
        "Custom reports",
      ],
      ar: [
        "10 مؤسسات",
        "معاملات غير محدودة",
        "رؤى مدعومة بالذكاء الاصطناعي",
        "توقعات التدفق النقدي",
        "دعم العملات المتعددة",
        "الوصول لواجهة API",
        "دعم أولوي 24/7",
        "تقارير مخصصة",
      ],
    },
    icon: Sparkles,
    popular: true,
  },
  {
    id: "enterprise",
    name: { en: "Enterprise", ar: "المؤسسات" },
    price: { monthly: 299, yearly: 2990 },
    description: { en: "For large organizations", ar: "للمؤسسات الكبيرة" },
    features: {
      en: [
        "Unlimited Organizations",
        "Unlimited everything",
        "Advanced AI analytics",
        "IFRS/GAAP compliance",
        "Audit trail & compliance",
        "SSO & advanced security",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      ar: [
        "مؤسسات غير محدودة",
        "كل شيء غير محدود",
        "تحليلات ذكاء اصطناعي متقدمة",
        "التوافق مع IFRS/GAAP",
        "مسار التدقيق والامتثال",
        "SSO وأمان متقدم",
        "مدير حساب مخصص",
        "تكاملات مخصصة",
        "ضمان SLA",
      ],
    },
    icon: Crown,
    popular: false,
  },
];

export default function Pricing() {
  const { t, lang, isRTL } = useI18n();

  const handleSubscribe = (planId: string) => {
    if (planId === "free") {
      window.location.href = "/api/login";
    } else {
      window.location.href = `/api/create-checkout-session?plan=${planId}`;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            {lang === "ar" ? "خطط الأسعار" : "Pricing Plans"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            {lang === "ar" ? "اختر الخطة المناسبة لك" : "Choose the Right Plan for You"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {lang === "ar"
              ? "ابدأ مجاناً وقم بالترقية مع نمو أعمالك"
              : "Start free and scale as your business grows"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative h-full flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/20 scale-105"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {lang === "ar" ? "الأكثر شيوعاً" : "Most Popular"}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-3 rounded-xl bg-primary/10 w-fit">
                    <plan.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    {plan.name[lang]}
                  </CardTitle>
                  <CardDescription>
                    {plan.description[lang]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">${plan.price.monthly}</span>
                    <span className="text-muted-foreground">
                      /{lang === "ar" ? "شهر" : "month"}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features[lang].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    {plan.price.monthly === 0
                      ? lang === "ar"
                        ? "ابدأ مجاناً"
                        : "Start Free"
                      : lang === "ar"
                      ? "اشترك الآن"
                      : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            {lang === "ar"
              ? "جميع الخطط تشمل تجربة مجانية لمدة 14 يوماً"
              : "All plans include a 14-day free trial"}
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {lang === "ar" ? "لا حاجة لبطاقة ائتمان" : "No credit card required"}
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {lang === "ar" ? "إلغاء في أي وقت" : "Cancel anytime"}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
