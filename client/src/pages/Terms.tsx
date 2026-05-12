import { useI18n } from "@/lib/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
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
              {lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
            </CardTitle>
            <p className="text-muted-foreground">
              {lang === 'ar' ? 'آخر تحديث: يناير 2026' : 'Last updated: January 2026'}
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {lang === 'ar' ? (
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold">1. قبول الشروط</h2>
                  <p>باستخدام منصة INFERA Finance AI GlobalCloud، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام خدماتنا.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">2. وصف الخدمة</h2>
                  <p>INFERA Finance AI GlobalCloud هي منصة إدارة مالية سحابية مدعومة بالذكاء الاصطناعي. توفر المنصة أدوات للمحاسبة، إعداد التقارير المالية، تتبع الميزانية، وتحليلات الذكاء الاصطناعي.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">3. حسابات المستخدمين</h2>
                  <p>أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يجب أن تكون جميع المعلومات المقدمة دقيقة ومحدثة.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">4. الاشتراكات والدفع</h2>
                  <p>تتوفر خطط اشتراك مختلفة بميزات متنوعة. يتم تجديد الاشتراكات تلقائياً ما لم يتم إلغاؤها. جميع المدفوعات غير قابلة للاسترداد ما لم ينص على خلاف ذلك.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">5. أمان البيانات</h2>
                  <p>نلتزم بحماية بياناتك المالية. نستخدم التشفير ومعايير الأمان الصناعية لحماية معلوماتك.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">6. الاستخدام المقبول</h2>
                  <p>يجب استخدام المنصة للأغراض التجارية المشروعة فقط. يُحظر أي استخدام غير قانوني أو ضار للخدمة.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">7. حدود المسؤولية</h2>
                  <p>لا تتحمل INFERA مسؤولية أي أضرار غير مباشرة ناتجة عن استخدام أو عدم القدرة على استخدام الخدمة.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">8. التعديلات</h2>
                  <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">9. الاتصال</h2>
                  <p>للاستفسارات حول هذه الشروط، يرجى التواصل معنا على: legal@infera.ai</p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                  <p>By using INFERA Finance AI GlobalCloud, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you must not use our services.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">2. Description of Service</h2>
                  <p>INFERA Finance AI GlobalCloud is a cloud-based financial management platform powered by artificial intelligence. The platform provides tools for accounting, financial reporting, budget tracking, and AI analytics.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">3. User Accounts</h2>
                  <p>You are responsible for maintaining the confidentiality of your account credentials. All information provided must be accurate and up-to-date.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">4. Subscriptions and Payment</h2>
                  <p>Various subscription plans are available with different features. Subscriptions renew automatically unless canceled. All payments are non-refundable unless otherwise stated.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">5. Data Security</h2>
                  <p>We are committed to protecting your financial data. We use encryption and industry-standard security measures to protect your information.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">6. Acceptable Use</h2>
                  <p>The platform must be used for legitimate business purposes only. Any illegal or harmful use of the service is prohibited.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">7. Limitation of Liability</h2>
                  <p>INFERA is not liable for any indirect damages resulting from use or inability to use the service.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">8. Modifications</h2>
                  <p>We reserve the right to modify these terms at any time. Users will be notified of any material changes.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold">9. Contact</h2>
                  <p>For inquiries about these terms, please contact us at: legal@infera.ai</p>
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
