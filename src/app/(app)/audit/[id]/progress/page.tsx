'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe, ScanSearch, Brain, FileText, CheckCircle2, XCircle,
  Clock, ArrowRight, Loader2, AlertTriangle,
} from 'lucide-react';

interface AuditState {
  id: string;
  status: string;
  pagesScanned: number;
  totalPages: number;
  pagesAnalyzed: number;
  issuesFound: number;
  globalScore: number | null;
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  QUEUED: { icon: Clock, label: "En file d'attente...", color: 'text-muted-foreground' },
  CRAWLING: { icon: Globe, label: 'Découverte des pages...', color: 'text-blue-500' },
  SCANNING: { icon: ScanSearch, label: 'Scan en cours...', color: 'text-blue-500' },
  ANALYZING: { icon: Brain, label: 'Analyse en cours...', color: 'text-odyxa-purple' },
  GENERATING_REPORT: { icon: FileText, label: 'Génération du rapport...', color: 'text-odyxa-purple' },
  COMPLETED: { icon: CheckCircle2, label: 'Audit terminé !', color: 'text-green-500' },
  FAILED: { icon: XCircle, label: 'Audit échoué', color: 'text-red-500' },
};

export default function AuditProgressPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;
  const [audit, setAudit] = useState<AuditState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/audits/${auditId}`);
        if (!res.ok) return;
        const data = await res.json();
        setAudit(data.audit);
        setLogs(data.logs || []);
        if (data.audit.status === 'COMPLETED' || data.audit.status === 'FAILED') {
          clearInterval(interval);
          if (data.audit.status === 'COMPLETED') {
            setTimeout(() => router.push(`/audit/${auditId}`), 2000);
          }
        }
      } catch { /* retry */ }
    }, 1500);
    return () => clearInterval(interval);
  }, [auditId, router]);

  const progressPercent = (() => {
    if (!audit) return 0;
    const s = audit.status;
    if (s === 'COMPLETED') return 100;
    if (s === 'FAILED') return 0;
    if (s === 'QUEUED') return 0;
    const total = audit.totalPages || 1;
    if (s === 'CRAWLING') {
      return Math.min(Math.round((audit.pagesScanned / Math.max(total, audit.pagesScanned + 1)) * 40), 39);
    }
    // ANALYZING or GENERATING_REPORT
    const analyzeProgress = audit.pagesAnalyzed / total;
    return Math.min(40 + Math.round(analyzeProgress * 58), 98);
  })();

  const phaseLabel = (() => {
    if (!audit) return '';
    const s = audit.status;
    if (s === 'CRAWLING') {
      return `Crawl : ${audit.pagesScanned} page${audit.pagesScanned > 1 ? 's' : ''} trouvée${audit.pagesScanned > 1 ? 's' : ''}`;
    }
    if (s === 'ANALYZING' || s === 'SCANNING') {
      const total = audit.totalPages || 0;
      return `Analyse : ${audit.pagesAnalyzed}/${total} page${total > 1 ? 's' : ''}`;
    }
    if (s === 'COMPLETED') return 'Terminé';
    if (s === 'FAILED') return 'Échoué';
    return '';
  })();

  const status = audit ? statusConfig[audit.status] || statusConfig.QUEUED : statusConfig.QUEUED;
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="text-center space-y-4">
        <motion.div
          className="mx-auto"
          animate={{ rotate: audit?.status === 'COMPLETED' || audit?.status === 'FAILED' ? 0 : 360 }}
          transition={{ duration: 2, repeat: audit?.status === 'COMPLETED' || audit?.status === 'FAILED' ? 0 : Infinity, ease: 'linear' }}
        >
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${
            audit?.status === 'COMPLETED' ? 'bg-green-500/10' :
            audit?.status === 'FAILED' ? 'bg-red-500/10' :
            'bg-primary/10'
          }`}>
            <StatusIcon className={`h-10 w-10 ${status.color}`} />
          </div>
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold">{status.label}</h1>
          {audit?.status !== 'COMPLETED' && audit?.status !== 'FAILED' && (
            <p className="text-sm text-muted-foreground mt-1">Veuillez patienter, l&rsquo;audit est en cours...</p>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" indicatorClassName={
            audit?.status === 'COMPLETED' ? 'bg-green-500' :
            audit?.status === 'FAILED' ? 'bg-red-500' :
            'bg-gradient-to-r from-odyxa-navy to-odyxa-purple'
          } />
          {phaseLabel && (
            <p className="text-xs text-muted-foreground text-center">{phaseLabel}</p>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <MiniStat label="Pages" value={`${audit?.pagesScanned ?? 0} / ${audit?.totalPages ?? '?'}`} icon={Globe} />
            <MiniStat label="Problèmes" value={`${audit?.issuesFound ?? 0}`} icon={AlertTriangle} />
            <MiniStat label="Score" value={audit?.globalScore !== null && audit?.globalScore !== undefined ? `${Math.round(audit.globalScore)}` : '--'} icon={CheckCircle2} />
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Terminal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="rounded-lg bg-black/90 dark:bg-black/50 p-4 font-mono text-xs text-green-400 space-y-0.5">
              {logs.length === 0 ? (
                <p className="text-green-400/50">En attente de logs...</p>
              ) : (
                logs.map((log, i) => <p key={i}>{log}</p>)
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {audit?.status === 'COMPLETED' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Button variant="gradient" size="lg" onClick={() => router.push(`/audit/${auditId}`)}>
            Voir le rapport <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {audit?.status === 'FAILED' && (
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Retour au dashboard</Button>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border p-2 sm:p-3">
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
        <p className="text-xs sm:text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
