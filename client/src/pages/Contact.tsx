import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin, Clock, MessageSquare, Send, Building2, Globe, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const content = {
  en: {
    back: "Back",
    title: "Contact Us",
    subtitle: "We're Here to Help",
    intro: "Have questions about INFERA? Our team is ready to assist you with any inquiries about our platform, pricing, or technical support.",
    form: {
      title: "Send us a Message",
      name: "Full Name",
      namePlaceholder: "Enter your full name",
      email: "Email Address",
      emailPlaceholder: "Enter your email",
      subject: "Subject",
      subjectPlaceholder: "Select a subject",
      subjects: [
        { value: "sales", label: "Sales Inquiry" },
        { value: "support", label: "Technical Support" },
        { value: "billing", label: "Billing Question" },
        { value: "partnership", label: "Partnership" },
        { value: "other", label: "Other" }
      ],
      message: "Message",
      messagePlaceholder: "How can we help you?",
      submit: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully! We'll get back to you within 24 hours."
    },
    offices: {
      title: "Our Offices",
      locations: [
        { city: "Dubai, UAE", address: "DIFC, Gate Building, Tower 2, Level 14", phone: "+971 4 123 4567", type: "Headquarters" },
        { city: "London, UK", address: "1 Canada Square, Canary Wharf, E14 5AB", phone: "+44 20 1234 5678", type: "EMEA" },
        { city: "New York, USA", address: "One World Trade Center, Floor 85", phone: "+1 212 123 4567", type: "Americas" },
        { city: "Singapore", address: "Marina Bay Financial Centre, Tower 1", phone: "+65 6123 4567", type: "APAC" }
      ]
    },
    support: {
      title: "Support Channels",
      items: [
        { icon: Mail, title: "Email Support", value: "support@inferafinance.com", desc: "Response within 24 hours" },
        { icon: Headphones, title: "Phone Support", value: "+971 4 123 4567", desc: "Mon-Fri, 9AM-6PM GST" },
        { icon: MessageSquare, title: "Live Chat", value: "Available 24/7", desc: "Instant assistance" }
      ]
    },
    hours: {
      title: "Business Hours",
      items: [
        { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM GST" },
        { day: "Saturday", hours: "10:00 AM - 2:00 PM GST" },
        { day: "Sunday", hours: "Closed" }
      ]
    }
  },
  ar: {
    back: "رجوع",
    title: "اتصل بنا",
    subtitle: "نحن هنا للمساعدة",
    intro: "هل لديك أسئلة حول INFERA؟ فريقنا مستعد لمساعدتك في أي استفسارات حول منصتنا أو التسعير أو الدعم الفني.",
    form: {
      title: "أرسل لنا رسالة",
      name: "الاسم الكامل",
      namePlaceholder: "أدخل اسمك الكامل",
      email: "البريد الإلكتروني",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      subject: "الموضوع",
      subjectPlaceholder: "اختر موضوعاً",
      subjects: [
        { value: "sales", label: "استفسار مبيعات" },
        { value: "support", label: "دعم تقني" },
        { value: "billing", label: "سؤال عن الفواتير" },
        { value: "partnership", label: "شراكة" },
        { value: "other", label: "أخرى" }
      ],
      message: "الرسالة",
      messagePlaceholder: "كيف يمكننا مساعدتك؟",
      submit: "إرسال الرسالة",
      sending: "جاري الإرسال...",
      success: "تم إرسال الرسالة بنجاح! سنرد عليك خلال 24 ساعة."
    },
    offices: {
      title: "مكاتبنا",
      locations: [
        { city: "دبي، الإمارات", address: "مركز دبي المالي العالمي، مبنى البوابة، برج 2، الطابق 14", phone: "+971 4 123 4567", type: "المقر الرئيسي" },
        { city: "لندن، المملكة المتحدة", address: "1 كندا سكوير، كناري وارف، E14 5AB", phone: "+44 20 1234 5678", type: "أوروبا والشرق الأوسط وأفريقيا" },
        { city: "نيويورك، الولايات المتحدة", address: "مركز التجارة العالمي، الطابق 85", phone: "+1 212 123 4567", type: "الأمريكتان" },
        { city: "سنغافورة", address: "مركز مارينا باي المالي، برج 1", phone: "+65 6123 4567", type: "آسيا والمحيط الهادئ" }
      ]
    },
    support: {
      title: "قنوات الدعم",
      items: [
        { icon: Mail, title: "دعم البريد الإلكتروني", value: "support@inferafinance.com", desc: "الرد خلال 24 ساعة" },
        { icon: Headphones, title: "دعم الهاتف", value: "+971 4 123 4567", desc: "الاثنين-الجمعة، 9ص-6م بتوقيت الخليج" },
        { icon: MessageSquare, title: "الدردشة المباشرة", value: "متاح 24/7", desc: "مساعدة فورية" }
      ]
    },
    hours: {
      title: "ساعات العمل",
      items: [
        { day: "الاثنين - الجمعة", hours: "9:00 صباحاً - 6:00 مساءً بتوقيت الخليج" },
        { day: "السبت", hours: "10:00 صباحاً - 2:00 مساءً بتوقيت الخليج" },
        { day: "الأحد", hours: "مغلق" }
      ]
    }
  }
};

export default function Contact() {
  const { lang } = useI18n();
  const t = content[lang];
  const isRTL = lang === "ar";
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: t.form.success });
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="text-contact-title">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            {t.subtitle}
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t.intro}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Send className="h-6 w-6 text-primary" />
              {t.form.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t.form.name}</Label>
                <Input
                  id="name"
                  placeholder={t.form.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.form.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.form.subject}</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder={t.form.subjectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {t.form.subjects.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t.form.message}</Label>
                <Textarea
                  id="message"
                  placeholder={t.form.messagePlaceholder}
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  data-testid="input-message"
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending} data-testid="button-submit">
                {sending ? t.form.sending : t.form.submit}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                {t.support.title}
              </h3>
              <div className="space-y-4">
                {t.support.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-primary">{item.value}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t.hours.title}
              </h3>
              <div className="space-y-2">
                {t.hours.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{item.day}</span>
                    <span className="font-medium">{item.hours}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {t.offices.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.offices.locations.map((office, index) => (
              <Card key={index} className="p-6 hover-elevate">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{office.type}</span>
                </div>
                <h3 className="font-semibold mb-2">{office.city}</h3>
                <p className="text-sm text-muted-foreground mb-3">{office.address}</p>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {office.phone}
                </p>
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
