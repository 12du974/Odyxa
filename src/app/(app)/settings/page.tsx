'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Settings, User, Bell, Palette, Key, Globe, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';

const STORAGE_KEY = 'odixa_settings';

interface StoredSettings {
  name?: string;
  email?: string;
  maxPages?: number;
  maxDepth?: number;
  delay?: number;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState('Utilisateur');
  const [email, setEmail] = useState('user@odixa.com');
  const [maxPages, setMaxPages] = useState(10);
  const [maxDepth, setMaxDepth] = useState(2);
  const [delay, setDelay] = useState(1000);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s: StoredSettings = JSON.parse(raw);
        if (s.name !== undefined) setName(s.name);
        if (s.email !== undefined) setEmail(s.email);
        if (s.maxPages !== undefined) setMaxPages(s.maxPages);
        if (s.maxDepth !== undefined) setMaxDepth(s.maxDepth);
        if (s.delay !== undefined) setDelay(s.delay);
      }
    } catch { /* ignore malformed storage */ }
  }, []);

  function persistSettings(patch: Partial<StoredSettings>) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current: StoredSettings = raw ? JSON.parse(raw) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch { /* ignore */ }
  }

  function showSaved(section: string) {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  }

  function saveProfile() {
    persistSettings({ name, email });
    showSaved('profile');
  }

  function saveScanDefaults() {
    persistSettings({ maxPages, maxDepth, delay });
    showSaved('scan');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">Configurez votre expérience Odixa</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" /> Profil
          </CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" onClick={saveProfile} className="gap-2">
            {savedSection === 'profile' ? (
              <><CheckCircle2 className="h-4 w-4 text-green-500" /> Sauvegardé</>
            ) : 'Sauvegarder'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" /> Apparence
          </CardTitle>
          <CardDescription>Thème et personnalisation visuelle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-xl border p-4 text-center transition-all ${
                  theme === t ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`mx-auto mb-2 h-8 w-8 rounded-lg ${
                  t === 'light' ? 'bg-yellow-100 border border-yellow-300' :
                  t === 'dark' ? 'bg-gray-800 border border-gray-600' :
                  'bg-gradient-to-br from-yellow-100 to-gray-800 border'
                }`} />
                <p className="text-sm font-medium capitalize">{t === 'system' ? 'Système' : t === 'light' ? 'Clair' : 'Sombre'}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" /> Configuration par défaut des scans
          </CardTitle>
          <CardDescription>Valeurs par défaut pour les nouveaux audits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pages max par défaut</label>
              <Input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Profondeur max par défaut</label>
              <Input
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Délai entre requêtes (ms)</label>
            <Input
              type="number"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
            />
          </div>
          <Button size="sm" onClick={saveScanDefaults} className="gap-2">
            {savedSection === 'scan' ? (
              <><CheckCircle2 className="h-4 w-4 text-green-500" /> Sauvegardé</>
            ) : 'Sauvegarder'}
          </Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-primary" /> Clés API
          </CardTitle>
          <CardDescription>Gérez vos clés d&apos;accès à l&apos;API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Les clés API seront disponibles dans la version Pro.</p>
            <Button variant="outline" size="sm" className="mt-3">Upgrade vers Pro</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
