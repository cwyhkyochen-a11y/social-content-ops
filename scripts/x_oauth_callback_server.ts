#!/usr/bin/env tsx
import http from 'http';
import fs from 'fs';
import path from 'path';
import { exchangeCodeForToken } from '../src/integrations/x/oauth.js';
import { getMe } from '../src/integrations/x/client.js';
import { saveXTokens, createPlaceholderXTargetAccount } from '../src/integrations/x/token-store.js';

const PORT = Number(process.env.X_OAUTH_PORT || 3000);
const STATE_FILE = process.env.X_OAUTH_STATE_FILE || path.join(process.cwd(), 'content-ops-workspace', 'tmp', 'x-oauth-state.json');
const CLIENT_ID = process.env.X_CLIENT_ID || '';
const CLIENT_SECRET = process.env.X_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.X_REDIRECT_URI || '';

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ok');
      return;
    }

    if (url.pathname === '/privacy') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(process.cwd(), 'docs', 'legal', 'privacy-policy.html'), 'utf8'));
      return;
    }

    if (url.pathname === '/terms') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(process.cwd(), 'docs', 'legal', 'terms-of-service.html'), 'utf8'));
      return;
    }

    if (url.pathname === '/x/app') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(process.cwd(), 'docs', 'legal', 'x-app-home.html'), 'utf8'));
      return;
    }

    if (url.pathname !== '/auth/x/callback') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const saved = readState();

    if (!code || !state || !saved) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('missing code/state or local auth state');
      return;
    }

    if (state !== saved.state) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('state mismatch');
      return;
    }

    const token = await exchangeCodeForToken({
      code,
      codeVerifier: saved.verifier,
      redirectUri: REDIRECT_URI,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET || undefined,
    });

    const me = await getMe(token.access_token);
    const username = me?.data?.username || me?.data?.name || 'x-user';
    const accountId = saved.targetAccountId || await createPlaceholderXTargetAccount(username);
    await saveXTokens(accountId, token, me?.data || null);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<html><body><h1>X 授权成功</h1><p>账号已绑定。</p><pre>${JSON.stringify({ accountId, me: me?.data }, null, 2)}</pre></body></html>`);
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(err?.stack || err));
  }
});

ensureDir(STATE_FILE);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`X OAuth callback server listening on 0.0.0.0:${PORT}`);
});
