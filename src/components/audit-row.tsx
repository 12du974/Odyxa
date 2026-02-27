'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBg(score: number | null) {
  if (score === null) return 'bg-muted';
  if (score >= 80) return 'bg-green-500/10';
  if (score >= 60) return 'bg-yellow-500/10';
  if (score >= 40) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'outline'> = {
  COMPLETED: 'success',
  FAILED: 'destructive',
  QUEUED: 'secondary',
  CRAWLING: 'default',
  SCANNING: 'default',
  ANALYZING: 'default',
};

const statusLabels: Record<string, string> = {
  QUEUED: 'En attente',
  CRAWLING: 'Crawling...',
  SCANNING: 'Scan...',
  ANALYZING: 'Analyse...',
  COMPLETED: 'Terminé',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
};

interface AuditRowProps {
  audit: {
    id: string;
    status: string;
    globalScore: number | null;
    pagesScanned: number;
    issuesFound: number;
    createdAt: Date;
    project: { id: string; name: string; url: string };
  };
  index: number;
}

export function AuditRow({ audit, index }: AuditRowProps) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(audit.project.name);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const href = audit.status === 'COMPLETED' ? `/audit/${audit.id}` : `/audit/${audit.id}/progress`;

  function startRename(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setRenaming(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
  }

  async function confirmRename(e: React.MouseEvent | React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim() || name.trim() === audit.project.name) { setRenaming(false); return; }
    setLoading(true);
    await fetch(`/api/audits/${audit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setLoading(false);
    setRenaming(false);
    router.refresh();
  }

  function cancelRename(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setName(audit.project.name);
    setRenaming(false);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (!confirm(`Supprimer l'audit "${audit.project.name}" ?`)) return;
    await fetch(`/api/audits/${audit.id}`, { method: 'DELETE' });
    router.refresh();
  }

  const cardContent = (
    <Card
      className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="flex items-center gap-4 p-5">
        {/* Score */}
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${getScoreBg(audit.globalScore)}`}>
          <span className={`text-xl font-bold tabular-nums ${getScoreColor(audit.globalScore)}`}>
            {audit.globalScore !== null ? Math.round(audit.globalScore) : '--'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {renaming ? (
              <form onSubmit={confirmRename} className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-7 w-40 rounded-md border border-border bg-background px-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={loading}
                />
                <button type="submit" className="rounded p-1 hover:bg-green-500/10 text-green-600" disabled={loading}>
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={cancelRename} className="rounded p-1 hover:bg-muted text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <p className="font-semibold truncate">{name}</p>
            )}
            <Badge variant={statusVariants[audit.status] || 'secondary'}>
              {statusLabels[audit.status] || audit.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{audit.project.url}</p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium">{audit.pagesScanned}</p>
            <p className="text-xs text-muted-foreground">pages</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{audit.issuesFound}</p>
            <p className="text-xs text-muted-foreground">problèmes</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{formatRelativeTime(audit.createdAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-border bg-background shadow-lg py-1">
              <button onClick={startRename} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Renommer
              </button>
              <button onClick={handleDelete} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Supprimer
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (renaming) return <div>{cardContent}</div>;
  return <Link href={href}>{cardContent}</Link>;
}
