import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, ArrowUpRight, Calendar } from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/utils';

type ProjectWithAudits = Prisma.ProjectGetPayload<{
  include: {
    audits: true;
    _count: { select: { audits: true } };
  };
}>;

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  let projects: ProjectWithAudits[] = [];
  try {
    projects = await prisma.project.findMany({
      include: {
        audits: { orderBy: { createdAt: 'desc' }, take: 5 },
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rapports</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">Vos projets et leurs audits</p>
        </div>
        <Link href="/audit/new">
          <Button variant="default" size="sm" className="w-full sm:w-auto"><Plus className="h-4 w-4" /> Nouvel audit</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4"><Globe className="h-8 w-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold">Aucun rapport</h3>
            <p className="mt-1 text-sm text-muted-foreground mb-4">Lancez votre premier audit pour g&eacute;n&eacute;rer un rapport.</p>
            <Link href="/audit/new"><Button variant="default" size="sm"><Plus className="h-4 w-4" /> Lancer un audit</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const lastAudit = project.audits[0];
            const score = lastAudit?.globalScore;
            return (
              <Card key={project.id} className="overflow-hidden">
                <CardContent className="p-5">
                  {/* Project header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[280px]">{project.url}</p>
                      </div>
                    </div>
                    {score !== null && score !== undefined && (
                      <div className={`text-xl font-bold ${
                        score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {Math.round(score)}
                        <span className="text-xs font-normal text-muted-foreground">/100</span>
                      </div>
                    )}
                  </div>

                  {/* Audits list */}
                  <div className="space-y-2">
                    {project.audits.map((audit) => (
                      <Link
                        key={audit.id}
                        href={audit.status === 'COMPLETED' ? `/audit/${audit.id}` : `/audit/${audit.id}/progress`}
                      >
                        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${
                              audit.status === 'COMPLETED' ? 'bg-green-500' :
                              audit.status === 'FAILED' ? 'bg-red-500' : 'bg-orange-400'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">
                                  {audit.status === 'COMPLETED' ? 'Terminé' :
                                   audit.status === 'FAILED' ? 'Échoué' : 'En cours'}
                                </span>
                                {audit.globalScore !== null && (
                                  <span className={`text-xs font-semibold ${
                                    audit.globalScore >= 80 ? 'text-green-600' :
                                    audit.globalScore >= 60 ? 'text-orange-500' : 'text-red-500'
                                  }`}>
                                    {Math.round(audit.globalScore)}/100
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatRelativeTime(audit.createdAt)}
                                {audit.pagesScanned > 0 && (
                                  <span>&middot; {audit.pagesScanned} pages &middot; {audit.issuesFound} probl&egrave;mes</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
