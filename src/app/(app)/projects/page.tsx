import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, ArrowUpRight, BarChart3 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      include: {
        audits: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { audits: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {
    /* DB not available */
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projets</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">Tous vos sites web audit&eacute;s</p>
        </div>
        <Link href="/audit/new">
          <Button variant="gradient" className="w-full sm:w-auto"><Plus className="h-4 w-4" /> Nouveau projet</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4"><Globe className="h-8 w-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold">Aucun projet</h3>
            <p className="mt-1 text-sm text-muted-foreground mb-4">Lancez votre premier audit pour creer un projet.</p>
            <Link href="/audit/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Lancer un audit</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const lastAudit = project.audits[0];
            const score = lastAudit?.globalScore;
            return (
              <Card key={project.id} className="group hover:border-primary/30 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{project.url}</p>
                      </div>
                    </div>
                    {score !== null && score !== undefined && (
                      <div className={`text-2xl font-bold ${
                        score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {Math.round(score)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project._count.audits} audit{project._count.audits > 1 ? 's' : ''}</span>
                    {lastAudit && <span>{formatRelativeTime(lastAudit.createdAt)}</span>}
                  </div>

                  {lastAudit && (
                    <div className="mt-3">
                      <Link href={lastAudit.status === 'COMPLETED' ? `/audit/${lastAudit.id}` : `/audit/${lastAudit.id}/progress`}>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          Voir le dernier audit
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
