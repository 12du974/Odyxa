import { CATEGORY_WEIGHTS, type IssueCategory } from '@/types';

export interface ScoreBreakdown {
  global: number;
  categories: Record<IssueCategory, number>;
}

export function computeGlobalScore(categoryScores: Record<IssueCategory, number>): ScoreBreakdown {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const score = categoryScores[category as IssueCategory];
    if (score !== undefined && score !== null) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  return {
    global: totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0,
    categories: categoryScores,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#5B3FD6';
  if (score >= 75) return '#79AAE4';
  if (score >= 50) return '#E78059';
  if (score >= 25) return '#f97316';
  return '#ef4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Bon';
  if (score >= 50) return 'Moyen';
  if (score >= 25) return 'Faible';
  return 'Critique';
}
