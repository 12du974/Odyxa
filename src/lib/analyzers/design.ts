import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = 'Design System Consistency';
const CATEGORY = 'DESIGN_CONSISTENCY' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

function extractUniqueValues(html: string, pattern: RegExp): string[] {
  const values = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    values.add(match[1].trim().toLowerCase());
  }
  return [...values];
}

export async function analyzeDesignConsistency(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Extract font families ---
  const fontFamilyPattern = /font-family\s*:\s*([^;}"']+)/gi;
  const fontFamilies = extractUniqueValues(html, fontFamilyPattern);
  metadata.fontFamilies = fontFamilies;
  metadata.fontFamilyCount = fontFamilies.length;

  if (fontFamilies.length > 4) {
    issues.push({
      title: 'Trop de familles de polices',
      description: `${fontFamilies.length} familles de polices différentes détectées. Une cohérence visuelle nécessite de limiter le nombre de polices.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Limitez l'utilisation à 2-3 familles de polices maximum (une pour les titres, une pour le corps de texte).`,
      effortLevel: 'MEDIUM',
      impact: 5,
    });
  }

  // --- Extract font sizes ---
  const fontSizePattern = /font-size\s*:\s*([^;}"']+)/gi;
  const fontSizes = extractUniqueValues(html, fontSizePattern);
  metadata.fontSizes = fontSizes;
  metadata.fontSizeCount = fontSizes.length;

  if (fontSizes.length > 10) {
    issues.push({
      title: 'Trop de tailles de police différentes',
      description: `${fontSizes.length} tailles de police distinctes détectées. Cela indique un manque d'échelle typographique cohérente.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Définissez une échelle typographique modulaire avec 5 à 8 tailles et utilisez des variables CSS pour les appliquer.`,
      effortLevel: 'MEDIUM',
      impact: 4,
    });
  }

  // --- Extract colors ---
  const colorPatterns = [
    /(?:color|background-color|background|border-color|border)\s*:\s*(#[0-9a-fA-F]{3,8})\b/gi,
    /(?:color|background-color|background|border-color|border)\s*:\s*(rgb\([^)]+\))/gi,
    /(?:color|background-color|background|border-color|border)\s*:\s*(rgba\([^)]+\))/gi,
    /(?:color|background-color|background|border-color|border)\s*:\s*(hsl\([^)]+\))/gi,
  ];
  const allColors = new Set<string>();
  for (const pattern of colorPatterns) {
    let colorMatch: RegExpExecArray | null;
    while ((colorMatch = pattern.exec(html)) !== null) {
      allColors.add(colorMatch[1].toLowerCase().replace(/\s+/g, ''));
    }
  }
  metadata.uniqueColors = [...allColors];
  metadata.colorCount = allColors.size;

  if (allColors.size > 20) {
    issues.push({
      title: 'Palette de couleurs incohérente',
      description: `${allColors.size} couleurs uniques détectées. Une palette trop large nuit à la cohérence visuelle et à la maintenance.`,
      severity: allColors.size > 30 ? 'MAJOR' : 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Définissez une palette de 8 à 12 couleurs de base et utilisez des variables CSS (custom properties) pour les centraliser.`,
      effortLevel: 'LONG_TERM',
      impact: allColors.size > 30 ? 7 : 5,
    });
  }

  // --- Spacing grid consistency ---
  const marginPattern = /margin(?:-(?:top|right|bottom|left))?\s*:\s*([^;}"']+)/gi;
  const paddingPattern = /padding(?:-(?:top|right|bottom|left))?\s*:\s*([^;}"']+)/gi;
  const spacingValues = new Set<string>();
  for (const pattern of [marginPattern, paddingPattern]) {
    let sMatch: RegExpExecArray | null;
    while ((sMatch = pattern.exec(html)) !== null) {
      const values = sMatch[1].trim().toLowerCase().split(/\s+/);
      for (const v of values) {
        if (/^\d/.test(v)) spacingValues.add(v);
      }
    }
  }
  metadata.uniqueSpacingValues = spacingValues.size;

  if (spacingValues.size > 15) {
    issues.push({
      title: 'Grille d\'espacement incohérente',
      description: `${spacingValues.size} valeurs d'espacement uniques détectées. Cela suggère l'absence d'un système d'espacement structuré.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Adoptez une grille d'espacement basée sur un multiple (4px ou 8px) et utilisez des variables CSS pour chaque palier.`,
      effortLevel: 'LONG_TERM',
      impact: 4,
    });
  }

  // --- Border-radius consistency ---
  const borderRadiusPattern = /border-radius\s*:\s*([^;}"']+)/gi;
  const borderRadii = extractUniqueValues(html, borderRadiusPattern);
  metadata.borderRadiusValues = borderRadii;
  metadata.borderRadiusCount = borderRadii.length;

  if (borderRadii.length > 6) {
    issues.push({
      title: 'Valeurs de border-radius incohérentes',
      description: `${borderRadii.length} valeurs de border-radius différentes détectées. Standardisez les arrondis pour une interface homogène.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Définissez 3-4 niveaux de border-radius (sm, md, lg, full) dans des variables CSS et réutilisez-les.`,
      effortLevel: 'MEDIUM',
      impact: 2,
    });
  }

  // --- Box-shadow consistency ---
  const boxShadowPattern = /box-shadow\s*:\s*([^;}"']+)/gi;
  const boxShadows = extractUniqueValues(html, boxShadowPattern);
  metadata.boxShadowValues = boxShadows;
  metadata.boxShadowCount = boxShadows.length;

  if (boxShadows.length > 5) {
    issues.push({
      title: 'Ombres (box-shadow) incohérentes',
      description: `${boxShadows.length} valeurs de box-shadow différentes détectées. Trop de variations d'ombres crée une impression de désordre.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Créez 3-4 niveaux d'élévation (elevation-1, elevation-2, etc.) avec des ombres standardisées.`,
      effortLevel: 'MEDIUM',
      impact: 2,
    });
  }

  // --- CSS custom properties usage ---
  const cssVarDeclarations = html.match(/--[a-zA-Z][a-zA-Z0-9-]*\s*:/g) || [];
  const cssVarUsages = html.match(/var\(--[^)]+\)/g) || [];
  metadata.cssVariableDeclarations = cssVarDeclarations.length;
  metadata.cssVariableUsages = cssVarUsages.length;

  if (cssVarDeclarations.length === 0 && allColors.size > 5) {
    issues.push({
      title: 'Variables CSS non utilisées',
      description: `Aucune variable CSS (custom property) n'a été détectée dans le code. Les valeurs sont codées en dur, rendant la maintenance difficile.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Utilisez des variables CSS (:root { --color-primary: #xxx; }) pour centraliser les tokens de design.`,
      effortLevel: 'LONG_TERM',
      impact: 3,
      fixSnippet: `:root {\n  --color-primary: #3b82f6;\n  --color-secondary: #6366f1;\n  --font-size-base: 1rem;\n  --spacing-md: 1rem;\n}`,
    });
  }

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
