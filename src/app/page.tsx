'use client';

import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Shield, Zap, Eye, Palette, Search, BarChart3,
  CheckCircle, Globe, Code, MonitorSmartphone, ChevronRight, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/logo-odyxa.png" alt="Odyxa" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-lg font-bold">Odyxa</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how" className="hover:text-foreground transition-colors">Comment &ccedil;a marche</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/audit/new">
                <Button variant="gradient" size="sm">
                  Essai gratuit <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Comment &ccedil;a marche</a>
              <a href="#pricing" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-center">Se connecter</Button>
                </Link>
                <Link href="/audit/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" size="sm" className="w-full justify-center">
                    Essai gratuit <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,26,121,0.15),transparent)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-odyxa-navy/5 rounded-full blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs sm:text-sm sm:px-4 text-muted-foreground mb-6 sm:mb-8">
              <img src="/logo-odyxa.png" alt="" className="h-4 w-4" />
              Propuls&eacute; par l&rsquo;IA et les standards internationaux
            </div>

            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
              Auditez l&rsquo;UX de
              <span className="gradient-text"> n&rsquo;importe quel </span>
              site web en minutes
            </h1>

            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
              Scan automatis&eacute; bas&eacute; sur Nielsen, WCAG 2.2, Laws of UX, Material Design et 10+ frameworks.
              Obtenez un rapport d&eacute;taill&eacute; avec un score global, des issues class&eacute;es par priorit&eacute; et des recommandations actionnables.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
              <Link href="/audit/new" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto sm:text-base sm:h-14 sm:px-8">
                  Lancer un audit gratuit
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto sm:text-base sm:h-14 sm:px-8">
                  Voir la d&eacute;mo
                </Button>
              </Link>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Gratuit jusqu&rsquo;&agrave; 3 audits</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Aucune installation</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Rapport en 5min</span>
            </div>

            {/* Mock dashboard */}
            <div className="relative mt-10 sm:mt-16 mx-auto max-w-5xl">
              <div className="rounded-xl border border-border/50 bg-card shadow-2xl shadow-odyxa-navy/10 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">app.odyxa.com/dashboard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
                  <MockScoreCard label="Score Global" score={78} color="text-odyxa-purple" />
                  <MockScoreCard label="Accessibilit&eacute;" score={85} color="text-green-500" />
                  <MockScoreCard label="Performance" score={62} color="text-odyxa-coral" />
                  <MockScoreCard label="SEO" score={91} color="text-odyxa-cornflower" />
                </div>
              </div>
              <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-odyxa-navy/20 via-odyxa-purple/20 to-odyxa-coral/20 blur-2xl opacity-50" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 sm:py-24 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">8 analyseurs, 10+ frameworks, 1 rapport</h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Chaque page est analys&eacute;e en profondeur selon les standards internationaux reconnus.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard icon={Eye} title="Accessibilit&eacute;" desc="WCAG 2.2 A/AA/AAA, axe-core, contrastes, ARIA, navigation clavier" color="from-odyxa-navy to-odyxa-purple" />
              <FeatureCard icon={Zap} title="Performance" desc="Core Web Vitals, Lighthouse, lazy loading, render-blocking, poids ressources" color="from-odyxa-coral to-[#f4a261]" />
              <FeatureCard icon={Palette} title="Design System" desc="Typo, couleurs, espacements, border-radius, coh&eacute;rence des composants" color="from-odyxa-purple to-odyxa-perfume" />
              <FeatureCard icon={Code} title="Formulaires" desc="Labels, validation, autocomplete, &eacute;tats visuels, champs obligatoires" color="from-green-500 to-emerald-500" />
              <FeatureCard icon={Search} title="SEO Technique" desc="Title, meta, Open Graph, canonical, structured data, sitemap" color="from-odyxa-cornflower to-odyxa-purple" />
              <FeatureCard icon={MonitorSmartphone} title="Responsive" desc="Screenshots 3 viewports, touch targets, overflow, meta viewport" color="from-odyxa-perfume to-odyxa-cornflower" />
              <FeatureCard icon={Globe} title="Navigation" desc="Profondeur, liens cass&eacute;s, breadcrumbs, architecture de l&rsquo;information" color="from-teal-500 to-odyxa-cornflower" />
              <FeatureCard icon={Shield} title="Dark Patterns" desc="D&eacute;tection des patterns trompeurs, confirmshaming, misdirection" color="from-odyxa-coral to-red-500" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16 sm:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Comment &ccedil;a marche</h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">3 &eacute;tapes. 5 minutes. Des insights actionnables.</p>
            </div>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
              <StepCard step={1} title="Entrez votre URL" desc="Collez l&rsquo;URL de votre site web. Configurez la profondeur de scan, les pages max et les analyseurs." />
              <StepCard step={2} title="Scan automatis&eacute;" desc="Notre moteur Playwright crawle chaque page, prend des screenshots, analyse le DOM, le CSS et les performances." />
              <StepCard step={3} title="Rapport d&eacute;taill&eacute;" desc="Score global, issues class&eacute;es par s&eacute;v&eacute;rit&eacute;, recommandations avec code correctif, screenshots annot&eacute;s." />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Tarifs simples, r&eacute;sultats puissants</h2>
            </div>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
              <PricingCard name="Free" price="0" desc="Pour d&eacute;couvrir" features={['3 audits / mois', '10 pages max / audit', '6 analyseurs', 'Rapport web']} />
              <PricingCard name="Pro" price="49" desc="Pour les pros" features={['Audits illimit\u00e9s', '100 pages / audit', '8 analyseurs + IA', 'Export PDF, CSV', 'Monitoring programm\u00e9', 'API access']} highlighted />
              <PricingCard name="Enterprise" price="199" desc="Pour les \u00e9quipes" features={['Tout Pro +', 'Pages illimit\u00e9es', 'White-label', 'SSO & multi-tenant', 'Support prioritaire', 'SLA 99.9%']} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24 border-t border-border/50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl gradient-text inline-block">
              Pr&ecirc;t &agrave; transformer votre UX avec Odyxa ?
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Lancez votre premier audit gratuit en 30 secondes. Aucune carte requise.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link href="/audit/new" className="w-full sm:w-auto inline-block">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto sm:text-base sm:h-14 sm:px-10">
                  Commencer maintenant <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src="/logo-odyxa.png" alt="Odyxa" className="h-4 w-4" />
              <span>Odyxa &copy; 2026</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">API</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

function MockScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 sm:p-4 text-left">
      <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl sm:text-3xl font-bold ${color}`}>{score}</p>
      <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full bg-current ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: React.ElementType; title: string; desc: string; color: string }) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 sm:p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className={`mb-3 sm:mb-4 inline-flex rounded-lg bg-gradient-to-br ${color} p-2 sm:p-2.5`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
      <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="relative rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
      <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-odyxa-navy to-odyxa-purple text-base sm:text-lg font-bold text-white">
        {step}
      </div>
      <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">{desc}</p>
      {step < 3 && (
        <ChevronRight className="absolute top-1/2 -right-4 hidden h-6 w-6 text-muted-foreground md:block" />
      )}
    </div>
  );
}

function PricingCard({ name, price, desc, features, highlighted }: {
  name: string; price: string; desc: string; features: string[]; highlighted?: boolean;
}) {
  return (
    <div className={`relative rounded-xl border p-6 sm:p-8 transition-all ${
      highlighted ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 md:scale-105' : 'border-border bg-card'
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-odyxa-navy to-odyxa-coral px-4 py-1 text-xs font-bold text-white">
          Populaire
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-bold">{name}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
      <div className="mt-3 sm:mt-4 flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-extrabold">{price}&euro;</span>
        <span className="text-muted-foreground text-sm">/mois</span>
      </div>
      <ul className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 sm:mt-8">
        <Link href="/audit/new">
          <Button variant={highlighted ? 'gradient' : 'outline'} className="w-full">
            Commencer
          </Button>
        </Link>
      </div>
    </div>
  );
}
