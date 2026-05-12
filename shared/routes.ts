import { z } from 'zod';
import { 
  insertSubscriberSchema, 
  insertOrganizationSchema,
  insertAccountSchema,
  insertTransactionSchema,
  insertInvoiceSchema,
  insertContactSchema,
  insertBudgetSchema,
  insertAiInsightSchema,
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  subscribers: {
    create: {
      method: 'POST' as const,
      path: '/api/subscribers',
      input: insertSubscriberSchema,
    },
  },
  
  organizations: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations',
    },
    get: {
      method: 'GET' as const,
      path: '/api/organizations/:id',
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations',
      input: insertOrganizationSchema,
    },
  },
  
  accounts: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/accounts',
    },
    get: {
      method: 'GET' as const,
      path: '/api/accounts/:id',
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations/:orgId/accounts',
      input: insertAccountSchema.omit({ organizationId: true }),
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/accounts/:id',
      input: insertAccountSchema.partial(),
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/accounts/:id',
    },
  },
  
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/transactions',
    },
    get: {
      method: 'GET' as const,
      path: '/api/transactions/:id',
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations/:orgId/transactions',
      input: insertTransactionSchema.omit({ organizationId: true }).extend({
        lines: z.array(z.object({
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          memo: z.string().optional(),
        })),
      }),
    },
  },
  
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/invoices',
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id',
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations/:orgId/invoices',
      input: insertInvoiceSchema.omit({ organizationId: true }),
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/invoices/:id',
      input: insertInvoiceSchema.partial(),
    },
  },
  
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/contacts',
    },
    get: {
      method: 'GET' as const,
      path: '/api/contacts/:id',
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations/:orgId/contacts',
      input: insertContactSchema.omit({ organizationId: true }),
    },
  },
  
  budgets: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/budgets',
    },
    get: {
      method: 'GET' as const,
      path: '/api/budgets/:id',
    },
    create: {
      method: 'POST' as const,
      path: '/api/organizations/:orgId/budgets',
      input: insertBudgetSchema.omit({ organizationId: true }),
    },
  },
  
  cashFlows: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/cash-flows',
    },
  },
  
  aiInsights: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations/:orgId/ai-insights',
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/ai-insights/:id/read',
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
