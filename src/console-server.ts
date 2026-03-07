#!/usr/bin/env tsx
import express from 'express';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { db, targetAccounts, publishTasks } from './db/index.js';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

const app = express();
const PORT = Number(process.env.CONTENT_OPS_CONSOLE_PORT || process.env.PORT || 3210);
const HOST = process.env.CONTENT_OPS_CONSOLE_HOST || '127.0.0.1';
const ROOT = path.resolve(path.join(path.dirname(new URL(import.meta.url).pathname), '..'));
const WORKSPACE_ROOT = path.resolve(ROOT, '..', '..');
const PUBLIC_DIR = path.join(ROOT, 'console-public');
const MEDIA_DIR = path.join(WORKSPACE_ROOT, 'content-ops-workspace', 'console-uploads');

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(MEDIA_DIR, { recursive: true });

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(MEDIA_DIR));
app.use(express.static(PUBLIC_DIR));

function safeJsonParse<T = any>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function extractAuthorizedAt(row: any): string | null {
  const apiConfig = safeJsonParse<any>(row.apiConfig, {});
  return apiConfig.authorized_at || apiConfig.created_at || row.createdAt || null;
}

function isAccountUsable(row: any): boolean {
  if (row.status !== 'active') return false;
  const apiConfig = safeJsonParse<any>(row.apiConfig, {});
  if (row.platform === 'x') {
    return !!(apiConfig.access_token || apiConfig.password || apiConfig.refresh_token);
  }
  return !!(apiConfig.access_token || apiConfig.token || apiConfig.password || apiConfig.token_file || apiConfig.access_token_file);
}

async function listAccounts() {
  const rows = await db.select().from(targetAccounts).orderBy(targetAccounts.platform, targetAccounts.accountName);
  return rows.map((row: any) => ({
    id: row.id,
    name: row.accountName,
    platform: row.platform,
    homepageUrl: row.homepageUrl,
    authorizedAt: extractAuthorizedAt(row),
    status: row.status,
    usable: isAccountUsable(row),
    accountId: row.accountId,
  }));
}

async function listPublishRecords(limit = 100) {
  const rows = await db.select({
    id: publishTasks.id,
    taskName: publishTasks.taskName,
    status: publishTasks.status,
    content: publishTasks.content,
    generatedImages: publishTasks.generatedImages,
    createdAt: publishTasks.createdAt,
    updatedAt: publishTasks.updatedAt,
    publishedAt: publishTasks.publishedAt,
    reviewNotes: publishTasks.reviewNotes,
    targetAccountId: publishTasks.targetAccountId,
    accountName: targetAccounts.accountName,
    platform: targetAccounts.platform,
    homepageUrl: targetAccounts.homepageUrl,
  }).from(publishTasks)
    .leftJoin(targetAccounts, eq(publishTasks.targetAccountId, targetAccounts.id))
    .orderBy(desc(publishTasks.createdAt))
    .limit(limit);

  return rows.map((row: any) => {
    const content = safeJsonParse<any>(row.content, {});
    const publishResults = Array.isArray(content.publish_results) ? content.publish_results : [];
    const lastResult = publishResults[publishResults.length - 1] || null;
    return {
      id: row.id,
      taskName: row.taskName,
      status: row.status,
      platform: row.platform,
      accountName: row.accountName,
      homepageUrl: row.homepageUrl,
      targetAccountId: row.targetAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
      reviewNotes: row.reviewNotes,
      text: content.body || content.text || content.caption || '',
      title: content.title || '',
      link: content.link || '',
      media: Array.isArray(content.media) ? content.media : [],
      publishResults,
      lastResult,
    };
  });
}

app.get('/api/accounts', async (_req, res) => {
  res.json({ items: await listAccounts() });
});

app.get('/api/publish-records', async (req, res) => {
  const limit = Number(req.query.limit || 100);
  res.json({ items: await listPublishRecords(limit) });
});

app.post('/api/publish', async (req, res) => {
  try {
    const { targetAccountId, text, title, link, media = [] } = req.body || {};
    if (!targetAccountId) return res.status(400).json({ error: 'missing targetAccountId' });
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'missing text' });

    const accountRows = await db.select().from(targetAccounts).where(eq(targetAccounts.id, String(targetAccountId))).limit(1);
    const account = accountRows[0] as any;
    if (!account) return res.status(404).json({ error: 'target account not found' });

    const normalizedMedia = Array.isArray(media) ? media.filter(Boolean).map(String) : [];
    const taskId = randomUUID();
    const now = new Date();

    await db.insert(publishTasks).values({
      id: taskId,
      taskName: String(title || `${account.platform}:${account.accountName}:${now.toISOString()}`),
      targetAccountId: String(targetAccountId),
      status: 'approved',
      contentType: normalizedMedia.some((m: string) => /\.(mp4|mov|avi|mkv)$/i.test(m)) ? 'video' : (normalizedMedia.length ? 'image' : 'original'),
      content: {
        title: String(title || ''),
        body: String(text),
        text: String(text),
        link: String(link || ''),
        media: normalizedMedia,
      } as any,
      createdBy: 'content-ops-console',
      reviewedBy: 'content-ops-console',
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    res.json({ ok: true, taskId, account: { id: account.id, name: account.accountName, platform: account.platform } });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) });
  }
});

app.post('/api/upload-base64', async (req, res) => {
  try {
    const { filename, contentType, data } = req.body || {};
    if (!data) return res.status(400).json({ error: 'missing data' });
    const safeName = String(filename || `upload-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(safeName) || (String(contentType || '').includes('video') ? '.mp4' : '.bin');
    const finalName = path.basename(safeName, path.extname(safeName)) + ext;
    const outPath = path.join(MEDIA_DIR, `${Date.now()}-${finalName}`);
    const base64 = String(data).includes(',') ? String(data).split(',').pop()! : String(data);
    fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
    res.json({ ok: true, path: outPath, url: `/uploads/${path.basename(outPath)}` });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) });
  }
});

app.post('/api/publish/:taskId/execute', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { spawn } = await import('child_process');
    const proc = spawn('python3', [path.join(ROOT, 'scripts', 'publish-dispatch.py'), '--task-id', taskId, '--execute'], {
      cwd: WORKSPACE_ROOT,
      env: process.env,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => stdout += String(d));
    proc.stderr.on('data', (d) => stderr += String(d));
    proc.on('close', (code) => {
      res.status(code === 0 ? 200 : 500).json({ ok: code === 0, code, stdout, stderr });
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, host: HOST, port: PORT });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`content-ops console listening on http://${HOST}:${PORT}`);
});
