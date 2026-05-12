import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider, useI18n } from "@/lib/i18n-context";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { OrganizationProvider } from "@/lib/organization-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Languages, Sun, Moon } from "lucide-react";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Invoices from "@/pages/Invoices";
import Budgets from "@/pages/Budgets";
import CashFlow from "@/pages/CashFlow";
import Reports from "@/pages/Reports";
import AIInsights from "@/pages/AIInsights";
import Contacts from "@/pages/Contacts";
import Compliance from "@/pages/Compliance";
import SettingsPage from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Security from "@/pages/Security";
import Cookies from "@/pages/Cookies";
import Help from "@/pages/Help";
import Docs from "@/pages/Docs";
import Status from "@/pages/Status";
import PaymentGateways from "@/pages/PaymentGateways";
import NotFound from "@/pages/not-found";


function AppContent() {
  const [location] = useLocation();
  const { isRTL, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const isPublicPage = location === "/" || location === "/pricing" || location === "/login" || location === "/register" || location === "/forgot-password" || location === "/terms" || location === "/privacy" || location === "/about" || location === "/careers" || location === "/contact" || location === "/security" || location === "/cookies" || location === "/help" || location === "/docs" || location === "/status";

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (isPublicPage) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/about" component={About} />
        <Route path="/careers" component={Careers} />
        <Route path="/contact" component={Contact} />
        <Route path="/security" component={Security} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/help" component={Help} />
        <Route path="/docs" component={Docs} />
        <Route path="/status" component={Status} />
      </Switch>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-sm shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleLang}
                data-testid="button-toggle-language-header"
                title={lang === 'ar' ? 'English' : 'العربية'}
              >
                <Languages className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                data-testid="button-toggle-theme-header"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/accounts" component={Accounts} />
              <Route path="/transactions" component={Transactions} />
              <Route path="/invoices" component={Invoices} />
              <Route path="/budgets" component={Budgets} />
              <Route path="/cash-flow" component={CashFlow} />
              <Route path="/reports" component={Reports} />
              <Route path="/ai-insights" component={AIInsights} />
              <Route path="/compliance" component={Compliance} />
              <Route path="/contacts" component={Contacts} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/payment-gateways" component={PaymentGateways} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <I18nProvider>
            <OrganizationProvider>
              <AppContent />
              <Toaster />
            </OrganizationProvider>
          </I18nProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
