import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { BackgroundEffect } from "@/components/BackgroundEffect";

export default function ForgotPassword() {
  const { isRTL } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setIsSubmitted(true);
      toast({
        title: isRTL ? "تم الإرسال" : "Email sent",
        description: isRTL ? "تحقق من بريدك الإلكتروني" : "Check your email for reset instructions",
      });
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <BackgroundEffect />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-lg border border-primary flex items-center justify-center bg-primary/10">
              {isSubmitted ? (
                <CheckCircle className="h-6 w-6 text-primary" />
              ) : (
                <Mail className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-display">
              {isSubmitted
                ? isRTL ? "تحقق من بريدك" : "Check Your Email"
                : isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? isRTL
                  ? "إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة بتعليمات إعادة تعيين كلمة المرور"
                  : "If the email is registered, you'll receive password reset instructions"
                : isRTL
                  ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور"
                  : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                      className={isRTL ? "pr-10" : "pl-10"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-reset">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                      {isRTL ? "جاري الإرسال..." : "Sending..."}
                    </>
                  ) : (
                    isRTL ? "إرسال رابط إعادة التعيين" : "Send Reset Link"
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col gap-4">
              <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)} data-testid="button-try-again">
                {isRTL ? "إرسال مرة أخرى" : "Send again"}
              </Button>
            </CardFooter>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="hover:text-primary inline-flex items-center gap-1" data-testid="link-back-login">
            <ArrowLeft className="h-4 w-4" />
            {isRTL ? "العودة لتسجيل الدخول" : "Back to login"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
