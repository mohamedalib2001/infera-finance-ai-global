import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Cookie, Settings, BarChart, Target, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const content = {
  en: {
    back: "Back",
    title: "Cookie Policy",
    subtitle: "How We Use Cookies",
    lastUpdated: "Last Updated",
    date: "January 2026",
    intro: "This Cookie Policy explains how INFERA Finance AI GlobalCloud uses cookies and similar technologies to recognize you when you visit our platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.",
    whatAreCookies: {
      title: "What Are Cookies?",
      text: "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information."
    },
    types: {
      title: "Types of Cookies We Use",
      items: [
        {
          icon: Shield,
          name: "Essential Cookies",
          desc: "These cookies are strictly necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you such as logging in, setting privacy preferences, or filling in forms.",
          required: true
        },
        {
          icon: BarChart,
          name: "Analytics Cookies",
          desc: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.",
          required: false
        },
        {
          icon: Settings,
          name: "Functional Cookies",
          desc: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.",
          required: false
        },
        {
          icon: Target,
          name: "Marketing Cookies",
          desc: "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.",
          required: false
        }
      ]
    },
    thirdParty: {
      title: "Third-Party Cookies",
      text: "In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service and deliver advertisements on and through the Service."
    },
    control: {
      title: "How to Control Cookies",
      text: "You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided below. You can also set or amend your web browser controls to accept or refuse cookies.",
      browserSettings: "Most web browsers allow some control of cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org."
    },
    preferences: {
      title: "Cookie Preferences",
      save: "Save Preferences",
      saved: "Preferences saved successfully!"
    },
    retention: {
      title: "Cookie Retention",
      items: [
        { type: "Session Cookies", duration: "Deleted when browser closes" },
        { type: "Persistent Cookies", duration: "Up to 2 years" },
        { type: "Analytics Cookies", duration: "26 months" },
        { type: "Marketing Cookies", duration: "90 days" }
      ]
    },
    contact: {
      title: "Questions?",
      text: "If you have any questions about our use of cookies, please contact us at",
      email: "privacy@inferafinance.com"
    }
  },
  ar: {
    back: "رجوع",
    title: "سياسة ملفات تعريف الارتباط",
    subtitle: "كيف نستخدم ملفات تعريف الارتباط",
    lastUpdated: "آخر تحديث",
    date: "يناير 2026",
    intro: "توضح سياسة ملفات تعريف الارتباط هذه كيفية استخدام INFERA Finance AI GlobalCloud لملفات تعريف الارتباط والتقنيات المماثلة للتعرف عليك عند زيارة منصتنا. تشرح ماهية هذه التقنيات وسبب استخدامنا لها، بالإضافة إلى حقوقك في التحكم في استخدامنا لها.",
    whatAreCookies: {
      title: "ما هي ملفات تعريف الارتباط؟",
      text: "ملفات تعريف الارتباط هي ملفات بيانات صغيرة يتم وضعها على جهاز الكمبيوتر أو الجهاز المحمول عند زيارة موقع ويب. يستخدم أصحاب مواقع الويب ملفات تعريف الارتباط على نطاق واسع لجعل مواقعهم تعمل، أو لتعمل بشكل أكثر كفاءة، وكذلك لتوفير معلومات التقارير."
    },
    types: {
      title: "أنواع ملفات تعريف الارتباط التي نستخدمها",
      items: [
        {
          icon: Shield,
          name: "ملفات تعريف الارتباط الأساسية",
          desc: "هذه الملفات ضرورية تماماً لعمل الموقع ولا يمكن إيقافها في أنظمتنا. يتم تعيينها عادةً فقط استجابةً لإجراءات قمت بها مثل تسجيل الدخول أو تعيين تفضيلات الخصوصية أو ملء النماذج.",
          required: true
        },
        {
          icon: BarChart,
          name: "ملفات تعريف الارتباط التحليلية",
          desc: "تتيح لنا هذه الملفات حساب الزيارات ومصادر حركة المرور حتى نتمكن من قياس وتحسين أداء موقعنا. تساعدنا في معرفة الصفحات الأكثر والأقل شعبية.",
          required: false
        },
        {
          icon: Settings,
          name: "ملفات تعريف الارتباط الوظيفية",
          desc: "تمكّن هذه الملفات الموقع من توفير وظائف محسنة وتخصيص. قد يتم تعيينها بواسطتنا أو بواسطة مزودي خدمات الطرف الثالث الذين أضفنا خدماتهم إلى صفحاتنا.",
          required: false
        },
        {
          icon: Target,
          name: "ملفات تعريف الارتباط التسويقية",
          desc: "قد يتم تعيين هذه الملفات عبر موقعنا بواسطة شركائنا الإعلانيين. قد تستخدمها هذه الشركات لبناء ملف تعريف لاهتماماتك وعرض إعلانات ذات صلة على مواقع أخرى.",
          required: false
        }
      ]
    },
    thirdParty: {
      title: "ملفات تعريف ارتباط الطرف الثالث",
      text: "بالإضافة إلى ملفات تعريف الارتباط الخاصة بنا، قد نستخدم أيضاً ملفات تعريف ارتباط مختلفة من جهات خارجية للإبلاغ عن إحصائيات الاستخدام للخدمة وتقديم الإعلانات على الخدمة ومن خلالها."
    },
    control: {
      title: "كيفية التحكم في ملفات تعريف الارتباط",
      text: "لديك الحق في تقرير قبول أو رفض ملفات تعريف الارتباط. يمكنك ممارسة تفضيلاتك بشأن ملفات تعريف الارتباط بالنقر على روابط إلغاء الاشتراك المناسبة المتوفرة أدناه. يمكنك أيضاً ضبط أو تعديل إعدادات متصفح الويب لقبول أو رفض ملفات تعريف الارتباط.",
      browserSettings: "تسمح معظم متصفحات الويب ببعض التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح. لمعرفة المزيد عن ملفات تعريف الارتباط، بما في ذلك كيفية معرفة ملفات تعريف الارتباط التي تم تعيينها، قم بزيارة www.aboutcookies.org أو www.allaboutcookies.org."
    },
    preferences: {
      title: "تفضيلات ملفات تعريف الارتباط",
      save: "حفظ التفضيلات",
      saved: "تم حفظ التفضيلات بنجاح!"
    },
    retention: {
      title: "مدة الاحتفاظ بملفات تعريف الارتباط",
      items: [
        { type: "ملفات الجلسة", duration: "تُحذف عند إغلاق المتصفح" },
        { type: "الملفات الدائمة", duration: "حتى سنتين" },
        { type: "ملفات التحليلات", duration: "26 شهراً" },
        { type: "ملفات التسويق", duration: "90 يوماً" }
      ]
    },
    contact: {
      title: "أسئلة؟",
      text: "إذا كان لديك أي أسئلة حول استخدامنا لملفات تعريف الارتباط، يرجى الاتصال بنا على",
      email: "privacy@inferafinance.com"
    }
  }
};

