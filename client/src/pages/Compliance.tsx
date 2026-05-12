import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Shield, AlertTriangle, CheckCircle, Clock, FileText, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ComplianceItem } from "@shared/schema";

export default function Compliance() {
  const { t, lang, isRTL } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    category: "regulatory",
    priority: "medium",
    dueDate: "",
    notes: "",
  });

  const { data: items = [], isLoading } = useQuery<ComplianceItem[]>({
    queryKey: ['/api/organizations', 1, 'compliance'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/organizations/1/compliance", {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'compliance'] });
      toast({ title: lang === 'ar' ? 'تم بنجاح' : 'Success', description: lang === 'ar' ? 'تم إضافة بند الامتثال' : 'Compliance item added' });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'فشل في الإضافة' : 'Failed to add', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/compliance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'compliance'] });
      toast({ title: lang === 'ar' ? 'تم الحذف' : 'Deleted', description: lang === 'ar' ? 'تم حذف البند' : 'Item deleted' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/compliance/${id}`, { 
        status,
        completedDate: status === 'completed' ? new Date().toISOString() : null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', 1, 'compliance'] });
      toast({ title: lang === 'ar' ? 'تم التحديث' : 'Updated' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "regulatory",
      priority: "medium",
      dueDate: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: lang === 'ar' ? 'خطأ' : 'Error', description: lang === 'ar' ? 'العنوان مطلوب' : 'Title is required', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
  };

  const categories = [
    { value: 'tax', labelEn: 'Tax', labelAr: 'ضريبي' },
    { value: 'regulatory', labelEn: 'Regulatory', labelAr: 'تنظيمي' },
    { value: 'audit', labelEn: 'Audit', labelAr: 'تدقيق' },
    { value: 'legal', labelEn: 'Legal', labelAr: 'قانوني' },
    { value: 'internal', labelEn: 'Internal', labelAr: 'داخلي' },
  ];

  const priorities = [
    { value: 'low', labelEn: 'Low', labelAr: 'منخفض', color: 'bg-gray-500/20 text-gray-400' },
    { value: 'medium', labelEn: 'Medium', labelAr: 'متوسط', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'high', labelEn: 'High', labelAr: 'عالي', color: 'bg-orange-500/20 text-orange-400' },
    { value: 'critical', labelEn: 'Critical', labelAr: 'حرج', color: 'bg-red-500/20 text-red-400' },
  ];

  const statuses = [
    { value: 'pending', labelEn: 'Pending', labelAr: 'معلق', icon: Clock, color: 'text-gray-400' },
    { value: 'in_progress', labelEn: 'In Progress', labelAr: 'قيد التنفيذ', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'completed', labelEn: 'Completed', labelAr: 'مكتمل', icon: CheckCircle, color: 'text-green-400' },
    { value: 'overdue', labelEn: 'Overdue', labelAr: 'متأخر', icon: AlertTriangle, color: 'text-red-400' },
  ];

  const getStatusInfo = (status: string | null) => statuses.find(s => s.value === status) || statuses[0];
  const getPriorityInfo = (priority: string | null) => priorities.find(p => p.value === priority) || priorities[1];
  const getCategoryInfo = (category: string) => categories.find(c => c.value === category) || categories[1];

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const inProgressCount = items.filter(i => i.status === 'in_progress').length;
  const completedCount = items.filter(i => i.status === 'completed').length;
  const overdueCount = items.filter(i => i.status === 'overdue').length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{lang === 'ar' ? 'الامتثال' : 'Compliance'}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{lang === 'ar' ? 'إدارة متطلبات الامتثال والتنظيم' : 'Manage compliance and regulatory requirements'}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-compliance">
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'ar' ? 'إضافة بند' : 'Add Item'}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gray-500/10 border-gray-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'معلق' : 'Pending'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'مكتمل' : 'Completed'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'متأخر' : 'Overdue'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {lang === 'ar' ? 'بنود الامتثال' : 'Compliance Items'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{lang === 'ar' ? 'لا توجد بنود امتثال' : 'No compliance items yet'}</p>
              <p className="text-sm">{lang === 'ar' ? 'أضف بندًا للبدء' : 'Add an item to get started'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const priorityInfo = getPriorityInfo(item.priority);
                const categoryInfo = getCategoryInfo(item.category);
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover-elevate"
                    data-testid={`compliance-row-${item.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      <div>
                        <p className="font-medium">{lang === 'ar' && item.titleAr ? item.titleAr : item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {lang === 'ar' ? categoryInfo.labelAr : categoryInfo.labelEn}
                          {item.dueDate && ` • ${lang === 'ar' ? 'الموعد: ' : 'Due: '}${new Date(item.dueDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={priorityInfo.color}>
                        {lang === 'ar' ? priorityInfo.labelAr : priorityInfo.labelEn}
                      </Badge>
                      <Select
                        value={item.status || 'pending'}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: item.id, status })}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${item.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {lang === 'ar' ? s.labelAr : s.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className={`max-w-lg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{lang === 'ar' ? 'إضافة بند امتثال' : 'Add Compliance Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-title"
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  dir="rtl"
                  data-testid="input-title-ar"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'الفئة' : 'Category'}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {lang === 'ar' ? c.labelAr : c.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ar' ? 'الأولوية' : 'Priority'}</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {lang === 'ar' ? p.labelAr : p.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                data-testid="input-due-date"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                data-testid="input-description"
              />
            </div>
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                data-testid="input-notes"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                {createMutation.isPending ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
