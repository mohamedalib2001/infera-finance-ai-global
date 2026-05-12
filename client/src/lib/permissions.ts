export type Role = "super_admin" | "global_admin" | "owner" | "cfo" | "finance_manager" | "auditor" | "analyst";

export type Resource = "accounts" | "transactions" | "invoices" | "budgets" | "cash_flow" | "reports" | "ai_insights" | "contacts" | "settings" | "users" | "organizations" | "billing";

export type Action = "create" | "read" | "update" | "delete" | "approve";

const rolePermissions: Record<Role, Record<Resource, Action[]>> = {
  super_admin: {
    accounts: ["create", "read", "update", "delete", "approve"],
    transactions: ["create", "read", "update", "delete", "approve"],
    invoices: ["create", "read", "update", "delete", "approve"],
    budgets: ["create", "read", "update", "delete", "approve"],
    cash_flow: ["create", "read", "update", "delete", "approve"],
    reports: ["create", "read", "update", "delete", "approve"],
    ai_insights: ["create", "read", "update", "delete", "approve"],
    contacts: ["create", "read", "update", "delete", "approve"],
    settings: ["create", "read", "update", "delete", "approve"],
    users: ["create", "read", "update", "delete", "approve"],
    organizations: ["create", "read", "update", "delete", "approve"],
    billing: ["create", "read", "update", "delete", "approve"],
  },
  global_admin: {
    accounts: ["create", "read", "update", "delete", "approve"],
    transactions: ["create", "read", "update", "delete", "approve"],
    invoices: ["create", "read", "update", "delete", "approve"],
    budgets: ["create", "read", "update", "delete", "approve"],
    cash_flow: ["create", "read", "update", "delete", "approve"],
    reports: ["create", "read", "update", "delete", "approve"],
    ai_insights: ["create", "read", "update", "delete", "approve"],
    contacts: ["create", "read", "update", "delete", "approve"],
    settings: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    organizations: ["create", "read", "update", "delete"],
    billing: ["create", "read", "update", "delete"],
  },
  owner: {
    accounts: ["create", "read", "update", "delete", "approve"],
    transactions: ["create", "read", "update", "delete", "approve"],
    invoices: ["create", "read", "update", "delete", "approve"],
    budgets: ["create", "read", "update", "delete", "approve"],
    cash_flow: ["create", "read", "update", "delete", "approve"],
    reports: ["create", "read", "update", "delete", "approve"],
    ai_insights: ["create", "read", "update", "delete", "approve"],
    contacts: ["create", "read", "update", "delete", "approve"],
    settings: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    organizations: ["create", "read", "update", "delete"],
    billing: ["create", "read", "update", "delete"],
  },
  cfo: {
    accounts: ["create", "read", "update", "approve"],
    transactions: ["create", "read", "update", "approve"],
    invoices: ["create", "read", "update", "approve"],
    budgets: ["create", "read", "update", "delete", "approve"],
    cash_flow: ["create", "read", "update", "approve"],
    reports: ["create", "read", "update", "delete"],
    ai_insights: ["read", "update"],
    contacts: ["create", "read", "update"],
    settings: ["read", "update"],
    users: ["read"],
    organizations: ["read"],
    billing: ["read"],
  },
  finance_manager: {
    accounts: ["create", "read", "update"],
    transactions: ["create", "read", "update"],
    invoices: ["create", "read", "update"],
    budgets: ["create", "read", "update"],
    cash_flow: ["create", "read", "update"],
    reports: ["create", "read"],
    ai_insights: ["read"],
    contacts: ["create", "read", "update"],
    settings: ["read"],
    users: [],
    organizations: [],
    billing: [],
  },
  auditor: {
    accounts: ["read"],
    transactions: ["read"],
    invoices: ["read"],
    budgets: ["read"],
    cash_flow: ["read"],
    reports: ["read"],
    ai_insights: ["read"],
    contacts: ["read"],
    settings: ["read"],
    users: [],
    organizations: [],
    billing: [],
  },
  analyst: {
    accounts: ["read"],
    transactions: ["read"],
    invoices: ["read"],
    budgets: ["read"],
    cash_flow: ["read"],
    reports: ["read"],
    ai_insights: ["read"],
    contacts: ["read"],
    settings: [],
    users: [],
    organizations: [],
    billing: [],
  },
};

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(action);
}

export function getRoleLabel(role: Role, language: "en" | "ar"): string {
  const labels: Record<Role, { en: string; ar: string }> = {
    super_admin: { en: "Super Admin", ar: "مدير أعلى" },
    global_admin: { en: "Global Admin", ar: "مدير عام" },
    owner: { en: "Owner", ar: "المالك" },
    cfo: { en: "CFO", ar: "المدير المالي" },
    finance_manager: { en: "Finance Manager", ar: "مدير مالي" },
    auditor: { en: "Auditor", ar: "مدقق" },
    analyst: { en: "Analyst", ar: "محلل" },
  };
  return labels[role]?.[language] || role;
}
