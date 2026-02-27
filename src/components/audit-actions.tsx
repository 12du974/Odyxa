'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';

export function AuditActions({ auditId, projectName }: { auditId: string; projectName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(projectName);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function startRename(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    setRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function confirmRename(e: React.MouseEvent | React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim() || name.trim() === projectName) { setRenaming(false); return; }
    setLoading(true);
    await fetch(`/api/audits/${auditId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setLoading(false);
    setRenaming(false);
    router.refresh();
  }

  function cancelRename(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setName(projectName);
    setRenaming(false);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    if (!confirm(`Supprimer l'audit "${projectName}" ?`)) return;
    await fetch(`/api/audits/${auditId}`, { method: 'DELETE' });
    router.refresh();
  }

  if (renaming) {
    return (
      <form onSubmit={confirmRename} className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
    );
  }

  return (
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={toggleMenu}
        className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        title="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-border bg-background shadow-lg py-1">
          <button
            onClick={startRename}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            Renommer
          </button>
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
