#!/usr/bin/env tsx
import { getXTokens } from '../src/integrations/x/token-store.js';
import { createTweet } from '../src/integrations/x/client.js';

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
};

const accountId = getArg('--account-id');
const text = getArg('--text');

if (!accountId || !text) {
  console.error('Usage: npx tsx scripts/x_post_api.ts --account-id <id> --text "hello"');
  process.exit(1);
}

const oauth = await getXTokens(accountId);
if (!oauth?.access_token) {
  console.error('No X oauth token found for account');
  process.exit(1);
}

const res = await createTweet(oauth.access_token, { text });
console.log(JSON.stringify(res, null, 2));
