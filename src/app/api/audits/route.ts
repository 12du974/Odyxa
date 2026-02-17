import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { initAuditState } from '@/lib/audit-state';
import { runAudit } from '@/lib/audit-runner';
import { DEFAULT_VIEWPORTS, ALL_CATEGORIES, type ScanConfig } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, url, maxPages = 10, maxDepth = 2, categories } = body;

    if (!projectName || !url) {
      return NextResponse.json({ error: 'projectName et url sont requis' }, { status: 400 });
    }

    try { new URL(url); } catch {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    let project = await prisma.project.findFirst({ where: { url } });
    if (!project) {
      project = await prisma.project.create({ data: { name: projectName, url } });
    }

    const scanConfig: ScanConfig = {
      maxPages: Math.min(Math.max(1, maxPages), 100),
      maxDepth: Math.min(Math.max(0, maxDepth), 5),
      viewports: DEFAULT_VIEWPORTS,
      delayBetweenRequests: 1000,
      categories: categories || ALL_CATEGORIES,
    };

    const audit = await prisma.audit.create({
      data: { projectId: project.id, configSnapshot: JSON.stringify(scanConfig), totalPages: scanConfig.maxPages },
    });

    initAuditState(audit.id);
    runAudit(audit.id, url, scanConfig);

    return NextResponse.json({ auditId: audit.id, projectId: project.id });
  } catch (err) {
    console.error('Error creating audit:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function GET() {
  const audits = await prisma.audit.findMany({
    include: { project: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ audits });
}
