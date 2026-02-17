import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuditState } from '@/lib/audit-state';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let audit: any = null;
  try {
    audit = await prisma.audit.findUnique({
      where: { id: params.id },
      include: { project: true },
    });
  } catch {
    return NextResponse.json({ error: 'DB non disponible' }, { status: 503 });
  }

  if (!audit) {
    return NextResponse.json({ error: 'Audit non trouve' }, { status: 404 });
  }

  const state = getAuditState(audit.id);

  return NextResponse.json({
    audit: {
      id: audit.id,
      status: state?.status || audit.status,
      pagesScanned: state?.pagesScanned ?? audit.pagesScanned,
      totalPages: state?.totalPages ?? audit.totalPages,
      issuesFound: state?.issuesFound ?? audit.issuesFound,
      globalScore: audit.globalScore,
      project: audit.project,
      createdAt: audit.createdAt,
      completedAt: audit.completedAt,
    },
    logs: state?.logs || [],
  });
}
