import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowUpRight, Calendar, Globe } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ReportsPage() {
  const audits = await prisma.audit.findMany({
    where: { status: 'COMPLETED' },
    include: { project: true },
    orderBy: { completedAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rapports</h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">Historique de tous vos audits termin&eacute;s</p>
      </div>

      {audits.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4"><BarChart3 className="h-8 w-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold">Aucun rapport</h3>
            <p className="mt-1 text-sm text-muted-foreground mb-4">Les rapports apparaitront ici une fois un audit termine.</p>
            <Link href="/audit/new"><Button variant="gradient">Lancer un audit</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => {
            const score = audit.globalScore;
            return (
              <Link key={audit.id} href={`/audit/${audit.id}`}>
                <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                      score !== null && score >= 80 ? 'bg-green-500/10' :
                      score !== null && score >= 60 ? 'bg-yellow-500/10' :
                      score !== null ? 'bg-red-500/10' : 'bg-muted'
                    }`}>
                      <span className={`text-xl font-bold ${
                        score !== null && score >= 80 ? 'text-green-500' :
                        score !== null && score >= 60 ? 'text-yellow-500' :
                        score !== null ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {score !== null ? Math.round(score) : '--'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{audit.project.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1 truncate"><Globe className="h-3 w-3 shrink-0" /> <span className="truncate">{audit.project.url}</span></span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 shrink-0" /> {formatDate(audit.completedAt || audit.createdAt)}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <div className="text-right"><p className="font-medium">{audit.pagesScanned}</p><p className="text-xs text-muted-foreground">pages</p></div>
                      <div className="text-right"><p className="font-medium">{audit.issuesFound}</p><p className="text-xs text-muted-foreground">issues</p></div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
