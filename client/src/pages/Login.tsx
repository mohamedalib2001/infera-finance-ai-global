import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { BackgroundEffect } from "@/components/BackgroundEffect";

export default function Login() {
  const { isRTL } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      toast({
        title: isRTL ? "تم تسجيل الدخول بنجاح" : "Login successful",
        description: isRTL ? "جاري التحويل..." : "Redirecting...",
      });

      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ في تسجيل الدخول" : "Login failed",
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
              <span className="font-display font-bold text-primary text-xl">I</span>
            </div>
            <CardTitle className="text-2xl font-display">
              {isRTL ? "تسجيل الدخول" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "أدخل بياناتك للوصول إلى حسابك" : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{isRTL ? "كلمة المرور" : "Password"}</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline" data-testid="link-forgot-password">
                    {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? "أدخل كلمة المرور" : "Enter your password"}
                    className={isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full px-3 hover:bg-transparent`}
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {isRTL ? "جاري تسجيل الدخول..." : "Signing in..."}
                  </>
                ) : (
                  isRTL ? "تسجيل الدخول" : "Sign In"
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                {isRTL ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
                <Link href="/register" className="text-primary hover:underline font-medium" data-testid="link-register">
                  {isRTL ? "سجل الآن" : "Sign up"}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary" data-testid="link-back-home">
            {isRTL ? "← العودة للرئيسية" : "← Back to home"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
