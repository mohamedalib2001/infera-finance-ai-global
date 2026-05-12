import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Globe, MapPin, Plus, Settings, Trash2, Check, X, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface PaymentGateway {
  id: number;
  name: string;
  nameAr: string | null;
  provider: string;
  region: string;
  isEnabled: boolean;
  isDefault: boolean;
  supportedCurrencies: string[] | null;
  supportedCountries: string[] | null;
  webhookUrl: string | null;
  successUrl: string | null;
  cancelUrl: string | null;
  secretKeyEnvVar: string | null;
  publicKeyEnvVar: string | null;
  webhookSecretEnvVar: string | null;
  config: Record<string, string> | null;
  logoUrl: string | null;
  description: string | null;
  descriptionAr: string | null;
  displayOrder: number;
}

const translations = {
  en: {
    title: "Payment Gateways",
    subtitle: "Manage your payment providers",
    back: "Back to Settings",
    addGateway: "Add Gateway",
    enabled: "Enabled",
    disabled: "Disabled",
    default: "Default",
    setDefault: "Set as Default",
    configure: "Configure",
    delete: "Delete",
    save: "Save Changes",
    cancel: "Cancel",
    global: "Global",
    egypt: "Egypt",
    gulf: "Gulf",
    mena: "MENA",
    currencies: "Currencies",
    countries: "Countries",
    configuration: "Configuration",
    envVars: "Environment Variables",
    secretKey: "Secret Key Env Var",
    publicKey: "Public Key Env Var",
    webhookSecret: "Webhook Secret Env Var",
    successUrl: "Success URL",
    cancelUrl: "Cancel URL",
    webhookUrl: "Webhook URL",
    additionalConfig: "Additional Configuration",
    noGateways: "No payment gateways configured",
    initializeDefault: "Initialize Default Gateways",
    confirmDelete: "Are you sure you want to delete this gateway?",
    gatewayUpdated: "Gateway updated successfully",
    gatewayDeleted: "Gateway deleted successfully",
    gatewaysInitialized: "Default gateways initialized",
    allRegions: "All Regions",
    filterByRegion: "Filter by Region",
    status: "Status",
    provider: "Provider",
    region: "Region",
    notConfigured: "Not Configured",
    configured: "Configured",
    requiresSetup: "Requires API Keys",
    editGateway: "Edit Gateway",
    gatewayDetails: "Gateway Details",
  },
  ar: {
    title: "بوابات الدفع",
    subtitle: "إدارة مزودي الدفع",
    back: "العودة للإعدادات",
    addGateway: "إضافة بوابة",
    enabled: "مفعّل",
    disabled: "معطّل",
    default: "افتراضي",
    setDefault: "تعيين كافتراضي",
    configure: "تكوين",
    delete: "حذف",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    global: "عالمي",
    egypt: "مصر",
    gulf: "الخليج",
    mena: "الشرق الأوسط",
    currencies: "العملات",
    countries: "الدول",
    configuration: "التكوين",
    envVars: "متغيرات البيئة",
    secretKey: "متغير المفتاح السري",
    publicKey: "متغير المفتاح العام",
    webhookSecret: "متغير سر Webhook",
    successUrl: "رابط النجاح",
    cancelUrl: "رابط الإلغاء",
    webhookUrl: "رابط Webhook",
    additionalConfig: "تكوين إضافي",
    noGateways: "لا توجد بوابات دفع مكونة",
    initializeDefault: "تهيئة البوابات الافتراضية",
    confirmDelete: "هل أنت متأكد من حذف هذه البوابة؟",
    gatewayUpdated: "تم تحديث البوابة بنجاح",
    gatewayDeleted: "تم حذف البوابة بنجاح",
    gatewaysInitialized: "تم تهيئة البوابات الافتراضية",
    allRegions: "جميع المناطق",
    filterByRegion: "تصفية حسب المنطقة",
    status: "الحالة",
    provider: "المزود",
    region: "المنطقة",
    notConfigured: "غير مكوّن",
    configured: "مكوّن",
    requiresSetup: "يتطلب مفاتيح API",
    editGateway: "تعديل البوابة",
    gatewayDetails: "تفاصيل البوابة",
  },
};

