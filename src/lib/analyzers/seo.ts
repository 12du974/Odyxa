import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = 'SEO Technique';
const CATEGORY = 'SEO' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export async function analyzeSEO(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html, url } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Check HTTPS ---
  const isHttps = url.startsWith('https://');
  metadata.isHttps = isHttps;

  if (!isHttps) {
    issues.push({
      title: 'Site non sécurisé (HTTP)',
      description: `L'URL utilise HTTP au lieu de HTTPS. Les navigateurs modernes marquent ce site comme "non sécurisé" et Google pénalise le référencement.`,
      severity: 'CRITICAL',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Migrez vers HTTPS en installant un certificat SSL/TLS. Redirigez tout le trafic HTTP vers HTTPS.`,
      effortLevel: 'MEDIUM',
      impact: 10,
    });
  }

  // --- Check title tag ---
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? null;
  metadata.title = titleText;
  metadata.titleLength = titleText?.length ?? 0;

  if (!titleText) {
    issues.push({
      title: 'Balise <title> manquante',
      description: `La page ne possède pas de balise <title>. C'est l'élément le plus important pour le référencement et l'affichage dans les SERP.`,
      severity: 'CRITICAL',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez une balise <title> unique et descriptive dans le <head> de la page.`,
      effortLevel: 'QUICK_WIN',
      impact: 10,
      fixSnippet: '<title>Titre descriptif de votre page - Nom du site</title>',
    });
  } else {
    // --- Title length ---
    if (titleText.length < 30) {
      issues.push({
        title: 'Titre trop court',
        description: `Le titre ne contient que ${titleText.length} caractères. Un titre trop court manque de mots-clés et de contexte.`,
        severity: 'MINOR',
        category: CATEGORY,
        framework: FRAMEWORK,
        recommendation: `Enrichissez le titre pour atteindre 50-60 caractères en incluant vos mots-clés principaux.`,
        effortLevel: 'QUICK_WIN',
        impact: 5,
      });
    } else if (titleText.length > 60) {
      issues.push({
        title: 'Titre trop long',
        description: `Le titre contient ${titleText.length} caractères. Au-delà de 60 caractères, il sera tronqué dans les résultats de recherche.`,
        severity: 'MINOR',
        category: CATEGORY,
        framework: FRAMEWORK,
        recommendation: `Raccourcissez le titre à 60 caractères maximum en gardant les mots-clés en début de titre.`,
        effortLevel: 'QUICK_WIN',
        impact: 4,
      });
    }
  }

  // --- Meta description ---
  const metaDescMatch = html.match(/<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
  const metaDesc = metaDescMatch?.[1]?.trim() ?? null;
  metadata.metaDescription = metaDesc;

  if (!metaDesc) {
    issues.push({
      title: 'Meta description absente',
      description: `Aucune meta description n'a été trouvée. Google utilisera un extrait automatique qui peut ne pas refléter votre message.`,
      severity: 'MAJOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez une meta description de 120-160 caractères incluant un appel à l'action et les mots-clés principaux.`,
      effortLevel: 'QUICK_WIN',
      impact: 7,
    });
  }

  // --- Open Graph tags ---
  const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
  const missingOg: string[] = [];
  for (const tag of ogTags) {
    const regex = new RegExp(`<meta\\b[^>]*property\\s*=\\s*["']${tag}["'][^>]*>`, 'i');
    if (!regex.test(html)) {
      missingOg.push(tag);
    }
  }
  metadata.missingOpenGraph = missingOg;

  if (missingOg.length > 0) {
    issues.push({
      title: 'Balises Open Graph incomplètes',
      description: `${missingOg.length} balise(s) Open Graph manquante(s) : ${missingOg.join(', ')}. Le partage sur les réseaux sociaux sera dégradé.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez les balises Open Graph manquantes pour contrôler l'apparence lors du partage social.`,
      effortLevel: 'QUICK_WIN',
      impact: 4,
      fixSnippet: missingOg.map((t) => `<meta property="${t}" content="...">`).join('\n'),
    });
  }

  // --- Twitter Cards ---
  const hasTwitterCard = /<meta\b[^>]*name\s*=\s*["']twitter:card["'][^>]*>/i.test(html);
  metadata.hasTwitterCard = hasTwitterCard;

  if (!hasTwitterCard) {
    issues.push({
      title: 'Twitter Card manquante',
      description: `Aucune balise Twitter Card n'a été détectée. Le partage sur X (Twitter) ne sera pas optimisé.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez <meta name="twitter:card" content="summary_large_image"> et les balises twitter:title, twitter:description, twitter:image.`,
      effortLevel: 'QUICK_WIN',
      impact: 2,
      fixSnippet: '<meta name="twitter:card" content="summary_large_image">',
    });
  }

  // --- Canonical URL ---
  const hasCanonical = /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i.test(html);
  metadata.hasCanonical = hasCanonical;

  if (!hasCanonical) {
    issues.push({
      title: 'URL canonique manquante',
      description: `Aucune balise <link rel="canonical"> n'a été trouvée. Cela peut entraîner des problèmes de contenu dupliqué.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez <link rel="canonical" href="URL"> dans le <head> pour indiquer la version de référence de cette page.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
      fixSnippet: `<link rel="canonical" href="${url}">`,
    });
  }

  // --- Structured data (JSON-LD) ---
  const hasJsonLd = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(html);
  const hasMicrodata = /\bitemscope\b/i.test(html);
  metadata.hasStructuredData = hasJsonLd || hasMicrodata;

  if (!hasJsonLd && !hasMicrodata) {
    issues.push({
      title: 'Données structurées absentes',
      description: `Aucune donnée structurée (JSON-LD ou Microdata) n'a été détectée. Les rich snippets dans les SERP ne seront pas activés.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez des données structurées JSON-LD (Schema.org) adaptées au type de contenu (Article, Organization, Product, etc.).`,
      effortLevel: 'MEDIUM',
      impact: 3,
    });
  }

  // --- Robots noindex ---
  const robotsMatch = html.match(/<meta\b[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i);
  const robotsContent = robotsMatch?.[1]?.toLowerCase() ?? '';
  const hasNoindex = robotsContent.includes('noindex');
  metadata.hasNoindex = hasNoindex;

  if (hasNoindex) {
    issues.push({
      title: 'Page marquée noindex',
      description: `La balise robots contient "noindex". Cette page ne sera pas indexée par les moteurs de recherche.`,
      severity: 'MAJOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Si cette page doit être référencée, supprimez "noindex" de la balise meta robots. Si c'est intentionnel, ignorez cet avertissement.`,
      effortLevel: 'QUICK_WIN',
      impact: 9,
      codeSnippet: robotsMatch?.[0],
    });
  }

  // --- Images without alt for SEO ---
  const imgRegex = /<img\b[^>]*>/gi;
  const imgs = html.match(imgRegex) || [];
  const imgsWithoutAlt = imgs.filter((tag) => !/\balt\s*=/i.test(tag));
  metadata.imagesWithoutAlt = imgsWithoutAlt.length;

  if (imgsWithoutAlt.length > 0) {
    issues.push({
      title: 'Images sans attribut alt (SEO)',
      description: `${imgsWithoutAlt.length} image(s) n'ont pas d'attribut alt. Les moteurs de recherche ne peuvent pas comprendre le contenu de ces images.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez des attributs alt descriptifs incluant des mots-clés pertinents pour améliorer le référencement images.`,
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
