import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = 'Dark Patterns Detection';
const CATEGORY = 'DARK_PATTERNS' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function searchPatterns(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

export async function analyzeDarkPatterns(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;
  const bodyText = stripTags(bodyHtml).toLowerCase();

  // --- Urgency indicators ---
  const urgencyPatterns = [
    /offre\s+limit[ée]e/i,
    /plus\s+que\s+\d+/i,
    /derniers?\s+(jours?|heures?|minutes?|places?|articles?)/i,
    /d[ée]p[êe]chez[\s-]vous/i,
    /ne\s+ratez\s+pas/i,
    /limited\s+offer/i,
    /only\s+\d+\s+left/i,
    /hurry/i,
    /countdown|timer|compte\s+[àa]\s+rebours/i,
    /expire\s+(dans|bient[ôo]t|aujourd)/i,
    /stock\s+(limit[ée]|[ée]puis[ée]|faible)/i,
    /vente\s+flash/i,
    /\d+\s*%\s*de\s*r[ée]duction.*aujourd/i,
  ];

  const hasUrgency = searchPatterns(bodyText, urgencyPatterns);
  // Also check for timer elements
  const hasTimerElements =
    /<[^>]*class\s*=\s*["'][^"']*(countdown|timer)[^"']*["']/i.test(bodyHtml) ||
    /<[^>]*id\s*=\s*["'][^"']*(countdown|timer)[^"']*["']/i.test(bodyHtml);

  metadata.hasUrgencyIndicators = hasUrgency;
  metadata.hasTimerElements = hasTimerElements;

  if (hasUrgency || hasTimerElements) {
    issues.push({
      title: 'Indicateurs d\'urgence détectés',
      description: `Des éléments créant un sentiment d'urgence artificielle ont été détectés (compteurs, "offre limitée", etc.). Ces pratiques peuvent manipuler la décision de l'utilisateur.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Vérifiez que les indicateurs d'urgence sont fondés sur des contraintes réelles. Supprimez les faux compteurs et les mentions de rareté artificielle.`,
      effortLevel: 'QUICK_WIN',
      impact: 6,
    });
  }

  // --- Confirmshaming ---
  const confirmshamingPatterns = [
    /non\s*(,|\.|\s)\s*(je\s+ne\s+veux\s+pas|merci|je\s+pr[ée]f[èe]re)/i,
    /no\s*,?\s*i\s*(don'?t|prefer|would\s+rather)/i,
    /je\s+ne\s+souhaite\s+pas\s+(am[ée]liorer|profiter|[ée]conomiser)/i,
    /je\s+pr[ée]f[èe]re\s+(payer\s+plus|rester|ne\s+pas)/i,
    /non\s+merci,?\s+je\s+ne\s+veux\s+pas/i,
    /i\s+don'?t\s+want\s+to\s+save/i,
    /je\s+refuse\s+de\s+(profiter|b[ée]n[ée]ficier)/i,
  ];

  const hasConfirmshaming = searchPatterns(bodyText, confirmshamingPatterns);
  metadata.hasConfirmshaming = hasConfirmshaming;

  if (hasConfirmshaming) {
    issues.push({
      title: 'Confirmshaming détecté',
      description: `Des textes de type "confirmshaming" ont été détectés. Cette pratique culpabilise l'utilisateur qui refuse une offre (ex: "Non merci, je préfère payer plus").`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Proposez des options de refus neutres et respectueuses ("Non merci" ou "Fermer") sans culpabiliser l'utilisateur.`,
      effortLevel: 'QUICK_WIN',
      impact: 6,
    });
  }

  // --- Hidden costs patterns ---
  const hiddenCostPatterns = [
    /frais\s*(de\s+)?(service|livraison|dossier|traitement|gestion).*ajout[ée]/i,
    /service\s+fee/i,
    /prix\s+final.*diff[ée]r/i,
    /co[ûu]ts?\s+suppl[ée]mentaires?/i,
    /frais\s+cach[ée]s/i,
    /hidden\s+(fee|cost|charge)/i,
  ];

  const hasHiddenCosts = searchPatterns(bodyText, hiddenCostPatterns);
  metadata.hasHiddenCostIndicators = hasHiddenCosts;

  if (hasHiddenCosts) {
    issues.push({
      title: 'Mentions de coûts cachés détectées',
      description: `Des mentions évoquant des frais supplémentaires ou cachés ont été détectées. L'utilisateur devrait connaître le prix total dès le début.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Affichez le prix total dès la page produit, incluant tous les frais. Détaillez les coûts de manière transparente.`,
      effortLevel: 'MEDIUM',
      impact: 5,
    });
  }

  // --- Forced newsletter popups ---
  const popupPatterns = [
    /<[^>]*class\s*=\s*["'][^"']*(modal|popup|overlay|lightbox)[^"']*["'][^>]*>[\s\S]*?(newsletter|abonne|inscri|subscribe|sign\s*up)/i,
    /<[^>]*class\s*=\s*["'][^"']*(newsletter|subscribe)[^"']*["'][^>]*>[\s\S]*?(modal|popup|overlay)/i,
  ];

  const hasNewsletterPopup = popupPatterns.some((p) => p.test(bodyHtml));
  // Also detect full-screen overlays with email inputs
  const hasOverlayEmail =
    /<[^>]*class\s*=\s*["'][^"']*(overlay|modal|popup)[^"']*["'][^>]*>[\s\S]*?<input\b[^>]*type\s*=\s*["']email["']/i.test(bodyHtml);

  metadata.hasNewsletterPopup = hasNewsletterPopup || hasOverlayEmail;

  if (hasNewsletterPopup || hasOverlayEmail) {
    issues.push({
      title: 'Popup newsletter intrusif détecté',
      description: `Un popup ou une modale de newsletter a été détecté dans le HTML. Les popups intrusifs perturbent l'expérience utilisateur et peuvent être pénalisés par Google.`,
      severity: 'MINOR',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Remplacez les popups intrusifs par des bannières discrètes ou des formulaires intégrés au contenu. Respectez le délai avant affichage et la facilité de fermeture.`,
      effortLevel: 'MEDIUM',
      impact: 5,
    });
  }

  // --- Misleading button styles ---
  // Look for close/dismiss buttons that visually resemble CTAs
  const closeButtonPatterns = [
    /<button\b[^>]*class\s*=\s*["'][^"']*(btn-primary|btn-cta|cta)[^"']*["'][^>]*>[\s\S]*?(fermer|close|non|refuser|×|✕)/i,
    /<a\b[^>]*class\s*=\s*["'][^"']*(btn-primary|btn-cta|cta)[^"']*["'][^>]*>[\s\S]*?(fermer|close|non|refuser)/i,
  ];
  // Look for tiny/hidden close buttons
  const tinyClosePatterns = [
    /class\s*=\s*["'][^"']*(close|dismiss|fermer)[^"']*["'][^>]*style\s*=\s*["'][^"']*(font-size\s*:\s*[0-9]px|opacity\s*:\s*0?\.[0-3]|color\s*:\s*(#fff|white|transparent))/i,
  ];

  const hasMisleadingButtons = closeButtonPatterns.some((p) => p.test(bodyHtml));
  const hasTinyClose = tinyClosePatterns.some((p) => p.test(bodyHtml));
  metadata.hasMisleadingButtons = hasMisleadingButtons;
  metadata.hasTinyCloseButtons = hasTinyClose;

  if (hasMisleadingButtons || hasTinyClose) {
    issues.push({
      title: 'Boutons trompeurs détectés',
      description: `Des boutons de fermeture ou de refus semblent visuellement similaires aux boutons d'action principaux, ou sont anormalement petits/masqués.`,
      severity: 'SUGGESTION',
      category: CATEGORY,
      framework: FRAMEWORK,
      recommendation: `Différenciez clairement les boutons de fermeture/refus des boutons d'action. Le bouton de fermeture doit être visible, accessible et clairement identifié.`,
      effortLevel: 'QUICK_WIN',
      impact: 5,
    });
  }

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
