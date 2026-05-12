import { db } from "./db";
import { paymentGateways, paymentTransactions, subscriptions, type PaymentGateway, type InsertPaymentGateway } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  externalId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface GatewayConfig {
  secretKey?: string;
  publicKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  integrationId?: string;
  [key: string]: string | undefined;
}

const GATEWAY_PROVIDERS = {
  stripe: {
    name: "Stripe",
    nameAr: "سترايب",
    region: "global",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SAR", "AED", "EGP"],
    supportedCountries: ["US", "GB", "CA", "AU", "DE", "FR", "JP", "SA", "AE", "EG"],
    requiredEnvVars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"],
    logoUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/stripe.svg",
  },
  paypal: {
    name: "PayPal",
    nameAr: "باي بال",
    region: "global",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
    supportedCountries: ["US", "GB", "CA", "AU", "DE", "FR"],
    requiredEnvVars: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
    logoUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/paypal.svg",
  },
  paymob: {
    name: "Paymob",
    nameAr: "باي موب",
    region: "egypt",
    supportedCurrencies: ["EGP", "USD"],
    supportedCountries: ["EG"],
    requiredEnvVars: ["PAYMOB_API_KEY", "PAYMOB_INTEGRATION_ID", "PAYMOB_IFRAME_ID", "PAYMOB_HMAC_SECRET"],
    logoUrl: "/assets/paymob-logo.svg",
  },
  fawry: {
    name: "Fawry",
    nameAr: "فوري",
    region: "egypt",
    supportedCurrencies: ["EGP"],
    supportedCountries: ["EG"],
    requiredEnvVars: ["FAWRY_MERCHANT_CODE", "FAWRY_SECURITY_KEY"],
    logoUrl: "/assets/fawry-logo.svg",
  },
  tap: {
    name: "Tap Payments",
    nameAr: "تاب للدفع",
    region: "gulf",
    supportedCurrencies: ["SAR", "AED", "KWD", "BHD", "QAR", "OMR", "USD"],
    supportedCountries: ["SA", "AE", "KW", "BH", "QA", "OM"],
    requiredEnvVars: ["TAP_SECRET_KEY", "TAP_PUBLISHABLE_KEY"],
    logoUrl: "/assets/tap-logo.svg",
  },
  payfort: {
    name: "PayFort (Amazon Payment Services)",
    nameAr: "باي فورت",
    region: "gulf",
    supportedCurrencies: ["SAR", "AED", "EGP", "USD"],
    supportedCountries: ["SA", "AE", "EG"],
    requiredEnvVars: ["PAYFORT_MERCHANT_ID", "PAYFORT_ACCESS_CODE", "PAYFORT_SHA_REQUEST_PHRASE"],
    logoUrl: "/assets/payfort-logo.svg",
  },
  hyperpay: {
    name: "HyperPay",
    nameAr: "هايبر باي",
    region: "gulf",
    supportedCurrencies: ["SAR", "AED", "EGP", "JOD", "USD"],
    supportedCountries: ["SA", "AE", "EG", "JO"],
    requiredEnvVars: ["HYPERPAY_ENTITY_ID", "HYPERPAY_ACCESS_TOKEN"],
    logoUrl: "/assets/hyperpay-logo.svg",
  },
  moyasar: {
    name: "Moyasar",
    nameAr: "ميسر",
    region: "gulf",
    supportedCurrencies: ["SAR"],
    supportedCountries: ["SA"],
    requiredEnvVars: ["MOYASAR_API_KEY", "MOYASAR_PUBLISHABLE_KEY"],
    logoUrl: "/assets/moyasar-logo.svg",
  },
  thawani: {
    name: "Thawani",
    nameAr: "ثواني",
    region: "gulf",
    supportedCurrencies: ["OMR", "USD"],
    supportedCountries: ["OM"],
    requiredEnvVars: ["THAWANI_SECRET_KEY", "THAWANI_PUBLISHABLE_KEY"],
    logoUrl: "/assets/thawani-logo.svg",
  },
  myfatoorah: {
    name: "MyFatoorah",
    nameAr: "فاتورتي",
    region: "gulf",
    supportedCurrencies: ["KWD", "SAR", "AED", "BHD", "QAR", "OMR", "EGP", "JOD", "USD"],
    supportedCountries: ["KW", "SA", "AE", "BH", "QA", "OM", "EG", "JO"],
    requiredEnvVars: ["MYFATOORAH_API_KEY"],
    logoUrl: "/assets/myfatoorah-logo.svg",
  },
};

