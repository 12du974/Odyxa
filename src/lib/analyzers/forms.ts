import type { AnalyzerInput, AnalyzerOutput, AnalyzerIssue } from '@/types';

const FRAMEWORK = 'Standards Formulaires';
const CATEGORY = 'FORMS' as const;

function computeScore(issues: AnalyzerIssue[]): number {
  const penalties: Record<string, number> = { CRITICAL: 20, MAJOR: 10, MINOR: 4, SUGGESTION: 1 };
  const total = issues.reduce((sum, i) => sum + (penalties[i.severity] ?? 0), 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export async function analyzeForms(input: AnalyzerInput): Promise<AnalyzerOutput> {
  const { html } = input;
  const issues: AnalyzerIssue[] = [];
  const metadata: Record<string, unknown> = {};

  // --- Detect forms ---
  const formRegex = /<form\b[^>]*>([\s\S]*?)<\/form>/gi;
  const forms: string[] = [];
  let formMatch: RegExpExecArray | null;
  while ((formMatch = formRegex.exec(html)) !== null) {
    forms.push(formMatch[0]);
  }
  metadata.formCount = forms.length;

  // If no forms, return perfect score
  if (forms.length === 0) {
    return {
      score: 100,
      issues: [],
      metadata: { formCount: 0, message: 'Aucun formulaire détecté sur cette page.' },
    };
  }

  for (let fi = 0; fi < forms.length; fi++) {
    const form = forms[fi];
    const formLabel = forms.length > 1 ? ` (formulaire ${fi + 1})` : '';

    // --- Placeholder used as label ---
    const inputsInForm = form.match(/<input\b[^>]*>/gi) || [];
    const textareasInForm = form.match(/<textarea\b[^>]*>[^<]*/gi) || [];
    const allFields = [...inputsInForm, ...textareasInForm];

    for (const field of allFields) {
      if (/\btype\s*=\s*["'](hidden|submit|button|reset|image)["']/i.test(field)) continue;
      const hasPlaceholder = /\bplaceholder\s*=/i.test(field);
      const idMatch = field.match(/\bid\s*=\s*["']([^"']+)["']/i);
      const hasLabel = idMatch
        ? new RegExp(`<label[^>]*\\bfor\\s*=\\s*["']${idMatch[1]}["']`, 'i').test(form)
        : false;
      const hasAriaLabel = /\baria-label\s*=/i.test(field) || /\baria-labelledby\s*=/i.test(field);

      if (hasPlaceholder && !hasLabel && !hasAriaLabel) {
        issues.push({
          title: `Placeholder utilisé comme label${formLabel}`,
          description: `Un champ utilise un placeholder à la place d'un véritable label. Le placeholder disparaît à la saisie et n'est pas accessible.`,
          severity: 'MAJOR',
          category: CATEGORY,
          framework: FRAMEWORK,
          selector: idMatch ? `#${idMatch[1]}` : 'input',
          recommendation: `Ajoutez un <label> visible associé au champ. Le placeholder peut compléter le label mais ne doit pas le remplacer.`,
          effortLevel: 'QUICK_WIN',
          impact: 7,
          codeSnippet: field.slice(0, 120),
        });
      }
    }

    // --- Email field without type="email" ---
    const emailPatternFields = allFields.filter((f) => {
      const name = f.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const placeholder = f.match(/\bplaceholder\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const id = f.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const combined = `${name} ${placeholder} ${id}`.toLowerCase();
      return /e[-_]?mail|courriel|adresse.*mail/i.test(combined);
    });

    for (const field of emailPatternFields) {
      if (!/\btype\s*=\s*["']email["']/i.test(field)) {
        issues.push({
          title: `Champ email sans type="email"${formLabel}`,
          description: `Un champ qui semble capturer un email n'utilise pas type="email". Le clavier mobile adapté ne sera pas proposé.`,
          severity: 'MINOR',
          category: CATEGORY,
          framework: FRAMEWORK,
          recommendation: `Utilisez <input type="email"> pour activer la validation native et le clavier optimisé sur mobile.`,
          effortLevel: 'QUICK_WIN',
          impact: 5,
          codeSnippet: field.slice(0, 120),
        });
      }
    }

    // --- Phone field without type="tel" ---
    const phonePatternFields = allFields.filter((f) => {
      const name = f.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const placeholder = f.match(/\bplaceholder\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const id = f.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const combined = `${name} ${placeholder} ${id}`.toLowerCase();
      return /t[ée]l[ée]?phone|phone|mobile|numero/i.test(combined);
    });

    for (const field of phonePatternFields) {
      if (!/\btype\s*=\s*["']tel["']/i.test(field)) {
        issues.push({
          title: `Champ téléphone sans type="tel"${formLabel}`,
          description: `Un champ qui semble capturer un numéro de téléphone n'utilise pas type="tel". Le pavé numérique ne sera pas affiché sur mobile.`,
          severity: 'MINOR',
          category: CATEGORY,
          framework: FRAMEWORK,
          recommendation: `Utilisez <input type="tel"> pour activer le clavier numérique sur mobile.`,
          effortLevel: 'QUICK_WIN',
          impact: 4,
          codeSnippet: field.slice(0, 120),
        });
      }
    }

    // --- Missing autocomplete ---
    const fieldsNeedingAutocomplete = allFields.filter((f) => {
      if (/\btype\s*=\s*["'](hidden|submit|button|reset|image)["']/i.test(f)) return false;
      if (/\bautocomplete\s*=/i.test(f)) return false;
      return true;
    });

    if (fieldsNeedingAutocomplete.length > 0) {
      issues.push({
        title: `Attribut autocomplete manquant${formLabel}`,
        description: `${fieldsNeedingAutocomplete.length} champ(s) ne possèdent pas d'attribut autocomplete. Le remplissage automatique ne fonctionnera pas correctement.`,
        severity: 'SUGGESTION',
        category: CATEGORY,
        framework: FRAMEWORK,
        criterion: 'WCAG 1.3.5 Identify Input Purpose',
        recommendation: `Ajoutez l'attribut autocomplete approprié (name, email, tel, etc.) pour faciliter le remplissage automatique.`,
        effortLevel: 'QUICK_WIN',
        impact: 3,
      });
    }

    // --- Missing submit button ---
    const hasSubmit =
      /<button\b[^>]*type\s*=\s*["']submit["']/i.test(form) ||
      /<input\b[^>]*type\s*=\s*["']submit["']/i.test(form) ||
      (/<button\b/i.test(form) && !/<button\b[^>]*type\s*=\s*["']button["']/i.test(form));

    if (!hasSubmit) {
      issues.push({
        title: `Bouton de soumission manquant${formLabel}`,
        description: `Le formulaire ne possède pas de bouton de soumission visible. L'utilisateur ne peut pas savoir comment valider le formulaire.`,
        severity: 'MAJOR',
        category: CATEGORY,
        framework: FRAMEWORK,
        recommendation: `Ajoutez un <button type="submit"> clairement visible avec un libellé explicite.`,
        effortLevel: 'QUICK_WIN',
        impact: 8,
        fixSnippet: '<button type="submit">Envoyer</button>',
      });
    }

    // --- No required fields ---
    const hasRequired = /\brequired\b/i.test(form) || /\baria-required\s*=\s*["']true["']/i.test(form);

    if (!hasRequired && allFields.length > 1) {
      issues.push({
        title: `Aucun champ obligatoire indiqué${formLabel}`,
        description: `Le formulaire ne marque aucun champ comme requis. L'utilisateur ne sait pas quels champs sont obligatoires.`,
        severity: 'MINOR',
        category: CATEGORY,
        framework: FRAMEWORK,
        recommendation: `Utilisez l'attribut required sur les champs obligatoires et ajoutez un indicateur visuel (astérisque *).`,
        effortLevel: 'QUICK_WIN',
        impact: 5,
      });
    }

    // --- Long forms without fieldset ---
    const visibleFields = allFields.filter(
      (f) => !/\btype\s*=\s*["'](hidden)["']/i.test(f)
    );
    const hasFieldset = /<fieldset\b/i.test(form);

    if (visibleFields.length > 6 && !hasFieldset) {
      issues.push({
        title: `Formulaire long sans fieldset${formLabel}`,
        description: `Le formulaire contient ${visibleFields.length} champs visibles sans regroupement par <fieldset>. Cela rend le formulaire difficile à parcourir.`,
        severity: 'SUGGESTION',
        category: CATEGORY,
        framework: FRAMEWORK,
        recommendation: `Regroupez les champs liés dans des <fieldset> avec des <legend> descriptifs pour améliorer la lisibilité et l'accessibilité.`,
        effortLevel: 'MEDIUM',
        impact: 3,
      });
    }
  }

  metadata.totalIssues = issues.length;

  return {
    score: computeScore(issues),
    issues,
    metadata,
  };
}
