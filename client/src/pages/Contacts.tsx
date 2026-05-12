import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building, User, Mail, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import type { Contact } from "@shared/schema";

export default function Contacts() {
  const { t, lang } = useI18n();
  
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/organizations/1/contacts'],
  });

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-green-500/20 text-green-400 border-green-500/30',
      vendor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      both: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    const labels: Record<string, string> = lang === 'ar'
      ? { customer: 'عميل', vendor: 'مورد', both: 'عميل ومورد' }
      : { customer: 'Customer', vendor: 'Vendor', both: 'Both' };
    return (
      <Badge variant="outline" className={colors[type] || ''}>
        {labels[type] || type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  const demoContacts = [
    { id: 1, name: 'Tech Solutions Ltd', type: 'customer', email: 'contact@techsolutions.com', phone: '+971 4 123 4567', balance: 45000 },
    { id: 2, name: 'Global Supplies Co', type: 'vendor', email: 'orders@globalsupplies.com', phone: '+971 4 987 6543', balance: -12000 },
    { id: 3, name: 'Innovation Partners', type: 'both', email: 'info@innovationpartners.ae', phone: '+971 2 555 1234', balance: 8500 },
  ];

  const displayContacts = contacts.length > 0 ? contacts : demoContacts;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t.contacts}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === 'ar' ? 'إدارة العملاء والموردين' : 'Customer & Vendor Management'}
          </p>
        </div>
        <Button data-testid="button-add-contact">
          <Plus className="w-4 h-4 mr-2" />
          {t.create}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'العملاء' : 'Customers'}</p>
                <p className="text-2xl font-bold">{displayContacts.filter(c => c.type === 'customer' || c.type === 'both').length}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'الموردون' : 'Vendors'}</p>
                <p className="text-2xl font-bold">{displayContacts.filter(c => c.type === 'vendor' || c.type === 'both').length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'الإجمالي' : 'Total'}</p>
                <p className="text-2xl font-bold">{displayContacts.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {lang === 'ar' ? 'جهات الاتصال' : 'Contacts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover-elevate cursor-pointer"
                data-testid={`contact-row-${contact.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{contact.name}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${Number(contact.balance) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(Math.abs(Number(contact.balance) || 0), 'USD', lang)}
                  </span>
                  {getTypeBadge(contact.type)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
