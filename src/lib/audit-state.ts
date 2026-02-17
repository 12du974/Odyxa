interface AuditState {
  logs: string[];
  status: string;
  pagesScanned: number;
  totalPages: number;
  issuesFound: number;
}

const states = new Map<string, AuditState>();

export function getAuditState(id: string): AuditState | undefined {
  return states.get(id);
}

export function initAuditState(id: string): AuditState {
  const s: AuditState = { logs: [], status: 'QUEUED', pagesScanned: 0, totalPages: 0, issuesFound: 0 };
  states.set(id, s);
  return s;
}

export function addLog(id: string, msg: string) {
  const s = states.get(id);
  if (s) s.logs.push(`[${new Date().toLocaleTimeString('fr-FR')}] ${msg}`);
}

export function updateAuditState(id: string, update: Partial<AuditState>) {
  const s = states.get(id);
  if (s) Object.assign(s, update);
}

export function cleanupAuditState(id: string) {
  setTimeout(() => states.delete(id), 10 * 60 * 1000);
}
