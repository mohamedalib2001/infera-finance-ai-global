import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { BackgroundEffect } from "@/components/BackgroundEffect";

export default function Register() {
  const { isRTL } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast({
        title: isRTL ? "تم إنشاء الحساب بنجاح" : "Account created successfully",
        description: isRTL ? "جاري التحويل لتسجيل الدخول..." : "Redirecting to login...",
      });

      setLocation("/login");
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ في التسجيل" : "Registration failed",
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
              {isRTL ? "إنشاء حساب جديد" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "أدخل بياناتك لإنشاء حساب جديد" : "Enter your details to create a new account"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{isRTL ? "الاسم الأول" : "First Name"}</Label>
                  <div className="relative">
                    <User className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={isRTL ? "الاسم الأول" : "First name"}
                      className={isRTL ? "pr-10" : "pl-10"}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      data-testid="input-firstname"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{isRTL ? "اسم العائلة" : "Last Name"}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={isRTL ? "اسم العائلة" : "Last name"}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    data-testid="input-lastname"
                  />
                </div>
              </div>

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
                <Label htmlFor="password">{isRTL ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? "أدخل كلمة المرور" : "Enter password"}
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
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
                <div className="relative">
                  <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Confirm password"}
                    className={isRTL ? "pr-10" : "pl-10"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}
                  </>
                ) : (
                  isRTL ? "إنشاء حساب" : "Create Account"
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">
                  {isRTL ? "سجل الدخول" : "Sign in"}
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
