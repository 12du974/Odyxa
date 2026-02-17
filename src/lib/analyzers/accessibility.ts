import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = 'WCAG 2.2';
const CATEGORY = 'ACCESSIBILITY' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export async function analyzeAccessibility(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Images without alt attribute ---
  const imgRegex = /<img\b[^>]*>/gi;
  const imgs = html.match(imgRegex) || [];
  const imgsWithoutAlt = imgs.filter((tag) => !/\balt\s*=/i.test(tag));
  metadata.totalImages = imgs.length;
  metadata.imagesWithoutAlt = imgsWithoutAlt.length;

  for (const tag of imgsWithoutAlt) {
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']*)/i);
    issues.push({
      title: 'Image sans attribut alt',
      description: `Une balise <img> ne possède pas d'attribut alt, ce qui empêche les lecteurs d'écran de décrire l'image.`,
      severity: 'MAJOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.1.1 Non-text Content',
      selector: srcMatch ? `img[src="${srcMatch[1]}"]` : 'img',
      recommendation: `Ajoutez un attribut alt descriptif à cette image. Utilisez alt="" si l'image est purement décorative.`,
      effortLevel: 'QUICK_WIN',
      impact: 7,
      codeSnippet: tag.slice(0, 120),
      fixSnippet: tag.replace(/<img/i, '<img alt="Description de l\'image"'),
    });
  }

  // --- Form inputs without labels ---
  const inputRegex = /<input\b[^>]*>/gi;
  const inputs = html.match(inputRegex) || [];
  const inputsNeedingLabels = inputs.filter((tag) => {
    if (/\btype\s*=\s*["'](hidden|submit|button|reset|image)["']/i.test(tag)) return false;
    const idMatch = tag.match(/\bid\s*=\s*["']([^"']+)["']/i);
    if (idMatch) {
      const labelForRegex = new RegExp(`<label[^>]*\\bfor\\s*=\\s*["']${idMatch[1]}["']`, 'i');
      if (labelForRegex.test(html)) return false;
    }
    if (/\baria-label\s*=/i.test(tag) || /\baria-labelledby\s*=/i.test(tag)) return false;
    if (/\btitle\s*=/i.test(tag)) return false;
    return true;
  });
  metadata.totalInputs = inputs.length;
  metadata.inputsWithoutLabels = inputsNeedingLabels.length;

  for (const tag of inputsNeedingLabels) {
    const idMatch = tag.match(/\bid\s*=\s*["']([^"']+)["']/i);
    issues.push({
      title: 'Champ de formulaire sans label',
      description: `Un champ de saisie n'est associé à aucun label, ce qui le rend inaccessible aux technologies d'assistance.`,
      severity: 'MAJOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.3.1 Info and Relationships',
      selector: idMatch ? `#${idMatch[1]}` : 'input',
      recommendation: `Associez un <label for="id"> au champ ou ajoutez un attribut aria-label.`,
      effortLevel: 'QUICK_WIN',
      impact: 8,
      codeSnippet: tag.slice(0, 120),
    });
  }

  // --- Missing lang attribute on <html> ---
  const htmlTagMatch = html.match(/<html\b[^>]*>/i);
  const hasLang = htmlTagMatch ? /\blang\s*=\s*["'][^"']+["']/i.test(htmlTagMatch[0]) : false;
  metadata.hasLangAttribute = hasLang;

  if (!hasLang) {
    issues.push({
      title: 'Attribut lang manquant sur <html>',
      description: `La balise <html> ne possède pas d'attribut lang, ce qui empêche les lecteurs d'écran de déterminer la langue du contenu.`,
      severity: 'MAJOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '3.1.1 Language of Page',
      selector: 'html',
      recommendation: `Ajoutez l'attribut lang à la balise <html>, par exemple lang="fr" pour du contenu en français.`,
      effortLevel: 'QUICK_WIN',
      impact: 8,
      codeSnippet: htmlTagMatch?.[0] ?? '<html>',
      fixSnippet: '<html lang="fr">',
    });
  }

  // --- Heading hierarchy ---
  const headingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings: { level: number; text: string }[] = [];
  let headingMatch: RegExpExecArray | null;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    const level = parseInt(headingMatch[1][1], 10);
    const text = headingMatch[2].replace(/<[^>]+>/g, '').trim();
    headings.push({ level, text });
  }
  const h1Count = headings.filter((h) => h.level === 1).length;
  metadata.headingCount = headings.length;
  metadata.h1Count = h1Count;

  if (h1Count === 0) {
    issues.push({
      title: 'Aucun titre H1 trouvé',
      description: `La page ne contient aucun titre <h1>, ce qui nuit à la structure sémantique et à l'accessibilité.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.3.1 Info and Relationships',
      recommendation: `Ajoutez un titre <h1> unique décrivant le contenu principal de la page.`,
      effortLevel: 'QUICK_WIN',
      impact: 6,
    });
  } else if (h1Count > 1) {
    issues.push({
      title: 'Plusieurs titres H1 détectés',
      description: `La page contient ${h1Count} titres <h1>. Il est recommandé de n'en avoir qu'un seul pour une hiérarchie claire.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.3.1 Info and Relationships',
      recommendation: `Conservez un seul <h1> et rétrogradez les autres en <h2> ou niveaux appropriés.`,
      effortLevel: 'MEDIUM',
      impact: 4,
    });
  }

  // Check skipped heading levels
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      issues.push({
        title: 'Niveau de titre sauté',
        description: `Le titre "${headings[i].text.slice(0, 50)}" (h${headings[i].level}) suit un h${headings[i - 1].level}, ce qui crée un saut dans la hiérarchie.`,
        severity: 'MINOR',
        category: CATEGORY,
        framework: FRAMEWORK,
        criterion: '1.3.1 Info and Relationships',
        recommendation: `Respectez l'ordre hiérarchique des titres sans sauter de niveaux (h1 > h2 > h3, etc.).`,
        effortLevel: 'QUICK_WIN',
        impact: 3,
      });
      break; // Report once
    }
  }

  // --- Skip navigation link ---
  const hasSkipNav = /<a\b[^>]*href\s*=\s*["']#(main|content|maincontent|skip)[^"']*["'][^>]*>/i.test(html);
  metadata.hasSkipNavigation = hasSkipNav;

  if (!hasSkipNav) {
    issues.push({
      title: 'Lien d\'évitement manquant',
      description: `Aucun lien "aller au contenu principal" n'a été détecté. Les utilisateurs au clavier doivent tabuler à travers toute la navigation.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '2.4.1 Bypass Blocks',
      recommendation: `Ajoutez un lien d'évitement en début de page : <a href="#main" class="sr-only focus:not-sr-only">Aller au contenu</a>.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
    });
  }

  // --- ARIA landmarks ---
  const hasMainLandmark = /<main\b/i.test(html) || /role\s*=\s*["']main["']/i.test(html);
  const hasNavLandmark = /<nav\b/i.test(html) || /role\s*=\s*["']navigation["']/i.test(html);
  metadata.hasMainLandmark = hasMainLandmark;
  metadata.hasNavLandmark = hasNavLandmark;

  if (!hasMainLandmark) {
    issues.push({
      title: 'Landmark <main> absent',
      description: `Aucun élément <main> ou rôle ARIA "main" n'a été trouvé. Les lecteurs d'écran ne peuvent pas identifier le contenu principal.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.3.1 Info and Relationships',
      recommendation: `Encapsulez le contenu principal dans une balise <main> pour faciliter la navigation assistée.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
    });
  }

  if (!hasNavLandmark) {
    issues.push({
      title: 'Landmark <nav> absent',
      description: `Aucun élément <nav> n'a été détecté. La navigation principale devrait être balisée sémantiquement.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.3.1 Info and Relationships',
      recommendation: `Utilisez la balise <nav> pour encadrer les menus de navigation principaux et secondaires.`,
      effortLevel: 'QUICK_WIN',
      impact: 3,
    });
  }

  // --- Small text under 12px ---
  const fontSizeRegex = /font-size\s*:\s*(\d+(?:\.\d+)?)\s*px/gi;
  let fsMatch: RegExpExecArray | null;
  let smallTextCount = 0;
  while ((fsMatch = fontSizeRegex.exec(html)) !== null) {
    if (parseFloat(fsMatch[1]) < 12) {
      smallTextCount++;
    }
  }
  metadata.smallTextInstances = smallTextCount;

  if (smallTextCount > 0) {
    issues.push({
      title: 'Texte trop petit détecté',
      description: `${smallTextCount} occurrence(s) de texte inférieur à 12px ont été détectées. Cela peut poser des problèmes de lisibilité.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      criterion: '1.4.4 Resize Text',
      recommendation: `Utilisez une taille de police minimale de 12px (idéalement 14-16px) pour garantir la lisibilité sur tous les supports.`,
      effortLevel: 'QUICK_WIN',
      impact: 4,
    });
  }

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
