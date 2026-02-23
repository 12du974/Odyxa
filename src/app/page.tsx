'use client';

import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Shield, Zap, Eye, Palette, Search,
  CheckCircle, Globe, Code, MonitorSmartphone, ChevronRight, Menu, X,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimateIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm' : 'bg-transparent'
        }`}>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center">
              <img src="/logo-odixa-black.png" alt="Odixa" className="h-7 dark:hidden" />
              <img src="/logo-odixa-lime.png" alt="Odixa" className="h-7 hidden dark:block" />
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors duration-200">Fonctionnalit&eacute;s</a>
              <a href="#how" className="hover:text-foreground transition-colors duration-200">Comment &ccedil;a marche</a>
              <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Tarifs</a>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/audit/new">
                <Button size="sm">
                  Essai gratuit <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-3"
            >
              <a href="#features" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Fonctionnalit&eacute;s</a>
              <a href="#how" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Comment &ccedil;a marche</a>
              <a href="#pricing" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-center">Se connecter</Button>
                </Link>
                <Link href="/audit/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full justify-center">
                    Essai gratuit <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-odixa-lime/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-odixa-purple/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-odixa-lime/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-foreground mb-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Propuls&eacute; par l&rsquo;IA et les standards internationaux
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.5rem] leading-[1.1]"
            >
              D&eacute;voilez l&rsquo;invisible de
              <span className="text-gradient"> votre UX</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              Scan automatis&eacute; bas&eacute; sur Nielsen, WCAG 2.2, Laws of UX et 10+ frameworks.
              Rapport d&eacute;taill&eacute; avec score global et recommandations actionnables.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/audit/new" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto sm:text-base sm:h-14 sm:px-8">
                  Lancer un audit gratuit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto sm:text-base sm:h-14 sm:px-8">
                  Voir la d&eacute;mo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-odixa-lime" /> Gratuit jusqu&rsquo;&agrave; 3 audits</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-odixa-lime" /> Aucune installation</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-odixa-lime" /> Rapport en 5 min</span>
            </motion.div>

            {/* Mock dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative mt-16 sm:mt-20 mx-auto max-w-5xl"
            >
              <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-xs text-muted-foreground hidden sm:inline font-mono">app.odixa.com/dashboard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-5 sm:p-8">
                  <MockScoreCard label="Score Global" score={78} color="text-odixa-purple" />
                  <MockScoreCard label="Accessibilit&eacute;" score={85} color="text-emerald-500" />
                  <MockScoreCard label="Performance" score={62} color="text-amber-500" />
                  <MockScoreCard label="SEO" score={91} color="text-odixa-lavender" />
                </div>
              </div>
              <div className="absolute -inset-px -z-10 rounded-2xl bg-odixa-lime/20 blur-xl opacity-40" />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimateIn className="text-center mb-12 sm:mb-20">
              <p className="text-sm font-semibold text-odixa-purple mb-3 uppercase tracking-wider">Fonctionnalit&eacute;s</p>
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">8 analyseurs. 1 rapport.</h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Chaque page est analys&eacute;e en profondeur selon les standards internationaux.
              </p>
            </AnimateIn>

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
              <FeatureCard icon={Eye} title="Accessibilit&eacute;" desc="WCAG 2.2 A/AA/AAA, contrastes, ARIA, navigation clavier" accent="bg-odixa-purple/10 text-odixa-purple" />
              <FeatureCard icon={Zap} title="Performance" desc="Core Web Vitals, Lighthouse, lazy loading, poids ressources" accent="bg-odixa-lime/20 text-odixa-black dark:text-odixa-lime" />
              <FeatureCard icon={Palette} title="Design System" desc="Typo, couleurs, espacements, coh&eacute;rence des composants" accent="bg-odixa-lavender/15 text-odixa-lavender" />
              <FeatureCard icon={Code} title="Formulaires" desc="Labels, validation, autocomplete, &eacute;tats visuels" accent="bg-emerald-500/10 text-emerald-600" />
              <FeatureCard icon={Search} title="SEO Technique" desc="Title, meta, Open Graph, canonical, structured data" accent="bg-odixa-purple/10 text-odixa-purple" />
              <FeatureCard icon={MonitorSmartphone} title="Responsive" desc="3 viewports, touch targets, overflow, meta viewport" accent="bg-odixa-lime/20 text-odixa-black dark:text-odixa-lime" />
              <FeatureCard icon={Globe} title="Navigation" desc="Profondeur, liens cass&eacute;s, breadcrumbs, architecture" accent="bg-odixa-lavender/15 text-odixa-lavender" />
              <FeatureCard icon={Shield} title="Dark Patterns" desc="D&eacute;tection des patterns trompeurs, misdirection" accent="bg-red-500/10 text-red-500" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20 sm:py-32 bg-odixa-black text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimateIn className="text-center mb-12 sm:mb-20">
              <p className="text-sm font-semibold text-odixa-lime mb-3 uppercase tracking-wider">Processus</p>
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">3 &eacute;tapes. 5 minutes.</h2>
              <p className="mt-4 text-base sm:text-lg text-white/60">Des insights actionnables, imm&eacute;diatement.</p>
            </AnimateIn>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
              <AnimateIn delay={0}><StepCard step={1} title="Entrez votre URL" desc="Collez l'URL de votre site. Configurez la profondeur de scan et les analyseurs." /></AnimateIn>
              <AnimateIn delay={0.1}><StepCard step={2} title="Scan automatis&eacute;" desc="Notre moteur crawle chaque page, prend des screenshots, analyse le DOM et les performances." /></AnimateIn>
              <AnimateIn delay={0.2}><StepCard step={3} title="Rapport d&eacute;taill&eacute;" desc="Score global, issues class&eacute;es par s&eacute;v&eacute;rit&eacute;, recommandations avec code correctif." /></AnimateIn>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimateIn className="text-center mb-12 sm:mb-20">
              <p className="text-sm font-semibold text-odixa-purple mb-3 uppercase tracking-wider">Tarifs</p>
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">Simple et transparent</h2>
            </AnimateIn>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
              <AnimateIn delay={0}><PricingCard name="Free" price="0" desc="Pour d&eacute;couvrir" features={['3 audits / mois', '10 pages max / audit', '6 analyseurs', 'Rapport web']} /></AnimateIn>
              <AnimateIn delay={0.1}><PricingCard name="Pro" price="49" desc="Pour les pros" features={['Audits illimit\u00e9s', '100 pages / audit', '8 analyseurs + IA', 'Export PDF, CSV', 'Monitoring programm\u00e9', 'API access']} highlighted /></AnimateIn>
              <AnimateIn delay={0.2}><PricingCard name="Enterprise" price="199" desc="Pour les \u00e9quipes" features={['Tout Pro +', 'Pages illimit\u00e9es', 'White-label', 'SSO & multi-tenant', 'Support prioritaire', 'SLA 99.9%']} /></AnimateIn>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-32">
          <AnimateIn>
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className="relative rounded-3xl bg-odixa-black p-10 sm:p-16 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-odixa-lime/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-odixa-purple/20 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative">
                  <h2 className="text-2xl font-extrabold sm:text-4xl text-white tracking-tight">
                    Pr&ecirc;t &agrave; transformer votre UX ?
                  </h2>
                  <p className="mt-4 text-base sm:text-lg text-white/60">
                    Premier audit gratuit en 30 secondes. Aucune carte requise.
                  </p>
                  <div className="mt-8">
                    <Link href="/audit/new">
                      <Button variant="lime" size="lg" className="sm:text-base sm:h-14 sm:px-10">
                        Commencer maintenant <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <img src="/logo-odixa-black.png" alt="Odixa" className="h-5 dark:hidden opacity-60" />
              <img src="/logo-odixa-lime.png" alt="Odixa" className="h-5 hidden dark:block opacity-60" />
              <span>&copy; 2026</span>
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
    <div className="rounded-xl bg-muted/50 p-3 sm:p-5 text-left">
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold mt-1 ${color}`}>{score}</p>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full bg-current ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, accent }: { icon: React.ElementType; title: string; desc: string; accent: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-foreground/10 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1">
      <div className={`mb-4 inline-flex rounded-xl ${accent} p-2.5`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-[15px]">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-odixa-lime text-odixa-black text-lg font-bold">
        {step}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">{desc}</p>
      {step < 3 && (
        <ChevronRight className="absolute top-1/2 -right-4 hidden h-6 w-6 text-white/20 md:block" />
      )}
    </div>
  );
}