const regionIcons: Record<string, any> = {
  global: Globe,
  egypt: MapPin,
  gulf: MapPin,
  mena: MapPin,
  europe: Globe,
  usa: Globe,
};

const regionColors: Record<string, string> = {
  global: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  egypt: "bg-green-500/10 text-green-500 border-green-500/20",
  gulf: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  mena: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function PaymentGateways() {
  const { lang } = useI18n();
  const isRTL = lang === "ar";
  const t = translations[lang];
  const { toast } = useToast();

  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: gateways = [], isLoading, refetch } = useQuery<PaymentGateway[]>({
    queryKey: ["/api/payment-gateways"],
  });

  const initializeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/payment-gateways/initialize"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
      toast({ title: t.gatewaysInitialized });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PaymentGateway> }) =>
      apiRequest("PATCH", `/api/payment-gateways/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
      toast({ title: t.gatewayUpdated });
      setShowEditDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/payment-gateways/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-gateways"] });
      toast({ title: t.gatewayDeleted });
    },
  });

  const toggleGateway = (gateway: PaymentGateway) => {
    updateMutation.mutate({ id: gateway.id, updates: { isEnabled: !gateway.isEnabled } });
  };

  const setAsDefault = (gateway: PaymentGateway) => {
    updateMutation.mutate({ id: gateway.id, updates: { isDefault: true } });
  };

  const filteredGateways = selectedRegion === "all" 
    ? gateways 
    : gateways.filter(g => g.region === selectedRegion);

  const regions = ["all", ...Array.from(new Set(gateways.map(g => g.region)))];

  const isGatewayConfigured = (gateway: PaymentGateway) => {
    return gateway.secretKeyEnvVar || gateway.publicKeyEnvVar;
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/settings">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
              {t.back}
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
                <CreditCard className="w-8 h-8 text-primary" />
                {t.title}
              </h1>
              <p className="text-muted-foreground mt-1">{t.subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40" data-testid="select-region-filter">
                  <SelectValue placeholder={t.filterByRegion} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allRegions}</SelectItem>
                  <SelectItem value="global">{t.global}</SelectItem>
                  <SelectItem value="egypt">{t.egypt}</SelectItem>
                  <SelectItem value="gulf">{t.gulf}</SelectItem>
                </SelectContent>
              </Select>

              {gateways.length === 0 && (
                <Button 
                  onClick={() => initializeMutation.mutate()} 
                  disabled={initializeMutation.isPending}
                  data-testid="button-initialize"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {t.initializeDefault}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGateways.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t.noGateways}</p>
              <Button onClick={() => initializeMutation.mutate()} disabled={initializeMutation.isPending}>
                <Zap className="w-4 h-4 mr-2" />
                {t.initializeDefault}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGateways.map((gateway, index) => {
              const RegionIcon = regionIcons[gateway.region] || Globe;
              const configured = isGatewayConfigured(gateway);

              return (
                <motion.div
                  key={gateway.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden transition-all hover-elevate ${gateway.isEnabled ? "border-primary/50" : ""}`}>
                    {gateway.isDefault && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl">
                        {t.default}
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {isRTL && gateway.nameAr ? gateway.nameAr : gateway.name}
                            </CardTitle>
                            <CardDescription className="text-xs">{gateway.provider}</CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={gateway.isEnabled}
                          onCheckedChange={() => toggleGateway(gateway)}
                          data-testid={`switch-gateway-${gateway.id}`}
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={regionColors[gateway.region] || ""}>
                          <RegionIcon className="w-3 h-3 mr-1" />
                          {t[gateway.region as keyof typeof t] || gateway.region}
                        </Badge>
                        <Badge variant={gateway.isEnabled ? "default" : "secondary"}>
                          {gateway.isEnabled ? t.enabled : t.disabled}
                        </Badge>
                        <Badge variant={configured ? "outline" : "destructive"} className="text-xs">
                          {configured ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              {t.configured}
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 mr-1" />
                              {t.requiresSetup}
                            </>
                          )}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {isRTL && gateway.descriptionAr ? gateway.descriptionAr : gateway.description}
                      </p>

                      {gateway.supportedCurrencies && gateway.supportedCurrencies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {gateway.supportedCurrencies.slice(0, 5).map(currency => (
                            <Badge key={currency} variant="outline" className="text-xs">
                              {currency}
                            </Badge>
                          ))}
                          {gateway.supportedCurrencies.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{gateway.supportedCurrencies.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingGateway(gateway);
                            setShowEditDialog(true);
                          }}
                          data-testid={`button-configure-${gateway.id}`}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          {t.configure}
                        </Button>
                        {!gateway.isDefault && gateway.isEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAsDefault(gateway)}
                            data-testid={`button-set-default-${gateway.id}`}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t.editGateway}: {editingGateway?.name}
              </DialogTitle>
              <DialogDescription>{t.gatewayDetails}</DialogDescription>
            </DialogHeader>

            {editingGateway && (
              <Tabs defaultValue="general" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">{t.configuration}</TabsTrigger>
                  <TabsTrigger value="envvars">{t.envVars}</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.successUrl}</Label>
                      <Input
                        value={editingGateway.successUrl || ""}
                        onChange={e => setEditingGateway({ ...editingGateway, successUrl: e.target.value })}
                        placeholder="/payment/success"
                        data-testid="input-success-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.cancelUrl}</Label>
                      <Input
                        value={editingGateway.cancelUrl || ""}
                        onChange={e => setEditingGateway({ ...editingGateway, cancelUrl: e.target.value })}
                        placeholder="/payment/cancel"
                        data-testid="input-cancel-url"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.webhookUrl}</Label>
                    <Input
                      value={editingGateway.webhookUrl || ""}
                      onChange={e => setEditingGateway({ ...editingGateway, webhookUrl: e.target.value })}
                      placeholder="/api/webhooks/payment"
                      data-testid="input-webhook-url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.currencies}</Label>
                    <Input
                      value={editingGateway.supportedCurrencies?.join(", ") || ""}
                      onChange={e => setEditingGateway({ ...editingGateway, supportedCurrencies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                      placeholder="USD, EUR, SAR, AED, EGP"
                      data-testid="input-currencies"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.countries}</Label>
                    <Input
                      value={editingGateway.supportedCountries?.join(", ") || ""}
                      onChange={e => setEditingGateway({ ...editingGateway, supportedCountries: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                      placeholder="US, GB, SA, AE, EG"
                      data-testid="input-countries"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="envvars" className="space-y-4 mt-4">
                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {lang === "ar" 
                          ? "أدخل أسماء متغيرات البيئة (وليس القيم الفعلية). سيتم قراءة القيم من إعدادات السر الخاصة بالمنصة."
                          : "Enter environment variable names (not actual values). Values will be read from platform secrets."}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label>{t.secretKey}</Label>
                    <Input
                      value={editingGateway.secretKeyEnvVar || ""}
                      onChange={e => setEditingGateway({ ...editingGateway, secretKeyEnvVar: e.target.value })}
                      placeholder="STRIPE_SECRET_KEY"
                      data-testid="input-secret-key-env"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.publicKey}</Label>
                    <Input
                      value={editingGateway.publicKeyEnvVar || ""}
                      onChange={e => setEditingGateway({ ...editingGateway, publicKeyEnvVar: e.target.value })}
                      placeholder="STRIPE_PUBLISHABLE_KEY"
                      data-testid="input-public-key-env"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.webhookSecret}</Label>
                    <Input
                      value={editingGateway.webhookSecretEnvVar || ""}
                      onChange={e => setEditingGateway({ ...editingGateway, webhookSecretEnvVar: e.target.value })}
                      placeholder="STRIPE_WEBHOOK_SECRET"
                      data-testid="input-webhook-secret-env"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.additionalConfig}</Label>
                    <Textarea
                      value={editingGateway.config ? JSON.stringify(editingGateway.config, null, 2) : ""}
                      onChange={e => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setEditingGateway({ ...editingGateway, config: parsed });
                        } catch {}
                      }}
                      placeholder='{"merchantId": "MERCHANT_ID_ENV_VAR"}'
                      className="font-mono text-sm"
                      rows={4}
                      data-testid="input-additional-config"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} data-testid="button-cancel-edit">
                {t.cancel}
              </Button>
              <Button
                onClick={() => {
                  if (editingGateway) {
                    const { id, ...updates } = editingGateway;
                    updateMutation.mutate({ id, updates });
                  }
                }}
                disabled={updateMutation.isPending}
                data-testid="button-save-gateway"
              >
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
