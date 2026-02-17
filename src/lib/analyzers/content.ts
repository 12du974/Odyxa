import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const CATEGORY = 'CONTENT' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function analyzeContent(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Empty headings ---
  const headingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let headingMatch: RegExpExecArray | null;
  let emptyHeadingCount = 0;
  let totalHeadings = 0;

  while ((headingMatch = headingRegex.exec(html)) !== null) {
    totalHeadings++;
    const text = stripTags(headingMatch[2]);
    if (text.length === 0) {
      emptyHeadingCount++;
    }
  }
  metadata.totalHeadings = totalHeadings;
  metadata.emptyHeadings = emptyHeadingCount;

  if (emptyHeadingCount > 0) {
    issues.push({
      title: 'Titres vides détectés',
      description: `${emptyHeadingCount} titre(s) ne contiennent aucun texte. Cela crée du bruit pour les lecteurs d'écran et nuit à la structure.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: 'WCAG 2.2',
      criterion: '1.3.1 Info and Relationships',
      recommendation: `Supprimez les titres vides ou ajoutez-y un contenu textuel pertinent.`,
      effortLevel: 'QUICK_WIN',
      impact: 4,
    });
  }

  // --- Long paragraphs >500 chars ---
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch: RegExpExecArray | null;
  let longParaCount = 0;
  let totalParagraphs = 0;

  while ((pMatch = pRegex.exec(html)) !== null) {
    totalParagraphs++;
    const text = stripTags(pMatch[1]);
    if (text.length > 500) {
      longParaCount++;
    }
  }
  metadata.totalParagraphs = totalParagraphs;
  metadata.longParagraphs = longParaCount;

  if (longParaCount > 0) {
    issues.push({
      title: 'Paragraphes trop longs',
      description: `${longParaCount} paragraphe(s) dépassent 500 caractères. Les blocs de texte trop denses découragent la lecture.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: 'Standards de Contenu',
      recommendation: `Découpez les paragraphes longs en blocs de 2-3 phrases. Utilisez des listes ou des sous-titres pour aérer le contenu.`,
      effortLevel: 'MEDIUM',
      impact: 4,
    });
  }

  // --- Meta description ---
  const metaDescMatch = html.match(/<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
  const metaDesc = metaDescMatch?.[1]?.trim() ?? null;
  metadata.metaDescription = metaDesc;
  metadata.metaDescriptionLength = metaDesc?.length ?? 0;

  if (!metaDesc) {
    issues.push({
      title: 'Meta description manquante',
      description: `Aucune balise <meta name="description"> n'a été trouvée. Les moteurs de recherche afficheront un extrait automatique souvent peu pertinent.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: 'Standards de Contenu',
      recommendation: `Ajoutez une meta description de 120 à 160 caractères résumant le contenu de la page.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
      fixSnippet: '<meta name="description" content="Description concise de la page en 120-160 caractères.">',
    });
  } else if (metaDesc.length < 70) {
    issues.push({
      title: 'Meta description trop courte',
      description: `La meta description ne contient que ${metaDesc.length} caractères. Elle devrait faire entre 120 et 160 caractères pour être optimale.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: 'Standards de Contenu',
      recommendation: `Enrichissez la meta description pour atteindre 120-160 caractères et inclure les mots-clés pertinents.`,
      effortLevel: 'QUICK_WIN',
      impact: 3,
    });
  } else if (metaDesc.length > 160) {
    issues.push({
      title: 'Meta description trop longue',
      description: `La meta description contient ${metaDesc.length} caractères. Au-delà de 160 caractères, elle sera tronquée dans les résultats de recherche.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: 'Standards de Contenu',
      recommendation: `Raccourcissez la meta description à 160 caractères maximum en gardant l'essentiel du message.`,
      effortLevel: 'QUICK_WIN',
      impact: 2,
    });
  }

  // --- Bad link texts ---
  const linkRegex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch: RegExpExecArray | null;
  const badLinkTexts = [
    'cliquez ici', 'cliquer ici', 'click here', 'ici', 'lire la suite',
    'en savoir plus', 'plus', 'lien', 'link', 'voir plus',
  ];
  let badLinkCount = 0;
  let totalLinks = 0;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    totalLinks++;
    const text = stripTags(linkMatch[1]).toLowerCase();
    if (badLinkTexts.includes(text)) {
      badLinkCount++;
    }
  }
  metadata.totalLinks = totalLinks;
  metadata.badLinkTextCount = badLinkCount;

  if (badLinkCount > 0) {
    issues.push({
      title: 'Textes de liens non descriptifs',
      description: `${badLinkCount} lien(s) utilisent des textes génériques comme "cliquez ici" ou "en savoir plus". Ces textes ne sont pas descriptifs hors contexte.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: 'WCAG 2.2',
      criterion: '2.4.4 Link Purpose (In Context)',
      recommendation: `Remplacez les textes de liens génériques par des libellés décrivant la destination, par exemple "Consulter notre politique de confidentialité".`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
    });
  }

  // --- Long sentences ---
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const bodyText = bodyMatch ? stripTags(bodyMatch[1]) : stripTags(html);
  const sentences = bodyText.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const wordCounts = sentences.map((s) => s.trim().split(/\s+/).length);
  const avgWords = wordCounts.length > 0
    ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
    : 0;
  metadata.sentenceCount = sentences.length;
  metadata.avgWordsPerSentence = Math.round(avgWords * 10) / 10;

  if (avgWords > 25 && sentences.length > 3) {
    issues.push({
      title: 'Phrases trop longues en moyenne',
      description: `La longueur moyenne des phrases est de ${Math.round(avgWords)} mots. Des phrases plus courtes améliorent la lisibilité.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: 'Standards de Contenu',
      recommendation: `Visez une moyenne de 15 à 20 mots par phrase. Découpez les phrases complexes en phrases plus simples.`,
      effortLevel: 'MEDIUM',
      impact: 3,
    });
  }

  // --- Text density ratio ---
  const totalTextLength = bodyText.length;
  const totalHtmlLength = html.length;
  const textDensity = totalHtmlLength > 0 ? (totalTextLength / totalHtmlLength) * 100 : 0;
  metadata.textDensityPercent = Math.round(textDensity * 10) / 10;

  if (textDensity < 10 && totalHtmlLength > 1000) {
    issues.push({
      title: 'Faible densité de texte',
      description: `Le ratio texte/HTML est de ${Math.round(textDensity)}%. Un ratio très faible indique un excès de balisage ou un manque de contenu textuel.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: 'Standards de Contenu',
      recommendation: `Augmentez la quantité de contenu textuel ou réduisez le balisage superflu pour améliorer la densité de texte.`,
      effortLevel: 'LONG_TERM',
      impact: 2,
    });
  }

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
