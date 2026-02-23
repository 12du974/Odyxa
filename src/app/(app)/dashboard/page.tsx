import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Globe, AlertTriangle, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBg(score: number | null) {
  if (score === null) return 'bg-muted';
  if (score >= 80) return 'bg-green-500/10';
  if (score >= 60) return 'bg-yellow-500/10';
  if (score >= 40) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'outline'> = {
  COMPLETED: 'success',
  FAILED: 'destructive',
  QUEUED: 'secondary',
  CRAWLING: 'default',
  SCANNING: 'default',
  ANALYZING: 'default',
};

const statusLabels: Record<string, string> = {
  QUEUED: 'En attente',
  CRAWLING: 'Crawling...',
  SCANNING: 'Scan...',
  ANALYZING: 'Analyse...',
  COMPLETED: 'Terminé',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let audits: any[] = [];
  let projectCount = 0;
  try {
    audits = await prisma.audit.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    projectCount = await prisma.project.count();
  } catch {
    /* DB not available */
  }

  const completedAudits = audits.filter((a) => a.status === 'COMPLETED');
  const totalIssues = audits.reduce((sum, a) => sum + a.issuesFound, 0);
  const avgScore = completedAudits.length > 0
    ? Math.round(completedAudits.reduce((sum, a) => sum + (a.globalScore ?? 0), 0) / completedAudits.length)
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Vue d&rsquo;ensemble de vos audits UI/UX
          </p>
        </div>
        <Link href="/audit/new">
          <Button variant="default" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nouvel Audit
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Score moyen"
          value={avgScore !== null ? `${avgScore}` : '--'}
          subtitle={avgScore !== null ? (avgScore >= 70 ? 'Bonne santé UX' : 'Améliorations nécessaires') : 'Aucun audit'}
          icon={<TrendingUp className="h-4 w-4" />}
          iconBg="bg-odixa-lime/10 text-odixa-purple"
        />
        <StatCard
          title="Projets"
          value={`${projectCount}`}
          subtitle="Sites web audités"
          icon={<Globe className="h-4 w-4" />}
          iconBg="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Audits réalisés"
          value={`${completedAudits.length}`}
          subtitle={`${audits.length - completedAudits.length} en cours`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          iconBg="bg-green-500/10 text-green-500"
        />
        <StatCard
          title="Problèmes détectés"
          value={`${totalIssues}`}
          subtitle="À travers tous les audits"
          icon={<AlertTriangle className="h-4 w-4" />}
          iconBg="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Recent Audits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Audits récents</h2>
          {audits.length > 5 && (
            <Link href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {audits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Aucun audit</h3>
              <p className="mt-1 text-sm text-muted-foreground mb-4">
                Lancez votre premier audit pour analyser l&rsquo;UX de votre site.
              </p>
              <Link href="/audit/new">
                <Button variant="default">
                  <Plus className="h-4 w-4" /> Lancer un audit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {audits.map((audit, i) => (
              <Link key={audit.id} href={audit.status === 'COMPLETED' ? `/audit/${audit.id}` : `/audit/${audit.id}/progress`}>
                <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                      style={{ animationDelay: `${i * 50}ms` }}>
                  <CardContent className="flex items-center gap-4 p-5">
                    {/* Score */}
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${getScoreBg(audit.globalScore)}`}>
                      <span className={`text-xl font-bold tabular-nums ${getScoreColor(audit.globalScore)}`}>
                        {audit.globalScore !== null ? Math.round(audit.globalScore) : '--'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{audit.project.name}</p>
                        <Badge variant={statusVariants[audit.status] || 'secondary'}>
                          {statusLabels[audit.status] || audit.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{audit.project.url}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{audit.pagesScanned}</p>
                        <p className="text-xs text-muted-foreground">pages</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{audit.issuesFound}</p>
                        <p className="text-xs text-muted-foreground">problèmes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(audit.createdAt)}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, iconBg }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; iconBg: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`rounded-lg p-1.5 sm:p-2 ${iconBg}`}>{icon}</div>
        </div>
        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold">{value}</p>
        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