export class PaymentGatewayService {
  async getAllGateways(): Promise<PaymentGateway[]> {
    return db.select().from(paymentGateways).orderBy(paymentGateways.displayOrder);
  }

  async getEnabledGateways(): Promise<PaymentGateway[]> {
    return db.select().from(paymentGateways).where(eq(paymentGateways.isEnabled, true)).orderBy(paymentGateways.displayOrder);
  }

  async getGatewayById(id: number): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return gateway;
  }

  async getDefaultGateway(): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(and(eq(paymentGateways.isEnabled, true), eq(paymentGateways.isDefault, true)));
    return gateway;
  }

  async createGateway(data: InsertPaymentGateway): Promise<PaymentGateway> {
    if (data.isDefault) {
      await db.update(paymentGateways).set({ isDefault: false }).where(eq(paymentGateways.isDefault, true));
    }
    const [gateway] = await db.insert(paymentGateways).values(data).returning();
    return gateway;
  }

  async updateGateway(id: number, data: Partial<InsertPaymentGateway>): Promise<PaymentGateway | undefined> {
    if (data.isDefault) {
      await db.update(paymentGateways).set({ isDefault: false }).where(eq(paymentGateways.isDefault, true));
    }
    const [gateway] = await db.update(paymentGateways).set({ ...data, updatedAt: new Date() }).where(eq(paymentGateways.id, id)).returning();
    return gateway;
  }

  async deleteGateway(id: number): Promise<boolean> {
    const result = await db.delete(paymentGateways).where(eq(paymentGateways.id, id));
    return true;
  }

  async toggleGateway(id: number, enabled: boolean): Promise<PaymentGateway | undefined> {
    return this.updateGateway(id, { isEnabled: enabled });
  }

  getAvailableProviders() {
    return Object.entries(GATEWAY_PROVIDERS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }

  getProviderInfo(provider: string) {
    return GATEWAY_PROVIDERS[provider as keyof typeof GATEWAY_PROVIDERS];
  }

  getGatewayCredentials(gateway: PaymentGateway): GatewayConfig {
    const config: GatewayConfig = {};
    if (gateway.secretKeyEnvVar && process.env[gateway.secretKeyEnvVar]) {
      config.secretKey = process.env[gateway.secretKeyEnvVar];
    }
    if (gateway.publicKeyEnvVar && process.env[gateway.publicKeyEnvVar]) {
      config.publicKey = process.env[gateway.publicKeyEnvVar];
    }
    if (gateway.webhookSecretEnvVar && process.env[gateway.webhookSecretEnvVar]) {
      config.webhookSecret = process.env[gateway.webhookSecretEnvVar];
    }
    if (gateway.config && typeof gateway.config === 'object') {
      const gatewayConfig = gateway.config as Record<string, string>;
      for (const [key, envVar] of Object.entries(gatewayConfig)) {
        if (typeof envVar === 'string' && process.env[envVar]) {
          config[key] = process.env[envVar];
        }
      }
    }
    return config;
  }

  async initializeDefaultGateways(): Promise<void> {
    const existing = await this.getAllGateways();
    if (existing.length > 0) return;

    const defaultGateways: InsertPaymentGateway[] = [
      {
        name: "Stripe",
        nameAr: "سترايب",
        provider: "stripe",
        region: "global",
        isEnabled: false,
        isDefault: true,
        supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED", "EGP"],
        supportedCountries: ["US", "GB", "SA", "AE", "EG"],
        secretKeyEnvVar: "STRIPE_SECRET_KEY",
        publicKeyEnvVar: "STRIPE_PUBLISHABLE_KEY",
        webhookSecretEnvVar: "STRIPE_WEBHOOK_SECRET",
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Global payment processing with support for cards, wallets, and more",
        descriptionAr: "معالجة دفع عالمية مع دعم البطاقات والمحافظ الإلكترونية",
        displayOrder: 1,
      },
      {
        name: "PayPal",
        nameAr: "باي بال",
        provider: "paypal",
        region: "global",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["USD", "EUR", "GBP"],
        supportedCountries: ["US", "GB", "DE", "FR"],
        secretKeyEnvVar: "PAYPAL_CLIENT_SECRET",
        publicKeyEnvVar: "PAYPAL_CLIENT_ID",
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Trusted worldwide payment solution",
        descriptionAr: "حل دفع موثوق عالمياً",
        displayOrder: 2,
      },
      {
        name: "Paymob",
        nameAr: "باي موب",
        provider: "paymob",
        region: "egypt",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["EGP", "USD"],
        supportedCountries: ["EG"],
        secretKeyEnvVar: "PAYMOB_API_KEY",
        config: { integrationId: "PAYMOB_INTEGRATION_ID", iframeId: "PAYMOB_IFRAME_ID", hmacSecret: "PAYMOB_HMAC_SECRET" },
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Egypt's leading payment gateway",
        descriptionAr: "بوابة الدفع الرائدة في مصر",
        displayOrder: 3,
      },
      {
        name: "Fawry",
        nameAr: "فوري",
        provider: "fawry",
        region: "egypt",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["EGP"],
        supportedCountries: ["EG"],
        secretKeyEnvVar: "FAWRY_SECURITY_KEY",
        config: { merchantCode: "FAWRY_MERCHANT_CODE" },
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Cash and card payments across Egypt",
        descriptionAr: "دفع نقدي وبالبطاقات في جميع أنحاء مصر",
        displayOrder: 4,
      },
      {
        name: "Tap Payments",
        nameAr: "تاب للدفع",
        provider: "tap",
        region: "gulf",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["SAR", "AED", "KWD", "BHD", "QAR", "OMR"],
        supportedCountries: ["SA", "AE", "KW", "BH", "QA", "OM"],
        secretKeyEnvVar: "TAP_SECRET_KEY",
        publicKeyEnvVar: "TAP_PUBLISHABLE_KEY",
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Gulf region's preferred payment solution",
        descriptionAr: "حل الدفع المفضل في منطقة الخليج",
        displayOrder: 5,
      },
      {
        name: "HyperPay",
        nameAr: "هايبر باي",
        provider: "hyperpay",
        region: "gulf",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["SAR", "AED", "EGP", "JOD"],
        supportedCountries: ["SA", "AE", "EG", "JO"],
        secretKeyEnvVar: "HYPERPAY_ACCESS_TOKEN",
        config: { entityId: "HYPERPAY_ENTITY_ID" },
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "MENA region payment processing",
        descriptionAr: "معالجة الدفع في منطقة الشرق الأوسط وشمال أفريقيا",
        displayOrder: 6,
      },
      {
        name: "MyFatoorah",
        nameAr: "فاتورتي",
        provider: "myfatoorah",
        region: "gulf",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["KWD", "SAR", "AED", "BHD", "QAR", "OMR", "EGP"],
        supportedCountries: ["KW", "SA", "AE", "BH", "QA", "OM", "EG"],
        secretKeyEnvVar: "MYFATOORAH_API_KEY",
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Multi-country MENA payment gateway",
        descriptionAr: "بوابة دفع متعددة البلدان في الشرق الأوسط",
        displayOrder: 7,
      },
      {
        name: "Moyasar",
        nameAr: "ميسر",
        provider: "moyasar",
        region: "gulf",
        isEnabled: false,
        isDefault: false,
        supportedCurrencies: ["SAR"],
        supportedCountries: ["SA"],
        secretKeyEnvVar: "MOYASAR_API_KEY",
        publicKeyEnvVar: "MOYASAR_PUBLISHABLE_KEY",
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
        description: "Saudi Arabia's payment solution",
        descriptionAr: "حل الدفع في المملكة العربية السعودية",
        displayOrder: 8,
      },
    ];

    for (const gateway of defaultGateways) {
      await this.createGateway(gateway);
    }
  }

  async createPaymentSession(gatewayId: number, userId: number, organizationId: number, amount: number, currency: string, plan: string): Promise<PaymentResult> {
    const gateway = await this.getGatewayById(gatewayId);
    if (!gateway || !gateway.isEnabled) {
      return { success: false, error: "Gateway not available" };
    }

    const credentials = this.getGatewayCredentials(gateway);
    
    const [transaction] = await db.insert(paymentTransactions).values({
      organizationId,
      userId,
      gatewayId,
      amount: amount.toString(),
      currency,
      type: "subscription",
      plan,
      status: "pending",
    }).returning();

    switch (gateway.provider) {
      case "stripe":
        return this.createStripeSession(credentials, transaction.id, amount, currency, plan, gateway);
      case "paypal":
        return this.createPayPalSession(credentials, transaction.id, amount, currency, plan, gateway);
      case "paymob":
        return this.createPaymobSession(credentials, transaction.id, amount, currency, plan, gateway);
      case "tap":
        return this.createTapSession(credentials, transaction.id, amount, currency, plan, gateway);
      default:
        return { success: false, error: `Provider ${gateway.provider} not yet implemented` };
    }
  }

  private async createStripeSession(credentials: GatewayConfig, transactionId: number, amount: number, currency: string, plan: string, gateway: PaymentGateway): Promise<PaymentResult> {
    if (!credentials.secretKey) {
      return { success: false, error: "Stripe secret key not configured" };
    }

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(credentials.secretKey);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: `INFERA ${plan} Plan` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${process.env.APP_URL || 'https://inferafinanceglobal.com'}${gateway.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'https://inferafinanceglobal.com'}${gateway.cancelUrl}`,
        metadata: { transactionId: transactionId.toString(), plan },
      });

      await db.update(paymentTransactions).set({ externalId: session.id }).where(eq(paymentTransactions.id, transactionId));

      return { success: true, transactionId: transactionId.toString(), externalId: session.id, redirectUrl: session.url || undefined };
    } catch (error: any) {
      await db.update(paymentTransactions).set({ status: "failed", errorMessage: error.message }).where(eq(paymentTransactions.id, transactionId));
      return { success: false, error: error.message };
    }
  }

  private async createPayPalSession(credentials: GatewayConfig, transactionId: number, amount: number, currency: string, plan: string, gateway: PaymentGateway): Promise<PaymentResult> {
    return { success: false, error: "PayPal integration - configure via admin panel" };
  }

  private async createPaymobSession(credentials: GatewayConfig, transactionId: number, amount: number, currency: string, plan: string, gateway: PaymentGateway): Promise<PaymentResult> {
    return { success: false, error: "Paymob integration - configure via admin panel" };
  }

  private async createTapSession(credentials: GatewayConfig, transactionId: number, amount: number, currency: string, plan: string, gateway: PaymentGateway): Promise<PaymentResult> {
    return { success: false, error: "Tap integration - configure via admin panel" };
  }

  async handleWebhook(gatewayId: number, payload: any, signature?: string): Promise<boolean> {
    const gateway = await this.getGatewayById(gatewayId);
    if (!gateway) return false;

    switch (gateway.provider) {
      case "stripe":
        return this.handleStripeWebhook(gateway, payload, signature);
      default:
        return false;
    }
  }

  private async handleStripeWebhook(gateway: PaymentGateway, payload: any, signature?: string): Promise<boolean> {
    const credentials = this.getGatewayCredentials(gateway);
    if (!credentials.secretKey || !credentials.webhookSecret || !signature) return false;

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(credentials.secretKey);
      const event = stripe.webhooks.constructEvent(payload, signature, credentials.webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const transactionId = parseInt(session.metadata?.transactionId);
        if (transactionId) {
          await db.update(paymentTransactions).set({ status: "completed", externalId: session.id, completedAt: new Date() }).where(eq(paymentTransactions.id, transactionId));
        }
      }
      return true;
    } catch (error) {
      const logger = (await import('./logger')).default;
      logger.error("payment", "Webhook error", error);
      return false;
    }
  }
}

export const paymentGatewayService = new PaymentGatewayService();
