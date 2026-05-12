import { useI18n } from "@/lib/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  const { lang, isRTL } = useI18n();

  return (
    <div className={`min-h-screen bg-background p-4 sm:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-4 sm:mb-6" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 me-2" />
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </CardTitle>
            <p className="text-muted-foreground">
              {lang === 'ar' ? 'آخر تحديث: يناير 2026' : 'Last updated: January 2026'}
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {lang === 'ar' ? (
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold">1. المعلومات التي نجمعها</h2>
                  <p>نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>معلومات الحساب (الاسم، البريد الإلكتروني، كلمة المرور)</li>
                    <li>معلومات المنظمة والأعمال</li>
                    <li>البيانات المالية والمعاملات</li>
                    <li>معلومات الدفع</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">2. كيف نستخدم معلوماتك</h2>
                  <p>نستخدم المعلومات المجمعة لـ:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>تقديم وتحسين خدماتنا</li>
                    <li>معالجة المعاملات والاشتراكات</li>
                    <li>توليد التقارير المالية والتحليلات</li>
                    <li>التواصل معك حول حسابك</li>
                    <li>تحسين ميزات الذكاء الاصطناعي</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">3. أمان البيانات</h2>
                  <p>نتخذ تدابير أمنية صارمة لحماية بياناتك:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>تشفير البيانات أثناء النقل والتخزين</li>
                    <li>التحكم في الوصول القائم على الأدوار</li>
                    <li>المراقبة الأمنية المستمرة</li>
                    <li>النسخ الاحتياطي المنتظم</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">4. مشاركة البيانات</h2>
                  <p>لا نبيع بياناتك الشخصية. قد نشارك البيانات مع:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>مقدمي خدمات الدفع (Stripe)</li>
                    <li>مقدمي خدمات البنية التحتية السحابية</li>
                    <li>السلطات القانونية عند الاقتضاء</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">5. حقوقك</h2>
                  <p>لديك الحق في:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>الوصول إلى بياناتك</li>
                    <li>تصحيح البيانات غير الدقيقة</li>
                    <li>حذف حسابك وبياناتك</li>
                    <li>تصدير بياناتك</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">6. ملفات تعريف الارتباط</h2>
                  <p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">7. الاتصال</h2>
                  <p>للاستفسارات حول الخصوصية: privacy@infera.ai</p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold">1. Information We Collect</h2>
                  <p>We collect information you provide directly to us, including:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Account information (name, email, password)</li>
                    <li>Organization and business information</li>
                    <li>Financial data and transactions</li>
                    <li>Payment information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
                  <p>We use collected information to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Provide and improve our services</li>
                    <li>Process transactions and subscriptions</li>
                    <li>Generate financial reports and analytics</li>
                    <li>Communicate with you about your account</li>
                    <li>Improve AI features</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">3. Data Security</h2>
                  <p>We implement strict security measures to protect your data:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Encryption in transit and at rest</li>
                    <li>Role-based access control</li>
                    <li>Continuous security monitoring</li>
                    <li>Regular backups</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">4. Data Sharing</h2>
                  <p>We do not sell your personal data. We may share data with:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Payment service providers (Stripe)</li>
                    <li>Cloud infrastructure providers</li>
                    <li>Legal authorities when required</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">5. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Access your data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold">6. Cookies</h2>
                  <p>We use cookies to improve your experience and remember your preferences.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">7. Contact</h2>
                  <p>For privacy inquiries: privacy@infera.ai</p>
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
