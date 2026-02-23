'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Settings2, Rocket, ArrowRight, ArrowLeft, Check,
  Eye, Zap, Palette, FormInput, FileText, Search, Compass, ShieldAlert,
  Monitor, Tablet, Smartphone, Loader2,
} from 'lucide-react';
import { ALL_CATEGORIES, CATEGORY_LABELS, type IssueCategory } from '@/types';

const steps = [
  { id: 1, label: 'Site Web', icon: Globe, desc: 'URL et nom du projet' },
  { id: 2, label: 'Configuration', icon: Settings2, desc: 'Pages, profondeur, viewports' },
  { id: 3, label: 'Analyseurs', icon: Rocket, desc: 'Choisissez vos analyseurs' },
];

const categoryIcons: Record<string, React.ElementType> = {
  ACCESSIBILITY: Eye, PERFORMANCE: Zap, DESIGN_CONSISTENCY: Palette,
  FORMS: FormInput, CONTENT: FileText, SEO: Search,
  NAVIGATION: Compass, DARK_PATTERNS: ShieldAlert,
};

/* Pas de couleurs par categorie — interface sobre */

export default function NewAuditPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectName, setProjectName] = useState('');
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(10);
  const [maxDepth, setMaxDepth] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([...ALL_CATEGORIES]);

  function toggleCategory(cat: IssueCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          url: url.startsWith('http') ? url : `https://${url}`,
          maxPages,
          maxDepth,
          categories: selectedCategories,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
      const data = await res.json();
      router.push(`/audit/${data.auditId}/progress`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nouvel Audit</h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">Configurez et lancez un audit UI/UX complet</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all shrink-0 ${
                step > s.id ? 'bg-green-600 text-white' :
                step === s.id ? 'bg-foreground text-background' :
                'bg-muted text-muted-foreground'
              }`}>
                {step > s.id ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${step >= s.id ? '' : 'text-muted-foreground'}`}>{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 sm:mx-4 ${step > s.id ? 'bg-green-600' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Informations du site
                </CardTitle>
                <CardDescription>Entrez l&rsquo;URL du site web &agrave; auditer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du projet *</label>
                  <Input placeholder="Mon site web" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL du site *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="https://example.com" type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="h-12 pl-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Configuration du scan
                </CardTitle>
                <CardDescription>Ajustez les paramètres du scan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pages max</label>
                    <Input type="number" min={1} max={100} value={maxPages} onChange={(e) => setMaxPages(Number(e.target.value))} />
                    <p className="text-xs text-muted-foreground">Nombre de pages a scanner</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profondeur max</label>
                    <Input type="number" min={0} max={5} value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} />
                    <p className="text-xs text-muted-foreground">Niveaux de navigation</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <h4 className="text-sm font-medium mb-3">Viewports testes</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <ViewportCard icon={Monitor} name="Desktop" size="1920 x 1080" />
                    <ViewportCard icon={Tablet} name="Tablet" size="768 x 1024" />
                    <ViewportCard icon={Smartphone} name="Mobile" size="375 x 812" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Analyseurs
                </CardTitle>
                <CardDescription>Sélectionnez les catégories d&rsquo;analyse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const Icon = categoryIcons[cat] || Eye;
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-foreground/20 bg-muted/50'
                            : 'border-border hover:border-foreground/10'
                        }`}
                      >
                        <div className="rounded-lg bg-muted p-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{CATEGORY_LABELS[cat]}</p>
                        </div>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected ? 'border-green-600 bg-green-600' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategories([...ALL_CATEGORIES])}>Tout selectionner</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategories([])}>Tout deselectionner</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        {step < 3 ? (
          <Button onClick={() => {
            if (step === 1 && (!projectName || !url)) {
              setError('Veuillez remplir tous les champs.');
              return;
            }
            setError('');
            setStep(step + 1);
          }}>
            Suivant <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default" size="lg" onClick={handleSubmit} disabled={loading || selectedCategories.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {loading ? 'Lancement...' : "Lancer l’audit"}
          </Button>
        )}
      </div>
    </div>
  );
}

function ViewportCard({ icon: Icon, name, size }: { icon: React.ElementType; name: string; size: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{size}</p>
      </div>
    </div>
  );
}
