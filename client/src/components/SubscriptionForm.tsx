import { useState } from "react";
import { useCreateSubscriber } from "@/hooks/use-subscribers";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useCreateSubscriber();
  const { toast } = useToast();
  const { t, isRTL } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    mutate({ email }, {
      onSuccess: () => {
        setEmail("");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: isRTL ? "تم رفض الوصول" : "Access Denied",
          description: error.message,
        });
      }
    });
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-lg bg-primary/10 border border-primary/30 text-center backdrop-blur-md"
          >
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">
              {isRTL ? 'تم منح الوصول' : 'Access Granted'}
            </h3>
            <p className="text-muted-foreground font-body">
              {isRTL 
                ? 'أنت في قائمة الأولوية. استعد لمستقبل التمويل.'
                : 'You are on the priority list. Prepare for the future of finance.'
              }
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-lg opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 blur"></div>
              <div className={`relative flex flex-col sm:flex-row gap-2 bg-black/80 p-2 rounded-lg border border-white/10 backdrop-blur-xl ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  data-testid="input-email"
                  className={`flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm w-full ${isRTL ? 'text-right' : 'text-left'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  data-testid="button-submit"
                  className="
                    px-4 sm:px-6 py-3 rounded bg-primary text-black font-bold font-display tracking-wide uppercase text-xs sm:text-sm
                    hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]
                    active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                    transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto
                  "
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? 'جارٍ المعالجة' : 'Processing'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isRTL ? 'احصل على الوصول' : 'Get Access'}</span>
                      <Arrow className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className={`mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>{isRTL ? 'نقل مشفر وآمن' : 'Secure encrypted transmission'}</span>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
