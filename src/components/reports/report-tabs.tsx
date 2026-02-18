'use client';

import { useState, useMemo } from 'react';
import { ScoreGauge } from '@/components/charts/score-gauge';
import { CategoryChart } from '@/components/charts/category-chart';
import { SeverityChart } from '@/components/charts/severity-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  FRAMEWORK_CONFIG,
  type IssueCategory,
  type Severity,
} from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Grid3X3,
  AlertTriangle,
  FileText,
  Rocket,
  ChevronDown,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Zap,
  Clock,
  Calendar,
  Code2,
  Wrench,
  BookOpen,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IssueData {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  framework: string;
  criterion: string | null;
  selector: string | null;
  recommendation: string;
  effortLevel: string;
  impact: number;
  codeSnippet: string | null;
  fixSnippet: string | null;
  pageAuditId: string | null;
}

interface PageData {
  id: string;
  url: string;
  title: string | null;
  pageScore: number | null;
  statusCode: number | null;
  screenshots: Record<string, string>;
  performanceMetrics: Record<string, number>;
  scoreBreakdown: Record<string, number>;
  issues: IssueData[];
}

interface ReportTabsProps {
  globalScore: number;
  scoreBreakdown: Record<string, number>;
  summary: string | null;
  pages: PageData[];
  issues: IssueData[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FRAMEWORK_URLS: Record<string, string> = {
  'WCAG 2.2': 'https://www.w3.org/TR/WCAG22/',
  'Core Web Vitals': 'https://web.dev/vitals/',
  'Design System Consistency': 'https://designsystemchecklist.com/',
  'Standards Formulaires': 'https://www.w3.org/WAI/tutorials/forms/',
  'Standards de Contenu': 'https://www.w3.org/WAI/WCAG21/Understanding/reading-level.html',
  'SEO Technique': 'https://developers.google.com/search/docs',
  "Architecture de l'Information": 'https://www.nngroup.com/articles/ia-vs-navigation/',
  'Dark Patterns Detection': 'https://www.deceptive.design/',
};

type TabId = 'resume' | 'categories' | 'issues' | 'pages' | 'roadmap';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'resume', label: 'Résumé', icon: LayoutDashboard },
  { id: 'categories', label: 'Catégories', icon: Grid3X3 },
  { id: 'issues', label: 'Problèmes', icon: AlertTriangle },
  { id: 'pages', label: 'Par page', icon: FileText },
  { id: 'roadmap', label: 'Feuille de route', icon: Rocket },
];

const SEVERITY_BADGE_MAP: Record<string, 'critical' | 'major' | 'minor' | 'suggestion'> = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  SUGGESTION: 'suggestion',
};

const EFFORT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  QUICK_WIN: { label: 'Gain rapide', icon: Zap, color: 'text-green-600' },
  MEDIUM: { label: 'Effort modéré', icon: Clock, color: 'text-orange-500' },
  LONG_TERM: { label: 'Long terme', icon: Calendar, color: 'text-red-500' },
};

