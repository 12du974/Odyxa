'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un audit, projet..."
            className="w-[220px] lg:w-[300px] pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-odixa-lime text-[10px] font-bold text-odixa-black flex items-center justify-center">
            3
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="ml-1 sm:ml-2 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-odixa-black to-odixa-purple flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