export default function Cookies() {
  const { lang } = useI18n();
  const t = content[lang];
  const isRTL = lang === "ar";
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false
  });

  const handleSave = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    toast({ title: t.preferences.saved });
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t.back}
          </Button>
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Cookie className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-cookies-title">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
          <p className="text-sm text-muted-foreground mt-4">{t.lastUpdated}: {t.date}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-12">
          <p className="text-muted-foreground leading-relaxed">{t.intro}</p>
        </div>

        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t.whatAreCookies.title}</h2>
            <p className="text-muted-foreground">{t.whatAreCookies.text}</p>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t.types.title}</h2>
          <div className="space-y-4">
            {t.types.items.map((item, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.required ? (
                        <span className="text-xs text-muted-foreground">{lang === "ar" ? "مطلوب" : "Required"}</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <h2 className="text-xl font-bold mb-4">{t.preferences.title}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t.types.items[0].name}</Label>
                  <p className="text-sm text-muted-foreground">{lang === "ar" ? "مطلوب دائماً" : "Always required"}</p>
                </div>
                <Switch checked={true} disabled data-testid="switch-essential" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-medium">{t.types.items[1].name}</Label>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                  data-testid="switch-analytics"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-medium">{t.types.items[2].name}</Label>
                <Switch 
                  checked={preferences.functional} 
                  onCheckedChange={(checked) => setPreferences({...preferences, functional: checked})}
                  data-testid="switch-functional"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-medium">{t.types.items[3].name}</Label>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                  data-testid="switch-marketing"
                />
              </div>
              <Button onClick={handleSave} className="w-full mt-4" data-testid="button-save-preferences">
                {t.preferences.save}
              </Button>
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t.thirdParty.title}</h2>
            <p className="text-muted-foreground">{t.thirdParty.text}</p>
          </Card>
        </section>

        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t.control.title}</h2>
            <p className="text-muted-foreground mb-4">{t.control.text}</p>
            <p className="text-sm text-muted-foreground">{t.control.browserSettings}</p>
          </Card>
        </section>

        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t.retention.title}</h2>
            <div className="space-y-2">
              {t.retention.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-muted-foreground">{item.type}</span>
                  <span className="font-medium">{item.duration}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">{t.contact.title}</h2>
            <p className="text-muted-foreground">
              {t.contact.text} <a href={`mailto:${t.contact.email}`} className="text-primary hover:underline">{t.contact.email}</a>
            </p>
          </Card>
        </section>

        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          © {new Date().getFullYear()} INFERA Finance AI GlobalCloud. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