function PricingCard({ name, price, desc, features, highlighted }: {
  name: string; price: string; desc: string; features: string[]; highlighted?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border p-7 sm:p-8 transition-all duration-300 ${
      highlighted ? 'border-odixa-black dark:border-odixa-lime bg-odixa-black dark:bg-odixa-lime/5 text-white dark:text-foreground shadow-2xl shadow-black/10 md:scale-105' : 'border-border bg-card hover:border-foreground/10'
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-odixa-lime text-odixa-black px-4 py-1 text-xs font-bold">
          Populaire
        </div>
      )}
      <h3 className="text-xl font-bold">{name}</h3>
      <p className={`text-sm ${highlighted ? 'text-white/60 dark:text-muted-foreground' : 'text-muted-foreground'}`}>{desc}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">{price}&euro;</span>
        <span className={`text-sm ${highlighted ? 'text-white/50 dark:text-muted-foreground' : 'text-muted-foreground'}`}>/mois</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm">
            <CheckCircle className={`h-4 w-4 shrink-0 ${highlighted ? 'text-odixa-lime' : 'text-odixa-purple'}`} />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/audit/new">
          <Button variant={highlighted ? 'lime' : 'outline'} className="w-full">
            Commencer
          </Button>
        </Link>
      </div>
    </div>
  );
}
