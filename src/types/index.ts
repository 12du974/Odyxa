export type AuditStatus =
  | 'QUEUED'
  | 'CRAWLING'
  | 'SCANNING'
  | 'ANALYZING'
  | 'GENERATING_REPORT'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'SUGGESTION';

export type IssueCategory =
  | 'ACCESSIBILITY'
  | 'PERFORMANCE'
  | 'DESIGN_CONSISTENCY'
  | 'FORMS'
  | 'CONTENT'
  | 'SEO'
  | 'NAVIGATION'
  | 'DARK_PATTERNS';

export type EffortLevel = 'QUICK_WIN' | 'MEDIUM' | 'LONG_TERM';

export interface ScanConfig {
  maxPages: number;
  maxDepth: number;
  viewports: Viewport[];
  delayBetweenRequests: number;
  categories: IssueCategory[];
}

export interface Viewport {
  name: string;
  width: number;
  height: number;
}

export const DEFAULT_VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

export const ALL_CATEGORIES: IssueCategory[] = [
  'ACCESSIBILITY', 'PERFORMANCE', 'DESIGN_CONSISTENCY',
  'FORMS', 'CONTENT', 'SEO', 'NAVIGATION', 'DARK_PATTERNS',
];

export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  maxPages: 10,
  maxDepth: 2,
  viewports: DEFAULT_VIEWPORTS,
  delayBetweenRequests: 1000,
  categories: ALL_CATEGORIES,
};

export interface AnalyzerInput {
  url: string;
  html: string;
  screenshotPaths: Record<string, string>;
  pageTitle: string | null;
}

export interface AnalyzerOutput {
  score: number;
  issues: AnalyzerIssue[];
  metadata: Record<string, unknown>;
}

export interface AnalyzerIssue {
  title: string;
  description: string;
  severity: Severity;
  category: IssueCategory;
  framework: string;
  criterion?: string;
  selector?: string;
  recommendation: string;
  effortLevel: EffortLevel;
  impact: number;
  codeSnippet?: string;
  fixSnippet?: string;
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 0, MAJOR: 1, MINOR: 2, SUGGESTION: 3,
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: '#ef4444', MAJOR: '#f97316', MINOR: '#eab308', SUGGESTION: '#3b82f6',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  CRITICAL: 'Critique', MAJOR: 'Majeur', MINOR: 'Mineur', SUGGESTION: 'Suggestion',
};

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  ACCESSIBILITY: 'Accessibilite',
  PERFORMANCE: 'Performance',
  DESIGN_CONSISTENCY: 'Design & Coherence',
  FORMS: 'Formulaires',
  CONTENT: 'Contenu & Lisibilite',
  SEO: 'SEO Technique',
  NAVIGATION: 'Navigation & IA',
  DARK_PATTERNS: 'Dark Patterns',
};

export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  ACCESSIBILITY: 'Eye',
  PERFORMANCE: 'Zap',
  DESIGN_CONSISTENCY: 'Palette',
  FORMS: 'FormInput',
  CONTENT: 'FileText',
  SEO: 'Search',
  NAVIGATION: 'Compass',
  DARK_PATTERNS: 'ShieldAlert',
};

export const CATEGORY_WEIGHTS: Record<IssueCategory, number> = {
  ACCESSIBILITY: 0.20,
  PERFORMANCE: 0.20,
  DESIGN_CONSISTENCY: 0.12,
  FORMS: 0.08,
  CONTENT: 0.10,
  SEO: 0.15,
  NAVIGATION: 0.10,
  DARK_PATTERNS: 0.05,
};

export const STATUS_CONFIG: Record<AuditStatus, { label: string; color: string; icon: string }> = {
  QUEUED: { label: 'En attente', color: 'bg-slate-500', icon: 'Clock' },
  CRAWLING: { label: 'Crawling', color: 'bg-blue-500', icon: 'Globe' },
  SCANNING: { label: 'Scan', color: 'bg-blue-500', icon: 'ScanSearch' },
  ANALYZING: { label: 'Analyse', color: 'bg-purple-500', icon: 'Brain' },
  GENERATING_REPORT: { label: 'Rapport', color: 'bg-purple-500', icon: 'FileText' },
  COMPLETED: { label: 'Termine', color: 'bg-green-500', icon: 'CheckCircle' },
  FAILED: { label: 'Echoue', color: 'bg-red-500', icon: 'XCircle' },
  CANCELLED: { label: 'Annule', color: 'bg-gray-500', icon: 'Ban' },
};
