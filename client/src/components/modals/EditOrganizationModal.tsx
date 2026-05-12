import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Loader2, Pencil } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameAr: z.string().optional(),
  type: z.string().min(1, "Please select organization type"),
  country: z.string().min(1, "Please select country"),
  currency: z.string().default("USD"),
  industry: z.string().optional(),
  taxId: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

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

interface EditOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
}

export function EditOrganizationModal({ open, onOpenChange, organization }: EditOrganizationModalProps) {
  const { lang } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      type: "",
      country: "",
      currency: "USD",
      industry: "",
      taxId: "",
    },
  });

  useEffect(() => {
    if (organization && open) {
      form.reset({
        name: organization.name || "",
        nameAr: organization.nameAr || "",
        type: organization.type || "",
        country: organization.country || "",
        currency: organization.currency || "USD",
        industry: organization.industry || "",
        taxId: organization.taxId || "",
      });
    }
  }, [organization, open, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      if (!organization) throw new Error("No organization to update");
      const res = await apiRequest("PATCH", `/api/organizations/${organization.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: lang === "ar" ? "تم بنجاح" : "Success",
        description: lang === "ar" ? "تم تحديث المنظمة بنجاح" : "Organization updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message || (lang === "ar" ? "فشل في تحديث المنظمة" : "Failed to update organization"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    updateMutation.mutate(data);
  };

  const orgTypes = [
    { value: "individual", label: lang === "ar" ? "فردي" : "Individual" },
    { value: "business", label: lang === "ar" ? "شركة" : "Business" },
    { value: "enterprise", label: lang === "ar" ? "مؤسسة كبرى" : "Enterprise" },
    { value: "bank", label: lang === "ar" ? "بنك" : "Bank" },
    { value: "government", label: lang === "ar" ? "حكومي" : "Government" },
  ];

  const countries = [
    { value: "SA", label: lang === "ar" ? "السعودية" : "Saudi Arabia" },
    { value: "AE", label: lang === "ar" ? "الإمارات" : "UAE" },
    { value: "EG", label: lang === "ar" ? "مصر" : "Egypt" },
    { value: "KW", label: lang === "ar" ? "الكويت" : "Kuwait" },
    { value: "QA", label: lang === "ar" ? "قطر" : "Qatar" },
    { value: "BH", label: lang === "ar" ? "البحرين" : "Bahrain" },
    { value: "OM", label: lang === "ar" ? "عمان" : "Oman" },
    { value: "JO", label: lang === "ar" ? "الأردن" : "Jordan" },
    { value: "LB", label: lang === "ar" ? "لبنان" : "Lebanon" },
    { value: "US", label: lang === "ar" ? "أمريكا" : "United States" },
    { value: "GB", label: lang === "ar" ? "بريطانيا" : "United Kingdom" },
    { value: "Global", label: lang === "ar" ? "عالمي" : "Global" },
  ];

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "SAR", label: "SAR - Saudi Riyal" },
    { value: "AED", label: "AED - UAE Dirham" },
    { value: "EGP", label: "EGP - Egyptian Pound" },
    { value: "KWD", label: "KWD - Kuwaiti Dinar" },
    { value: "QAR", label: "QAR - Qatari Riyal" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            {lang === "ar" ? "تعديل المنظمة" : "Edit Organization"}
          </DialogTitle>
          <DialogDescription>
            {lang === "ar" 
              ? "قم بتعديل بيانات المنظمة" 
              : "Update the organization details"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "ar" ? "اسم المنظمة (إنجليزي)" : "Organization Name"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={lang === "ar" ? "أدخل اسم المنظمة" : "Enter organization name"} 
                      {...field} 
                      data-testid="input-edit-org-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "ar" ? "اسم المنظمة (عربي)" : "Arabic Name (Optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={lang === "ar" ? "أدخل الاسم بالعربية" : "Enter Arabic name"} 
                      {...field} 
                      data-testid="input-edit-org-name-ar"
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "ar" ? "نوع المنظمة" : "Organization Type"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-org-type">
                          <SelectValue placeholder={lang === "ar" ? "اختر النوع" : "Select type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orgTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "ar" ? "البلد" : "Country"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-country">
                          <SelectValue placeholder={lang === "ar" ? "اختر البلد" : "Select country"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "ar" ? "العملة" : "Currency"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-currency">
                          <SelectValue placeholder={lang === "ar" ? "اختر العملة" : "Select currency"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "ar" ? "الصناعة" : "Industry"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={lang === "ar" ? "مثال: تقنية" : "e.g., Technology"} 
                        {...field} 
                        data-testid="input-edit-industry"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === "ar" ? "الرقم الضريبي (اختياري)" : "Tax ID (Optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={lang === "ar" ? "أدخل الرقم الضريبي" : "Enter tax ID"} 
                      {...field} 
                      data-testid="input-edit-tax-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-save-org"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {lang === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  lang === "ar" ? "حفظ التغييرات" : "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
