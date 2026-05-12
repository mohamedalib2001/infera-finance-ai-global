import { useState } from "react";
import { Building2, ChevronDown, Plus, Check, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";
import { useOrganization } from "@/lib/organization-context";
import { AddOrganizationModal } from "@/components/modals/AddOrganizationModal";
import { EditOrganizationModal } from "@/components/modals/EditOrganizationModal";

interface Organization {
  id: number;
  name: string;
  nameAr?: string | null;
  type: string;
  country?: string | null;
  currency?: string | null;
  industry?: string | null;
  taxId?: string | null;
}

export function OrganizationSwitcher() {
  const { lang } = useI18n();
  const { currentOrg, organizations, isLoading, setCurrentOrgId } = useOrganization();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const getOrgName = (org: { name: string; nameAr?: string | null }) => {
    return lang === 'ar' && org.nameAr ? org.nameAr : org.name;
  };

  const handleEditClick = (e: React.MouseEvent, org: Organization) => {
    e.stopPropagation();
    setEditingOrg(org);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="w-4 h-4" />
        <span>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (!organizations.length) {
    return (
      <>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 h-auto"
          onClick={() => setShowAddModal(true)}
          data-testid="button-add-first-org"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-sm">
              {lang === 'ar' ? 'إضافة منظمة' : 'Add Organization'}
            </span>
          </div>
        </Button>
        <AddOrganizationModal open={showAddModal} onOpenChange={setShowAddModal} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-2 h-auto"
            data-testid="button-org-switcher"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm truncate max-w-[140px]">
                  {currentOrg ? getOrgName(currentOrg) : (lang === 'ar' ? 'اختر منظمة' : 'Select org')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentOrg?.type || (lang === 'ar' ? 'شركة' : 'Company')}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>
            {lang === 'ar' ? 'تبديل المنظمة' : 'Switch Organization'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => setCurrentOrgId(org.id)}
              className="cursor-pointer group"
              data-testid={`org-option-${org.id}`}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-primary" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">{getOrgName(org)}</span>
                  <span className="text-xs text-muted-foreground">{org.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleEditClick(e, org as Organization)}
                  data-testid={`button-edit-org-${org.id}`}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                {currentOrg?.id === org.id && <Check className="w-4 h-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer" 
            data-testid="button-add-org"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 me-2" />
            {lang === 'ar' ? 'إضافة منظمة جديدة' : 'Add New Organization'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddOrganizationModal open={showAddModal} onOpenChange={setShowAddModal} />
      <EditOrganizationModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal} 
        organization={editingOrg}
      />
    </>
  );
}