const VIEWPORT_OPTIONS = [
  { key: 'desktop', label: 'Desktop', icon: Monitor },
  { key: 'tablet', label: 'Tablette', icon: Tablet },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
] as const;

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ReportTabs({ globalScore, scoreBreakdown, summary, pages, issues }: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resume');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('ALL');
  const [selectedPage, setSelectedPage] = useState<string>(pages[0]?.id ?? '');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [expandedRoadmap, setExpandedRoadmap] = useState<Set<string>>(new Set(['QUICK_WIN', 'MEDIUM', 'LONG_TERM']));
  const [viewport, setViewport] = useState<string>('desktop');

  const toggleIssue = (id: string) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRoadmap = (key: string) => {
    setExpandedRoadmap((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* Severity counts */
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: issues.length };
    for (const issue of issues) {
      counts[issue.severity] = (counts[issue.severity] || 0) + 1;
    }
    return counts;
  }, [issues]);

  /* Available categories */
  const availableCategories = useMemo(() => {
    const cats = new Set(issues.map((i) => i.category));
    return Array.from(cats).sort();
  }, [issues]);

  /* Available frameworks */
  const availableFrameworks = useMemo(() => {
    const fws = new Set(issues.map((i) => i.framework).filter(Boolean));
    return Array.from(fws).sort();
  }, [issues]);

  /* Framework counts */
  const frameworkCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: issues.length };
    for (const issue of issues) {
      if (issue.framework) {
        counts[issue.framework] = (counts[issue.framework] || 0) + 1;
      }
    }
    return counts;
  }, [issues]);

  /* Filtered issues */
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false;
      if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
      if (frameworkFilter !== 'ALL' && issue.framework !== frameworkFilter) return false;
      return true;
    });
  }, [issues, severityFilter, categoryFilter, frameworkFilter]);

  /* Category stats */
  const categoryStats = useMemo(() => {
    const stats: Record<string, { score: number; issueCount: number }> = {};
    for (const [cat, score] of Object.entries(scoreBreakdown)) {
      stats[cat] = {
        score: Math.round(score),
        issueCount: issues.filter((i) => i.category === cat).length,
      };
    }
    return stats;
  }, [scoreBreakdown, issues]);

  /* Top 5 issues by severity */
  const topIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => {
        const sa = SEVERITY_ORDER[a.severity as Severity] ?? 99;
        const sb = SEVERITY_ORDER[b.severity as Severity] ?? 99;
        if (sa !== sb) return sa - sb;
        return b.impact - a.impact;
      })
      .slice(0, 5);
  }, [issues]);

  /* Selected page data */
  const selectedPageData = useMemo(() => {
    return pages.find((p) => p.id === selectedPage) ?? pages[0] ?? null;
  }, [pages, selectedPage]);

  /* Roadmap groups */
  const roadmapGroups = useMemo(() => {
    const groups: Record<string, IssueData[]> = {
      QUICK_WIN: [],
      MEDIUM: [],
      LONG_TERM: [],
    };
    for (const issue of issues) {
      const key = issue.effortLevel in groups ? issue.effortLevel : 'MEDIUM';
      groups[key].push(issue);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        const sa = SEVERITY_ORDER[a.severity as Severity] ?? 99;
        const sb = SEVERITY_ORDER[b.severity as Severity] ?? 99;
        return sa !== sb ? sa - sb : b.impact - a.impact;
      });
    }
    return groups;
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted/50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'resume' && (
        <ResumeTab
          globalScore={globalScore}
          scoreBreakdown={scoreBreakdown}
          summary={summary}
          issues={issues}
          topIssues={topIssues}
          toggleIssue={toggleIssue}
          expandedIssues={expandedIssues}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab scoreBreakdown={scoreBreakdown} categoryStats={categoryStats} />
      )}

      {activeTab === 'issues' && (
        <IssuesTab
          filteredIssues={filteredIssues}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          frameworkFilter={frameworkFilter}
          setFrameworkFilter={setFrameworkFilter}
          severityCounts={severityCounts}
          availableCategories={availableCategories}
          availableFrameworks={availableFrameworks}
          frameworkCounts={frameworkCounts}
          expandedIssues={expandedIssues}
          toggleIssue={toggleIssue}
        />
      )}

      {activeTab === 'pages' && (
        <PagesTab
          pages={pages}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          selectedPageData={selectedPageData}
          viewport={viewport}
          setViewport={setViewport}
          expandedIssues={expandedIssues}
          toggleIssue={toggleIssue}
        />
      )}

      {activeTab === 'roadmap' && (
        <RoadmapTab
          roadmapGroups={roadmapGroups}
          expandedRoadmap={expandedRoadmap}
          toggleRoadmap={toggleRoadmap}
          expandedIssues={expandedIssues}
          toggleIssue={toggleIssue}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  RESUME TAB                                                         */
/* ================================================================== */

const NIELSEN_HEURISTICS: {
  id: string; label: string; desc: string; categories: string[];
}[] = [
  { id: 'visibility', label: "Visibilité du statut", desc: "Le système informe l’utilisateur de ce qui se passe", categories: ['NAVIGATION', 'PERFORMANCE'] },
  { id: 'match', label: "Correspondance monde réel", desc: "Le langage est familier et logique pour l’utilisateur", categories: ['CONTENT'] },
  { id: 'control', label: "Contrôle utilisateur", desc: "L’utilisateur peut annuler et revenir en arrière", categories: ['NAVIGATION', 'FORMS'] },
  { id: 'consistency', label: "Cohérence et standards", desc: "Les conventions de la plateforme sont respectées", categories: ['DESIGN_CONSISTENCY'] },
  { id: 'error-prevention', label: "Prévention des erreurs", desc: "Le design empêche les erreurs avant qu’elles surviennent", categories: ['FORMS', 'DARK_PATTERNS'] },
  { id: 'recognition', label: "Reconnaissance vs rappel", desc: "L’information est visible, pas à mémoriser", categories: ['NAVIGATION', 'CONTENT'] },
  { id: 'flexibility', label: "Flexibilité et efficacité", desc: "Des raccourcis pour les utilisateurs expérimentés", categories: ['NAVIGATION', 'ACCESSIBILITY'] },
  { id: 'aesthetic', label: "Esthétique et minimalisme", desc: "Pas d’information superflue", categories: ['DESIGN_CONSISTENCY', 'CONTENT'] },
  { id: 'error-recovery', label: "Aide à la correction", desc: "Les messages d’erreur sont clairs et utiles", categories: ['FORMS'] },
  { id: 'help', label: "Aide et documentation", desc: "Une documentation accessible si nécessaire", categories: ['ACCESSIBILITY', 'CONTENT'] },
];

function ResumeTab({
  globalScore,
  scoreBreakdown,
  summary,
  issues,
  topIssues,
  toggleIssue,
  expandedIssues,
}: {
  globalScore: number;
  scoreBreakdown: Record<string, number>;
  summary: string | null;
  issues: IssueData[];
  topIssues: IssueData[];
  toggleIssue: (id: string) => void;
  expandedIssues: Set<string>;
}) {
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const majorCount = issues.filter(i => i.severity === 'MAJOR').length;
  const minorCount = issues.filter(i => i.severity === 'MINOR').length;

  return (
    <div className="space-y-6">
      {/* Header synthétique */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={globalScore} size={140} strokeWidth={10} />
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Bilan de l&rsquo;audit</h3>
                {summary && (
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{summary}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                  </span>
                )}
                {majorCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    {majorCount} majeur{majorCount > 1 ? 's' : ''}
                  </span>
                )}
                {minorCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    {minorCount} mineur{minorCount > 1 ? 's' : ''}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {issues.length} problème{issues.length !== 1 ? 's' : ''} au total
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scores par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart scores={scoreBreakdown} type="bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par sévérité</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityChart issues={issues} />
          </CardContent>
        </Card>
      </div>

      {/* Référentiels — tags sobres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Référentiels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              issues.reduce<Record<string, number>>((acc, issue) => {
                if (issue.framework) acc[issue.framework] = (acc[issue.framework] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([fw, count]) => {
                const config = FRAMEWORK_CONFIG[fw];
                const fwUrl = FRAMEWORK_URLS[fw];
                const tag = (
                  <span
                    key={fw}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
                  >
                    {config?.label ?? fw}
                    <span className="text-muted-foreground">({count})</span>
                  </span>
                );
                return fwUrl ? (
                  <a key={fw} href={fwUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                    {tag}
                  </a>
                ) : tag;
              })}
          </div>
        </CardContent>
      </Card>

      {/* Heuristiques de Nielsen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Critères de Jakob Nielsen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {NIELSEN_HEURISTICS.map((h) => {
              const relatedIssues = issues.filter(i => h.categories.includes(i.category));
              const score = h.categories.length > 0
                ? Math.round(h.categories.reduce((sum, cat) => sum + (scoreBreakdown[cat] ?? 100), 0) / h.categories.length)
                : 100;
              const statusColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-orange-400' : 'bg-red-500';
              const statusLabel = score >= 80 ? 'Conforme' : score >= 60 ? 'À surveiller' : 'Non conforme';
              return (
                <div key={h.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <span className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${statusColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium">{h.label}</p>
                      <span className="text-[10px] font-semibold tabular-nums shrink-0" style={{ color: score >= 80 ? '#16a34a' : score >= 60 ? '#f97316' : '#ef4444' }}>
                        {score}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                    {relatedIssues.length > 0 && (
                      <p className="mt-1 text-[10px] text-orange-600 dark:text-orange-400">
                        {relatedIssues.length} problème{relatedIssues.length > 1 ? 's' : ''} détecté{relatedIssues.length > 1 ? 's' : ''} — {statusLabel}
                      </p>
                    )}
                    {relatedIssues.length === 0 && (
                      <p className="mt-1 text-[10px] text-green-600 dark:text-green-400">Conforme</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top 5 problèmes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 problèmes prioritaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topIssues.map((issue, idx) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              index={idx + 1}
              expanded={expandedIssues.has(issue.id)}
              onToggle={() => toggleIssue(issue.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  CATEGORIES TAB                                                     */
/* ================================================================== */

function CategoriesTab({
  scoreBreakdown,
  categoryStats,
}: {
  scoreBreakdown: Record<string, number>;
  categoryStats: Record<string, { score: number; issueCount: number }>;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vue radar</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart scores={scoreBreakdown} type="radar" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(categoryStats).map(([cat, stats]) => {
          const scoreColor = stats.score >= 80 ? 'text-green-600' : stats.score >= 60 ? 'text-orange-500' : 'text-red-500';
          return (
            <Card key={cat} className="group hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {CATEGORY_LABELS[cat as IssueCategory] ?? cat}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.issueCount} problème{stats.issueCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={cn('text-lg font-bold tabular-nums', scoreColor)}>
                      {stats.score}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ISSUES TAB                                                         */
/* ================================================================== */

function IssuesTab({
  filteredIssues,
  severityFilter,
  setSeverityFilter,
  categoryFilter,
  setCategoryFilter,
  frameworkFilter,
  setFrameworkFilter,
  severityCounts,
  availableCategories,
  availableFrameworks,
  frameworkCounts,
  expandedIssues,
  toggleIssue,
}: {
  filteredIssues: IssueData[];
  severityFilter: string;
  setSeverityFilter: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  frameworkFilter: string;
  setFrameworkFilter: (v: string) => void;
  severityCounts: Record<string, number>;
  availableCategories: string[];
  availableFrameworks: string[];
  frameworkCounts: Record<string, number>;
  expandedIssues: Set<string>;
  toggleIssue: (id: string) => void;
}) {
  const severityButtons: { key: string; label: string }[] = [
    { key: 'ALL', label: 'Tous' },
    { key: 'CRITICAL', label: 'Critiques' },
    { key: 'MAJOR', label: 'Majeurs' },
    { key: 'MINOR', label: 'Mineurs' },
    { key: 'SUGGESTION', label: 'Suggestions' },
  ];

  return (
    <div className="space-y-4">
      {/* Severity filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {severityButtons.map((btn) => {
            const isActive = severityFilter === btn.key;
            const activeColor =
              btn.key === 'CRITICAL' ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300' :
              btn.key === 'MAJOR' ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300' :
              'border-foreground/20 bg-muted text-foreground';
            return (
              <button
                key={btn.key}
                onClick={() => setSeverityFilter(btn.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                  isActive ? activeColor : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                )}
              >
                {btn.label}
                <span className="tabular-nums opacity-70">({severityCounts[btn.key] ?? 0})</span>
              </button>
            );
          })}
        </div>

        {/* Framework filter pills — tags sobres */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-medium">Référentiel :</span>
          </div>
          <button
            onClick={() => setFrameworkFilter('ALL')}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
              frameworkFilter === 'ALL'
                ? 'border-foreground/20 bg-muted text-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
            )}
          >
            Tous
          </button>
          {availableFrameworks.map((fw) => {
            const config = FRAMEWORK_CONFIG[fw];
            const isActive = frameworkFilter === fw;
            return (
              <button
                key={fw}
                onClick={() => setFrameworkFilter(fw)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                  isActive
                    ? 'border-foreground/20 bg-muted text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                )}
              >
                {config?.abbrev ?? fw}
                <span className="tabular-nums opacity-60">({frameworkCounts[fw] ?? 0})</span>
              </button>
            );
          })}
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="ALL">Toutes les catégories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat as IssueCategory] ?? cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compteur */}
      <p className="text-sm text-muted-foreground">
        {filteredIssues.length} problème{filteredIssues.length !== 1 ? 's' : ''} trouvé{filteredIssues.length !== 1 ? 's' : ''}
      </p>

      {/* Issue list */}
      <div className="space-y-2">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Aucune issue ne correspond aux filtres sélectionnés.
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              expanded={expandedIssues.has(issue.id)}
              onToggle={() => toggleIssue(issue.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGES TAB                                                          */
/* ================================================================== */

function PagesTab({
  pages,
  selectedPage,
  setSelectedPage,
  selectedPageData,
  viewport,
  setViewport,
  expandedIssues,
  toggleIssue,
}: {
  pages: PageData[];
  selectedPage: string;
  setSelectedPage: (id: string) => void;
  selectedPageData: PageData | null;
  viewport: string;
  setViewport: (v: string) => void;
  expandedIssues: Set<string>;
  toggleIssue: (id: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <Card className="lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pages ({pages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-3 pt-0">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all',
                selectedPage === page.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {page.title || extractPath(page.url)}
                </p>
                <p className="truncate text-xs opacity-60">
                  {extractPath(page.url)}
                </p>
              </div>
              <div className="ml-3 flex flex-col items-end gap-0.5 shrink-0">
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: getScoreColor(page.pageScore ?? 0) }}
                >
                  {page.pageScore !== null ? Math.round(page.pageScore) : '--'}
                </span>
                <span className="text-[10px] opacity-50">
                  {page.issues.length} pb{page.issues.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Detail */}
      {selectedPageData ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">
                    {selectedPageData.title || extractPath(selectedPageData.url)}
                  </h3>
                  <a
                    href={selectedPageData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {selectedPageData.url}
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreGauge
                    score={selectedPageData.pageScore ?? 0}
                    size={64}
                    strokeWidth={5}
                    animated={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Viewport toggle + screenshot */}
          {Object.keys(selectedPageData.screenshots).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Capture d&apos;ecran</CardTitle>
                  <div className="flex gap-1 rounded-lg bg-muted p-0.5">
                    {VIEWPORT_OPTIONS.map((vp) => {
                      const VpIcon = vp.icon;
                      return (
                        <button
                          key={vp.key}
                          onClick={() => setViewport(vp.key)}
                          className={cn(
                            'rounded-md p-1.5 transition-all',
                            viewport === vp.key
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          title={vp.label}
                        >
                          <VpIcon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedPageData.screenshots[viewport] ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={selectedPageData.screenshots[viewport]}
                      alt={`Capture ${viewport}`}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                    Aucune capture pour ce viewport
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Page issues */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Problèmes ({selectedPageData.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedPageData.issues.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun problème détecté sur cette page.
                </p>
              ) : (
                selectedPageData.issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    expanded={expandedIssues.has(issue.id)}
                    onToggle={() => toggleIssue(issue.id)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Sélectionnez une page dans la liste.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ================================================================== */
/*  ROADMAP TAB                                                        */
/* ================================================================== */

function RoadmapTab({
  roadmapGroups,
  expandedRoadmap,
  toggleRoadmap,
  expandedIssues,
  toggleIssue,
}: {
  roadmapGroups: Record<string, IssueData[]>;
  expandedRoadmap: Set<string>;
  toggleRoadmap: (key: string) => void;
  expandedIssues: Set<string>;
  toggleIssue: (id: string) => void;
}) {
  const groupOrder = ['QUICK_WIN', 'MEDIUM', 'LONG_TERM'];

  return (
    <div className="space-y-4">
      {groupOrder.map((key) => {
        const config = EFFORT_CONFIG[key];
        const groupIssues = roadmapGroups[key] ?? [];
        const isOpen = expandedRoadmap.has(key);
        const GroupIcon = config.icon;

        return (
          <Card key={key}>
            <button
              onClick={() => toggleRoadmap(key)}
              className="flex w-full items-center gap-3 p-5 text-left"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-muted', config.color)}>
                <GroupIcon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{config.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {groupIssues.length} problème{groupIssues.length !== 1 ? 's' : ''}
                </p>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isOpen && groupIssues.length > 0 && (
              <CardContent className="space-y-2 pt-0">
                {groupIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    expanded={expandedIssues.has(issue.id)}
                    onToggle={() => toggleIssue(issue.id)}
                  />
                ))}
              </CardContent>
            )}
            {isOpen && groupIssues.length === 0 && (
              <CardContent className="pt-0">
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucun problème dans cette catégorie.
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  ISSUE CARD                                                         */
/* ================================================================== */

function IssueCard({
  issue,
  index,
  expanded,
  onToggle,
}: {
  issue: IssueData;
  index?: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const severityVariant = SEVERITY_BADGE_MAP[issue.severity] ?? 'outline';
  const effortConfig = EFFORT_CONFIG[issue.effortLevel];

  return (
    <div
      className={cn(
        'rounded-lg border border-border transition-all',
        expanded ? 'bg-muted/30' : 'hover:bg-muted/20'
      )}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        {index !== undefined && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold tabular-nums text-muted-foreground">
            {index}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={severityVariant}>
              {SEVERITY_LABELS[issue.severity as Severity] ?? issue.severity}
            </Badge>
            <span className="text-sm font-medium truncate">{issue.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {CATEGORY_LABELS[issue.category as IssueCategory] ?? issue.category}
            </span>
            {issue.framework && (
              <FrameworkBadge framework={issue.framework} />
            )}
            {effortConfig && (
              <span className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {effortConfig.label}
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h4>
            <p className="text-sm leading-relaxed">{issue.description}</p>
          </div>

          {/* Recommendation */}
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recommandation
            </h4>
            <p className="text-sm leading-relaxed">{issue.recommendation}</p>
          </div>

          {/* Meta grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetaItem label="Référentiel" value={issue.framework} />
            {issue.criterion && <MetaItem label="Critère" value={issue.criterion} />}
            <MetaItem label="Impact" value={`${issue.impact}/10`} />
          </div>

          {/* Code snippet */}
          {issue.codeSnippet && (
            <div>
              <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Code2 className="h-3 w-3" />
                Code problématique
              </h4>
              <pre className="overflow-x-auto rounded-lg bg-black/80 p-3 text-xs text-green-400">
                <code>{issue.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Fix snippet */}
          {issue.fixSnippet && (
            <div>
              <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Wrench className="h-3 w-3" />
                Correction suggérée
              </h4>
              <pre className="overflow-x-auto rounded-lg bg-black/80 p-3 text-xs text-blue-400">
                <code>{issue.fixSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function FrameworkBadge({ framework }: { framework: string }) {
  const config = FRAMEWORK_CONFIG[framework];
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {config?.abbrev ?? framework}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#f97316';
  return '#ef4444';
}

function extractPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === '/' ? '/' : u.pathname;
  } catch {
    return url;
  }
}
