import { Request, Response, NextFunction } from "express";

type Role = 'super_admin' | 'global_admin' | 'owner' | 'cfo' | 'finance_manager' | 'auditor' | 'analyst';
type Resource = 'accounts' | 'transactions' | 'invoices' | 'budgets' | 'cash_flow' | 'reports' | 'ai_insights' | 'settings' | 'organizations' | 'billing' | 'users' | 'compliance';
type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';

const PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  super_admin: {
    accounts: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    transactions: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    budgets: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    cash_flow: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['create', 'read', 'update', 'delete', 'export'],
    ai_insights: ['read', 'export'],
    settings: ['create', 'read', 'update', 'delete'],
    organizations: ['create', 'read', 'update', 'delete'],
    billing: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    compliance: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  },
  global_admin: {
    accounts: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    transactions: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    budgets: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    cash_flow: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['create', 'read', 'update', 'delete', 'export'],
    ai_insights: ['read', 'export'],
    settings: ['create', 'read', 'update', 'delete'],
    organizations: ['create', 'read', 'update', 'delete'],
    billing: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    compliance: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  },
  owner: {
    accounts: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    transactions: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    budgets: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    cash_flow: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['create', 'read', 'update', 'delete', 'export'],
    ai_insights: ['read', 'export'],
    settings: ['create', 'read', 'update', 'delete'],
    organizations: ['read', 'update'],
    billing: ['create', 'read', 'update'],
    users: ['create', 'read', 'update', 'delete'],
    compliance: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  },
  cfo: {
    accounts: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    transactions: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    invoices: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    budgets: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    cash_flow: ['create', 'read', 'update', 'delete', 'export'],
    reports: ['create', 'read', 'update', 'delete', 'export'],
    ai_insights: ['read', 'export'],
    settings: ['read', 'update'],
    organizations: ['read'],
    billing: ['read'],
    users: ['read'],
    compliance: ['create', 'read', 'update', 'approve', 'export'],
  },
  finance_manager: {
    accounts: ['create', 'read', 'update', 'export'],
    transactions: ['create', 'read', 'update', 'export'],
    invoices: ['create', 'read', 'update', 'export'],
    budgets: ['create', 'read', 'update', 'export'],
    cash_flow: ['create', 'read', 'update', 'export'],
    reports: ['create', 'read', 'export'],
    ai_insights: ['read'],
    settings: ['read'],
    organizations: ['read'],
    billing: ['read'],
    users: [],
    compliance: ['create', 'read', 'update', 'export'],
  },
  auditor: {
    accounts: ['read', 'export'],
    transactions: ['read', 'export'],
    invoices: ['read', 'export'],
    budgets: ['read', 'export'],
    cash_flow: ['read', 'export'],
    reports: ['read', 'export'],
    ai_insights: ['read'],
    settings: ['read'],
    organizations: ['read'],
    billing: ['read'],
    users: ['read'],
    compliance: ['read', 'export'],
  },
  analyst: {
    accounts: ['read'],
    transactions: ['read'],
    invoices: ['read'],
    budgets: ['read'],
    cash_flow: ['read'],
    reports: ['read'],
    ai_insights: ['read'],
    settings: [],
    organizations: ['read'],
    billing: [],
    users: [],
    compliance: ['read'],
  },
};

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  return resourcePermissions.includes(action);
}

export function requirePermission(resource: Resource, action: Action) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any)?.user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userRole = user.role as Role || 'analyst';
    
    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json({ 
        message: "Access denied",
        messageAr: "تم رفض الوصول",
        required: { resource, action },
        userRole
      });
    }
    
    next();
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any)?.user;
  
  if (!user) {
    return res.status(401).json({ message: "Authentication required", messageAr: "المصادقة مطلوبة" });
  }
  
  next();
}

export { Role, Resource, Action, PERMISSIONS };
