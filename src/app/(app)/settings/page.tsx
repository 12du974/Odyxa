'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Settings, User, Bell, Palette, Key, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Param&egrave;tres</h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">Configurez votre exp&eacute;rience Odixa</p>
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
              <Input placeholder="Votre nom" defaultValue="Utilisateur" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="email@example.com" defaultValue="user@odixa.com" />
            </div>
          </div>
          <Button size="sm">Sauvegarder</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" /> Apparence
          </CardTitle>
          <CardDescription>Theme et personnalisation visuelle</CardDescription>
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
                <p className="text-sm font-medium capitalize">{t === 'system' ? 'Systeme' : t === 'light' ? 'Clair' : 'Sombre'}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" /> Configuration par defaut des scans
          </CardTitle>
          <CardDescription>Valeurs par defaut pour les nouveaux audits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pages max par defaut</label>
              <Input type="number" defaultValue={10} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Profondeur max par defaut</label>
              <Input type="number" defaultValue={2} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Delai entre requetes (ms)</label>
            <Input type="number" defaultValue={1000} />
          </div>
          <Button size="sm">Sauvegarder</Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-primary" /> Cles API
          </CardTitle>
          <CardDescription>Gerez vos cles d acces a l API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Les cles API seront disponibles dans la version Pro.</p>
            <Button variant="outline" size="sm" className="mt-3">Upgrade vers Pro</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
