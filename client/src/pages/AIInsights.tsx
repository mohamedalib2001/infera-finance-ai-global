import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { formatDate } from "@/lib/i18n";
import type { AiInsight } from "@shared/schema";

export default function AIInsights() {
  const { t, lang } = useI18n();
  
  const { data: insights = [], isLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/organizations/1/ai-insights'],
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'forecast': return <TrendingUp className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5" />;
      case 'recommendation': return <Target className="w-5 h-5" />;
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = lang === 'ar'
      ? { forecast: 'توقع', risk: 'مخاطرة', opportunity: 'فرصة', recommendation: 'توصية', anomaly: 'شذوذ' }
      : { forecast: 'Forecast', risk: 'Risk', opportunity: 'Opportunity', recommendation: 'Recommendation', anomaly: 'Anomaly' };
    return labels[type] || type;
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

  const stats = {
    total: insights.length,
    unread: insights.filter(i => !i.isRead).length,
    risks: insights.filter(i => i.type === 'risk').length,
    opportunities: insights.filter(i => i.type === 'opportunity').length,
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t.aiInsights}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {lang === 'ar' ? 'رؤى وتوصيات الذكاء الاصطناعي' : 'AI-Powered Insights & Recommendations'}
          </p>
        </div>
        <Button data-testid="button-refresh-insights">
          <Sparkles className="w-4 h-4 mr-2" />
          {lang === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي الرؤى' : 'Total Insights'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'غير مقروءة' : 'Unread'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.risks}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'تنبيهات' : 'Alerts'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Lightbulb className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.opportunities}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'فرص' : 'Opportunities'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {lang === 'ar' ? 'الرؤى الأخيرة' : 'Recent Insights'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{lang === 'ar' ? 'لا توجد رؤى بعد' : 'No insights yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)} hover-elevate cursor-pointer`}
                  data-testid={`insight-row-${insight.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {lang === 'ar' && insight.titleAr ? insight.titleAr : insight.title}
                        </h3>
                        <Badge variant="outline" className={getSeverityColor(insight.severity)}>
                          {getTypeLabel(insight.type)}
                        </Badge>
                        {!insight.isRead && (
                          <Badge className="bg-primary text-primary-foreground">
                            {lang === 'ar' ? 'جديد' : 'New'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lang === 'ar' && insight.descriptionAr ? insight.descriptionAr : insight.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {insight.createdAt && formatDate(insight.createdAt, lang)}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
