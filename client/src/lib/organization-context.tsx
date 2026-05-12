import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Organization {
  id: number;
  name: string;
  nameAr?: string | null;
  type?: string | null;
  subscriptionTier?: string | null;
}

interface OrganizationContextType {
  currentOrgId: number | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrgId: (id: number) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  const [currentOrgId, setCurrentOrgIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem('currentOrgId');
    return stored ? Number(stored) : null;
  });

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  useEffect(() => {
    if (organizations.length > 0 && !currentOrgId) {
      const firstOrg = organizations[0];
      setCurrentOrgIdState(firstOrg.id);
      localStorage.setItem('currentOrgId', String(firstOrg.id));
    }
  }, [organizations, currentOrgId]);

  const setCurrentOrgId = (id: number) => {
    setCurrentOrgIdState(id);
    localStorage.setItem('currentOrgId', String(id));
    
    queryClient.invalidateQueries({ queryKey: ['/api/organizations', id] });
  };

  const currentOrg = organizations.find(org => org.id === currentOrgId) || organizations[0] || null;

  return (
    <OrganizationContext.Provider value={{
      currentOrgId: currentOrg?.id || null,
      currentOrg,
      organizations,
      isLoading,
      setCurrentOrgId,
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
