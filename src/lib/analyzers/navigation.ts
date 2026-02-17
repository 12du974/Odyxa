import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = "Architecture de l'Information";
const CATEGORY = 'NAVIGATION' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export async function analyzeNavigation(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html, url } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Check for <nav> element ---
  const navElements = html.match(/<nav\b[^>]*>/gi) || [];
  metadata.navElementCount = navElements.length;

  if (navElements.length === 0) {
    issues.push({
      title: 'Élément <nav> absent',
      description: `Aucun élément <nav> n'a été trouvé. La navigation principale devrait être sémantiquement identifiée.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Encadrez votre menu de navigation principal dans une balise <nav aria-label="Navigation principale">.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
      fixSnippet: '<nav aria-label="Navigation principale">\n  <!-- liens de navigation -->\n</nav>',
    });
  }

  // --- Internal link count ---
  const linkRegex = /<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let linkMatch: RegExpExecArray | null;
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  let hashOnlyCount = 0;
  const allLinks: string[] = [];

  let parsedOrigin = '';
  try {
    parsedOrigin = new URL(url).origin;
  } catch {
    // Fallback if URL parsing fails
  }

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1].trim();
    allLinks.push(href);

    if (href === '#' || href === '') {
      hashOnlyCount++;
    } else if (href.startsWith('/') || href.startsWith(parsedOrigin) || (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:'))) {
      internalLinkCount++;
    } else if (href.startsWith('http')) {
      externalLinkCount++;
    }
  }
  metadata.internalLinkCount = internalLinkCount;
  metadata.externalLinkCount = externalLinkCount;
  metadata.hashOnlyLinks = hashOnlyCount;
  metadata.totalLinks = allLinks.length;

  if (internalLinkCount === 0 && allLinks.length > 0) {
    issues.push({
      title: 'Aucun lien interne détecté',
      description: `La page ne contient aucun lien interne. Le maillage interne est essentiel pour la navigation et le référencement.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez des liens vers les pages principales du site pour faciliter la navigation et le crawl des moteurs de recherche.`,
      effortLevel: 'MEDIUM',
      impact: 6,
    });
  } else if (internalLinkCount > 0 && internalLinkCount < 3) {
    issues.push({
      title: 'Très peu de liens internes',
      description: `Seulement ${internalLinkCount} lien(s) interne(s) détecté(s). Un maillage interne plus dense améliore la navigation et le SEO.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Enrichissez le maillage interne en ajoutant des liens contextuels vers d'autres pages pertinentes du site.`,
      effortLevel: 'MEDIUM',
      impact: 3,
    });
  }

  // --- Broken links (href="#" only) ---
  if (hashOnlyCount > 0) {
    issues.push({
      title: 'Liens avec href="#" détectés',
      description: `${hashOnlyCount} lien(s) pointent vers "#" uniquement. Ces liens ne mènent nulle part et frustrent l'utilisateur.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Remplacez les href="#" par de véritables destinations ou utilisez un <button> si c'est une action JavaScript.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
    });
  }

  // --- Breadcrumbs ---
  const hasBreadcrumbs =
    /<nav\b[^>]*aria-label\s*=\s*["'][^"']*breadcrumb[^"']*["']/i.test(html) ||
    /<[^>]*class\s*=\s*["'][^"']*breadcrumb[^"']*["']/i.test(html) ||
    /itemtype\s*=\s*["'][^"']*BreadcrumbList["']/i.test(html);
  metadata.hasBreadcrumbs = hasBreadcrumbs;

  if (!hasBreadcrumbs) {
    issues.push({
      title: 'Fil d\'Ariane (breadcrumbs) absent',
      description: `Aucun fil d'Ariane n'a été détecté. Ce composant aide l'utilisateur à se situer dans l'arborescence du site.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez un fil d'Ariane avec la balise <nav aria-label="Fil d'Ariane"> et des données structurées BreadcrumbList.`,
      effortLevel: 'MEDIUM',
      impact: 3,
    });
  }

  // --- Footer links ---
  const footerMatch = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i);
  const hasFooter = !!footerMatch;
  const footerLinks = footerMatch ? (footerMatch[1].match(/<a\b/gi) || []).length : 0;
  metadata.hasFooter = hasFooter;
  metadata.footerLinkCount = footerLinks;

  if (!hasFooter) {
    issues.push({
      title: 'Élément <footer> absent',
      description: `Aucun élément <footer> n'a été trouvé. Le pied de page est un repère de navigation important contenant les informations légales et liens utiles.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez un <footer> contenant les liens importants (mentions légales, contact, plan du site, réseaux sociaux).`,
      effortLevel: 'MEDIUM',
      impact: 3,
    });
  } else if (footerLinks === 0) {
    issues.push({
      title: 'Footer sans liens',
      description: `Le <footer> existe mais ne contient aucun lien. Un footer devrait proposer des liens utiles pour la navigation secondaire.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez des liens dans le footer : mentions légales, politique de confidentialité, contact, plan du site.`,
      effortLevel: 'QUICK_WIN',
      impact: 2,
    });
  }

  // --- Search input ---
  const hasSearchInput =
    /<input\b[^>]*type\s*=\s*["']search["'][^>]*>/i.test(html) ||
    /<form\b[^>]*role\s*=\s*["']search["'][^>]*>/i.test(html) ||
    /<[^>]*class\s*=\s*["'][^"']*search[^"']*["'][^>]*>[\s\S]*?<input\b/i.test(html);
  metadata.hasSearchInput = hasSearchInput;

  if (!hasSearchInput) {
    issues.push({
      title: 'Fonction de recherche absente',
      description: `Aucun champ de recherche n'a été détecté. La recherche interne est un élément clé de la navigation sur les sites riches en contenu.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez un champ de recherche accessible avec <input type="search"> dans un <form role="search">.`,
      effortLevel: 'MEDIUM',
      impact: 2,
    });
  }

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
