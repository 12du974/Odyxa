import type { AnalyzerInput, AnalyzerIssue, AnalyzerOutput, IssueCategory } from '@/types';
import { analyzeAccessibility } from './accessibility';
import { analyzePerformance } from './performance';
import { analyzeDesignConsistency } from './design';
import { analyzeForms } from './forms';
import { analyzeContent } from './content';
import { analyzeSEO } from './seo';
import { analyzeNavigation } from './navigation';
import { analyzeDarkPatterns } from './dark-patterns';

export interface AnalysisResult {
  scores: Record<IssueCategory, number>;
  allIssues: AnalyzerIssue[];
  metadata: Record<string, unknown>;
}

interface AnalyzerEntry {
  name: string;
  category: IssueCategory;
  fn: (input: AnalyzerInput) => Promise<AnalyzerOutput>;
}

const ANALYZERS: AnalyzerEntry[] = [
  { name: 'Accessibilité', category: 'ACCESSIBILITY', fn: analyzeAccessibility },
  { name: 'Performance', category: 'PERFORMANCE', fn: analyzePerformance },
  { name: 'Design & Cohérence', category: 'DESIGN_CONSISTENCY', fn: analyzeDesignConsistency },
  { name: 'Formulaires', category: 'FORMS', fn: analyzeForms },
  { name: 'Contenu', category: 'CONTENT', fn: analyzeContent },
  { name: 'SEO Technique', category: 'SEO', fn: analyzeSEO },
  { name: 'Navigation', category: 'NAVIGATION', fn: analyzeNavigation },
  { name: 'Dark Patterns', category: 'DARK_PATTERNS', fn: analyzeDarkPatterns },
];

export async function runAllAnalyzers(
  input: AnalyzerInput,
  onLog: (msg: string) => void,
): Promise<AnalysisResult> {
  const scores = {} as Record<IssueCategory, number>;
  const allIssues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  for (let i = 0; i < ANALYZERS.length; i++) {
    const { name, category, fn } = ANALYZERS[i];
    onLog(`[${i + 1}/${ANALYZERS.length}] Analyse : ${name}...`);

    try {
      const result = await fn(input);
      scores[category] = result.score;
      allIssues.push(...result.issues);
      metadata[category] = result.metadata;
      onLog(`[${i + 1}/${ANALYZERS.length}] ${name} terminé — score : ${result.score}/100 (${result.issues.length} problème(s))`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      onLog(`[${i + 1}/${ANALYZERS.length}] Erreur lors de l'analyse ${name} : ${message}`);
      scores[category] = 0;
      metadata[category] = { error: message };
    }
  }

  return { scores, allIssues, metadata };
}

export {
  analyzeAccessibility,
  analyzePerformance,
  analyzeDesignConsistency,
  analyzeForms,
  analyzeContent,
  analyzeSEO,
  analyzeNavigation,
  analyzeDarkPatterns,
};
