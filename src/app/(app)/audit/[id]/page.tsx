import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ReportTabs } from '@/components/reports/report-tabs';
import { Globe, Calendar, FileText, AlertTriangle } from 'lucide-react';

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default async function AuditReportPage({ params }: { params: { id: string } }) {
  let audit: any = null;
  try {
    audit = await prisma.audit.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        pages: {
          include: { issues: true },
          orderBy: { createdAt: 'asc' },
        },
        issues: {
          orderBy: [{ severity: 'asc' }, { impact: 'desc' }],
        },
      },
    });
  } catch {
    notFound();
  }

  if (!audit || audit.status !== 'COMPLETED') {
    notFound();
  }

  const scoreBreakdown = parseJson<Record<string, number>>(audit.scoreBreakdown, {});

  const pages = audit.pages.map((page: any) => ({
    id: page.id,
    url: page.url,
    title: page.title,
    pageScore: page.pageScore,
    statusCode: page.statusCode,
    screenshots: parseJson<Record<string, string>>(page.screenshots, {}),
    performanceMetrics: parseJson<Record<string, number>>(page.performanceMetrics, {}),
    scoreBreakdown: parseJson<Record<string, number>>(page.scoreBreakdown, {}),
    issues: page.issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      category: issue.category,
      framework: issue.framework,
      criterion: issue.criterion,
      selector: issue.selector,
      recommendation: issue.recommendation,
      effortLevel: issue.effortLevel,
      impact: issue.impact,
      codeSnippet: issue.codeSnippet,
      fixSnippet: issue.fixSnippet,
      pageAuditId: issue.pageAuditId,
    })),
  }));

  const issues = audit.issues.map((issue: any) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    severity: issue.severity,
    category: issue.category,
    framework: issue.framework,
    criterion: issue.criterion,
    selector: issue.selector,
    recommendation: issue.recommendation,
    effortLevel: issue.effortLevel,
    impact: issue.impact,
    codeSnippet: issue.codeSnippet,
    fixSnippet: issue.fixSnippet,
    pageAuditId: issue.pageAuditId,
  }));

  const criticalCount = issues.filter((i: any) => i.severity === 'CRITICAL').length;
  const majorCount = issues.filter((i: any) => i.severity === 'MAJOR').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {audit.project.favicon ? (
              <img
                src={audit.project.favicon}
                alt=""
                className="h-10 w-10 rounded-lg border border-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {audit.project.name}
              </h1>
              <a
                href={audit.project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {audit.project.url}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(audit.completedAt ?? audit.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{audit.pagesScanned} pages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span>{audit.issuesFound} probl\u00e8mes</span>
          </div>
          {criticalCount > 0 && (
            <Badge variant="critical">{criticalCount} critiques</Badge>
          )}
          {majorCount > 0 && (
            <Badge variant="major">{majorCount} majeurs</Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ReportTabs
        globalScore={audit.globalScore ?? 0}
        scoreBreakdown={scoreBreakdown}
        summary={audit.summary}
        pages={pages}
        issues={issues}
      />
    </div>
  );
}
