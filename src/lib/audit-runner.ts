import { prisma } from '@/lib/db';
import { crawlSite } from '@/lib/scanner/crawler';
import { runAllAnalyzers } from '@/lib/analyzers';
import { computeGlobalScore } from '@/lib/scoring';
import { addLog, updateAuditState, cleanupAuditState } from '@/lib/audit-state';
import type { ScanConfig, IssueCategory } from '@/types';

export async function runAudit(auditId: string, url: string, config: ScanConfig) {
  const log = (msg: string) => addLog(auditId, msg);

  try {
    await prisma.audit.update({ where: { id: auditId }, data: { status: 'CRAWLING', startedAt: new Date() } });
    updateAuditState(auditId, { status: 'CRAWLING' });
    log('Debut du crawl...');

    const pages = await crawlSite(url, config, auditId, log, (scanned, total) => {
      updateAuditState(auditId, { pagesScanned: scanned, totalPages: total });
    });

    await prisma.audit.update({
      where: { id: auditId },
      data: { status: 'ANALYZING', totalPages: pages.length, pagesScanned: pages.length },
    });
    updateAuditState(auditId, { status: 'ANALYZING', pagesScanned: pages.length, totalPages: pages.length });
    log(`Crawl termine. Analyse de ${pages.length} pages...`);

    const catScores: Record<string, number[]> = {};
    let totalIssues = 0;

    for (let i = 0; i < pages.length; i++) {
      const pd = pages[i];
      log(`Analyse page ${i + 1}/${pages.length}: ${pd.url}`);

      const result = await runAllAnalyzers(
        { url: pd.url, html: pd.html, screenshotPaths: pd.screenshots, pageTitle: pd.title },
        log
      );

      const pageScore = computeGlobalScore(result.scores);

      const pa = await prisma.pageAudit.create({
        data: {
          url: pd.url,
          title: pd.title,
          screenshots: JSON.stringify(pd.screenshots),
          performanceMetrics: JSON.stringify(result.metadata['PERFORMANCE'] || {}),
          pageScore: pageScore.global,
          scoreBreakdown: JSON.stringify(result.scores),
          statusCode: pd.statusCode,
          auditId,
        },
      });

      for (const issue of result.allIssues) {
        await prisma.issue.create({
          data: {
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            category: issue.category,
            framework: issue.framework,
            criterion: issue.criterion || null,
            selector: issue.selector || null,
            recommendation: issue.recommendation,
            effortLevel: issue.effortLevel,
            impact: issue.impact,
            codeSnippet: issue.codeSnippet || null,
            fixSnippet: issue.fixSnippet || null,
            auditId,
            pageAuditId: pa.id,
          },
        });
      }

      totalIssues += result.allIssues.length;
      updateAuditState(auditId, { issuesFound: totalIssues });

      for (const [cat, score] of Object.entries(result.scores)) {
        if (!catScores[cat]) catScores[cat] = [];
        catScores[cat].push(score);
      }
    }

    const avgScores: Record<string, number> = {};
    for (const [cat, scores] of Object.entries(catScores)) {
      avgScores[cat] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;
    }

    const globalResult = computeGlobalScore(avgScores as Record<IssueCategory, number>);

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        globalScore: globalResult.global,
        scoreBreakdown: JSON.stringify(avgScores),
        issuesFound: totalIssues,
        pagesScanned: pages.length,
        completedAt: new Date(),
      },
    });

    updateAuditState(auditId, { status: 'COMPLETED' });
    log(`Audit termine ! Score: ${globalResult.global}/100, ${totalIssues} issues.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    log(`ERREUR: ${msg}`);
    updateAuditState(auditId, { status: 'FAILED' });
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: 'FAILED', completedAt: new Date(), summary: `Erreur: ${msg}` },
    });
  } finally {
    cleanupAuditState(auditId);
  }
}
