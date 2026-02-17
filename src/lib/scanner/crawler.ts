import { chromium, type Browser } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import type { ScanConfig, Viewport } from '@/types';

export interface PageData {
  url: string;
  title: string | null;
  html: string;
  statusCode: number;
  screenshots: Record<string, string>;
}

export async function crawlSite(
  startUrl: string,
  config: ScanConfig,
  auditId: string,
  onLog: (msg: string) => void,
  onProgress: (scanned: number, total: number) => void
): Promise<PageData[]> {
  const pages: PageData[] = [];
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
  const baseUrl = new URL(startUrl);

  const screenshotDir = path.join(process.cwd(), 'public', 'screenshots', auditId);
  fs.mkdirSync(screenshotDir, { recursive: true });

  let browser: Browser | null = null;

  try {
    onLog('Lancement du navigateur headless Chromium...');
    browser = await chromium.launch({ headless: true });

    while (queue.length > 0 && pages.length < config.maxPages) {
      const item = queue.shift()!;
      const normalized = normalizeUrl(item.url);
      if (visited.has(normalized)) continue;
      visited.add(normalized);

      onLog(`[${pages.length + 1}/${config.maxPages}] Scan: ${item.url} (profondeur ${item.depth})`);
      onProgress(pages.length, Math.min(queue.length + pages.length + 1, config.maxPages));

      try {
        const ctx = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        });
        const page = await ctx.newPage();
        let statusCode = 200;
        page.on('response', (r) => {
          if (r.url() === item.url || r.url() === item.url + '/') statusCode = r.status();
        });

        await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(800);

        const title = await page.title();
        const html = await page.content();
        const screenshots: Record<string, string> = {};

        for (const vp of config.viewports) {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.waitForTimeout(300);
          const fname = `p${pages.length}-${vp.name}.png`;
          const fpath = path.join(screenshotDir, fname);
          await page.screenshot({ path: fpath, fullPage: true });
          screenshots[vp.name] = `/screenshots/${auditId}/${fname}`;
        }

        await ctx.close();
        pages.push({ url: item.url, title, html, statusCode, screenshots });

        if (item.depth < config.maxDepth) {
          const links = extractLinks(html, baseUrl);
          for (const link of links) {
            if (!visited.has(normalizeUrl(link)) && pages.length + queue.length < config.maxPages) {
              queue.push({ url: link, depth: item.depth + 1 });
            }
          }
          onLog(`  -> ${links.length} liens internes trouves`);
        }

        if (config.delayBetweenRequests > 0) {
          await new Promise((r) => setTimeout(r, config.delayBetweenRequests));
        }
      } catch (err) {
        onLog(`  x Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
      }
    }

    onProgress(pages.length, pages.length);
    onLog(`Crawl termine: ${pages.length} pages scannees`);
  } finally {
    if (browser) await browser.close();
  }

  return pages;
}

function extractLinks(html: string, baseUrl: URL): string[] {
  const links: string[] = [];
  const regex = /href=["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      const href = m[1];
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
      const abs = new URL(href, baseUrl.origin);
      if (abs.hostname === baseUrl.hostname) {
        abs.hash = '';
        links.push(abs.toString());
      }
    } catch { /* skip */ }
  }
  return [...new Set(links)];
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    let p = u.pathname;
    if (p.endsWith('/') && p.length > 1) p = p.slice(0, -1);
    return `${u.origin}${p}${u.search}`;
  } catch { return url; }
}
