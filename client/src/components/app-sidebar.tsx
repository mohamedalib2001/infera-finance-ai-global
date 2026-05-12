import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  FileText, 
  PiggyBank, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Settings,
  Users,
  Languages,
  Moon,
  Sun,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";
import { useTheme } from "@/components/theme-provider";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

export function AppSidebar() {
  const [location] = useLocation();
  const { t, lang, setLang, isRTL } = useI18n();
  const { theme, setTheme } = useTheme();

  const mainMenuItems = [
    { title: t.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: t.accounts, url: "/accounts", icon: Wallet },
    { title: t.transactions, url: "/transactions", icon: ArrowLeftRight },
    { title: t.invoices, url: "/invoices", icon: FileText },
    { title: t.budgets, url: "/budgets", icon: PiggyBank },
    { title: t.cashFlow, url: "/cash-flow", icon: TrendingUp },
  ];

  const analyticsItems = [
    { title: t.reports, url: "/reports", icon: BarChart3 },
    { title: t.aiInsights, url: "/ai-insights", icon: Brain },
    { title: lang === 'ar' ? 'الامتثال' : 'Compliance', url: "/compliance", icon: Shield },
  ];

  const settingsItems = [
    { title: t.contacts, url: "/contacts", icon: Users },
    { title: t.settings, url: "/settings", icon: Settings },
  ];

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <Sidebar side={isRTL ? "right" : "left"} className={isRTL ? "border-l border-r-0" : ""}>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">I</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              INFERA
            </span>
            <span className="text-xs text-muted-foreground">Finance AI</span>
          </div>
        </div>
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.slice(1)}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{lang === 'ar' ? 'التحليلات' : 'Analytics'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.slice(1)}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url.slice(1)}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleLang}
            data-testid="button-toggle-language"
          >
            <Languages className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-toggle-theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
