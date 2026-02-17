import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = 'Core Web Vitals';
const CATEGORY = 'PERFORMANCE' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export async function analyzePerformance(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Missing meta viewport ---
  const hasViewport = /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/i.test(html);
  metadata.hasMetaViewport = hasViewport;

  if (!hasViewport) {
    issues.push({
      title: 'Balise meta viewport manquante',
      description: `La balise <meta name="viewport"> est absente. La page ne s'adaptera pas correctement aux appareils mobiles.`,
      severity: 'CRITICAL',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> dans le <head>.`,
      effortLevel: 'QUICK_WIN',
      impact: 10,
      fixSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    });
  }

  // --- Render-blocking scripts without async/defer ---
  const scriptRegex = /<script\b[^>]*src\s*=\s*["'][^"']+["'][^>]*>/gi;
  const scripts = html.match(scriptRegex) || [];
  const blockingScripts = scripts.filter((tag) => {
    if (/\basync\b/i.test(tag) || /\bdefer\b/i.test(tag)) return false;
    if (/\btype\s*=\s*["']module["']/i.test(tag)) return false;
    return true;
  });
  // Check if scripts are in <head>
  const headContent = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const headBlockingScripts = blockingScripts.filter((tag) => headContent.includes(tag));
  metadata.totalScripts = scripts.length;
  metadata.blockingScriptsInHead = headBlockingScripts.length;

  for (const tag of headBlockingScripts) {
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const isExternal = srcMatch && /^https?:\/\//i.test(srcMatch[1]);
    issues.push({
      title: 'Script bloquant le rendu',
      description: `Un script dans le <head> ne possède ni l'attribut async ni defer, ce qui bloque le rendu de la page.`,
      severity: isExternal ? 'MAJOR' : 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      selector: srcMatch ? `script[src="${srcMatch[1]}"]` : 'script',
      recommendation: `Ajoutez l'attribut defer (ou async) aux scripts dans le <head> pour éviter le blocage du rendu.`,
      effortLevel: 'QUICK_WIN',
      impact: isExternal ? 7 : 5,
      codeSnippet: tag.slice(0, 120),
      fixSnippet: tag.replace(/<script/i, '<script defer'),
    });
  }

  // --- Images without lazy loading ---
  const imgRegex = /<img\b[^>]*>/gi;
  const imgs = html.match(imgRegex) || [];
  const imgsWithoutLazy = imgs.filter((tag) => {
    if (/\bloading\s*=\s*["']lazy["']/i.test(tag)) return false;
    if (/\bloading\s*=\s*["']eager["']/i.test(tag)) return false;
    return true;
  });
  metadata.totalImages = imgs.length;
  metadata.imagesWithoutLazyLoading = imgsWithoutLazy.length;

  if (imgsWithoutLazy.length > 0) {
    issues.push({
      title: 'Images sans chargement différé',
      description: `${imgsWithoutLazy.length} image(s) n'utilisent pas l'attribut loading="lazy", ce qui ralentit le chargement initial.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez loading="lazy" aux images situées en dehors de la zone visible initiale (below the fold).`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
      codeSnippet: imgsWithoutLazy[0]?.slice(0, 120),
    });
  }

  // --- Large inline scripts >5KB ---
  const inlineScriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let inlineMatch: RegExpExecArray | null;
  let largeInlineCount = 0;
  let totalInlineSize = 0;
  while ((inlineMatch = inlineScriptRegex.exec(html)) !== null) {
    if (inlineMatch[0].match(/\bsrc\s*=/i)) continue;
    const content = inlineMatch[1].trim();
    const sizeKB = new TextEncoder().encode(content).byteLength / 1024;
    totalInlineSize += sizeKB;
    if (sizeKB > 5) largeInlineCount++;
  }
  metadata.largeInlineScripts = largeInlineCount;
  metadata.totalInlineScriptSizeKB = Math.round(totalInlineSize * 100) / 100;

  if (largeInlineCount > 0) {
    issues.push({
      title: 'Scripts inline volumineux',
      description: `${largeInlineCount} script(s) inline dépassent 5 Ko. Cela alourdit le HTML et empêche la mise en cache.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Externalisez les scripts volumineux dans des fichiers séparés pour bénéficier de la mise en cache navigateur.`,
      effortLevel: 'MEDIUM',
      impact: 4,
    });
  }

  // --- CSS file count >10 ---
  const cssLinkRegex = /<link\b[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi;
  const cssLinks = html.match(cssLinkRegex) || [];
  metadata.cssFileCount = cssLinks.length;

  if (cssLinks.length > 10) {
    issues.push({
      title: 'Trop de fichiers CSS',
      description: `${cssLinks.length} fichiers CSS sont chargés. Chaque fichier génère une requête HTTP supplémentaire.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Consolidez les fichiers CSS pour réduire le nombre de requêtes. Visez moins de 5 fichiers CSS.`,
      effortLevel: 'MEDIUM',
      impact: 4,
    });
  }

  // --- Missing modern image formats (webp/avif) ---
  const imgSrcs = imgs.map((tag) => tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? '');
  const hasOldFormats = imgSrcs.some((src) => /\.(jpg|jpeg|png|gif|bmp)(\?|$)/i.test(src));
  const hasModernFormats = imgSrcs.some((src) => /\.(webp|avif)(\?|$)/i.test(src));
  const hasPicture = /<picture\b/i.test(html);
  metadata.usesModernImageFormats = hasModernFormats || hasPicture;

  if (hasOldFormats && !hasModernFormats && !hasPicture) {
    issues.push({
      title: 'Formats d\'image modernes absents',
      description: `Aucune image au format WebP ou AVIF n'a été détectée. Ces formats offrent une meilleure compression.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Convertissez vos images en WebP ou AVIF et utilisez la balise <picture> pour un fallback gracieux.`,
      effortLevel: 'MEDIUM',
      impact: 5,
    });
  }

  // --- HTML size >100KB ---
  const htmlSizeKB = new TextEncoder().encode(html).byteLength / 1024;
  metadata.htmlSizeKB = Math.round(htmlSizeKB * 100) / 100;

  if (htmlSizeKB > 200) {
    issues.push({
      title: 'Document HTML excessivement volumineux',
      description: `Le HTML pèse ${Math.round(htmlSizeKB)} Ko, ce qui est très élevé. Cela ralentit le parsing et le premier affichage.`,
      severity: 'MAJOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Réduisez la taille du HTML en externalisant les scripts/styles inline et en supprimant le contenu redondant.`,
      effortLevel: 'LONG_TERM',
      impact: 7,
    });
  } else if (htmlSizeKB > 100) {
    issues.push({
      title: 'Document HTML volumineux',
      description: `Le HTML pèse ${Math.round(htmlSizeKB)} Ko. Au-delà de 100 Ko, le temps de parsing augmente significativement.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Optimisez la taille du HTML en minifiant et en externalisant les ressources inline.`,
      effortLevel: 'MEDIUM',
      impact: 4,
    });
  }

  // --- Missing preconnect/dns-prefetch ---
  const hasPreconnect = /<link\b[^>]*rel\s*=\s*["']preconnect["'][^>]*>/i.test(html);
  const hasDnsPrefetch = /<link\b[^>]*rel\s*=\s*["']dns-prefetch["'][^>]*>/i.test(html);
  const externalDomains = new Set<string>();
  const hrefRegex = /(?:src|href)\s*=\s*["'](https?:\/\/[^/"']+)/gi;
  let hrefMatch: RegExpExecArray | null;
  while ((hrefMatch = hrefRegex.exec(html)) !== null) {
    try {
      const domain = new URL(hrefMatch[1]).hostname;
      externalDomains.add(domain);
    } catch {
      // Ignore malformed URLs
    }
  }
  metadata.externalDomainCount = externalDomains.size;
  metadata.hasPreconnect = hasPreconnect;
  metadata.hasDnsPrefetch = hasDnsPrefetch;

  if (externalDomains.size > 2 && !hasPreconnect && !hasDnsPrefetch) {
    issues.push({
      title: 'Preconnect et dns-prefetch absents',
      description: `La page charge des ressources depuis ${externalDomains.size} domaines externes sans utiliser preconnect ni dns-prefetch.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Ajoutez <link rel="preconnect" href="https://domaine.com"> pour les domaines tiers critiques.`,
      effortLevel: 'QUICK_WIN',
      impact: 3,
      fixSnippet: '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
    });
  }

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
