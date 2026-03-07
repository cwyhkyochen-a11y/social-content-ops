#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { buildAuthorizeUrl, generatePKCE, generateState } from '../src/integrations/x/oauth.js';

const CLIENT_ID = process.env.X_CLIENT_ID || '';
const REDIRECT_URI = process.env.X_REDIRECT_URI || '';
const TARGET_ACCOUNT_ID = process.env.X_TARGET_ACCOUNT_ID || '';
const STATE_FILE = process.env.X_OAUTH_STATE_FILE || path.join(process.cwd(), 'content-ops-workspace', 'tmp', 'x-oauth-state.json');
const scopes = (process.env.X_SCOPES || 'tweet.read tweet.write users.read offline.access').split(/[ ,]+/).filter(Boolean);

if (!CLIENT_ID || !REDIRECT_URI) {
  console.error('Missing X_CLIENT_ID or X_REDIRECT_URI');
  process.exit(1);
}

fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
const state = generateState();
const pkce = generatePKCE();
fs.writeFileSync(STATE_FILE, JSON.stringify({
  state,
  verifier: pkce.verifier,
  targetAccountId: TARGET_ACCOUNT_ID || null,
  createdAt: new Date().toISOString(),
}, null, 2));

const url = buildAuthorizeUrl({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  scopes,
}, state, pkce.challenge);

console.log(url);
