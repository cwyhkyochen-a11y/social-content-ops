#!/usr/bin/env tsx
import { getXTokens, saveXTokens } from '../src/integrations/x/token-store.js';
import { createTweet, uploadImage, uploadVideoStub } from '../src/integrations/x/client.js';
import { refreshAccessToken } from '../src/integrations/x/oauth.js';
import { attachPlatformPublishResult } from '../src/integrations/publish-log.js';
import { formatChineseNumberedPoints, splitThread } from '../src/integrations/x/formatter.js';

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
};
const getArgs = (name: string) => {
  const idx = args.indexOf(name);
  if (idx < 0) return [] as string[];
  const vals: string[] = [];
  for (let i = idx + 1; i < args.length && !args[i].startsWith('--'); i++) vals.push(args[i]);
  return vals;
};
const hasFlag = (name: string) => args.includes(name);

const accountId = getArg('--account-id');
const text = getArg('--text');
const taskId = getArg('--task-id');
const dryRun = hasFlag('--dry-run');
const asThread = hasFlag('--thread');
const images = getArgs('--images');
const video = getArg('--video');

if (!accountId || !text) {
  console.error('Usage: npx tsx scripts/x_post_api.ts --account-id <id> --text "hello" [--images a.png b.png] [--video v.mp4] [--thread] [--task-id <taskId>] [--dry-run]');
  process.exit(1);
}

let oauth = await getXTokens(accountId);
if (!oauth?.access_token) {
  console.error('No X oauth token found for account');
  process.exit(1);
}

const exp = oauth?.expires_at ? new Date(oauth.expires_at).getTime() : null;
const shouldRefresh = !!(exp && exp - Date.now() < 5 * 60 * 1000 && oauth.refresh_token);
if (shouldRefresh) {
  const clientId = process.env.X_CLIENT_ID || '';
  const clientSecret = process.env.X_CLIENT_SECRET || '';
  if (!clientId) {
    console.error('Token almost expired but X_CLIENT_ID missing for refresh');
    process.exit(1);
  }
  const token = await refreshAccessToken({
    refreshToken: oauth.refresh_token,
    clientId,
    clientSecret: clientSecret || undefined,
  });
  await saveXTokens(accountId, token, oauth.profile || null);
  oauth = await getXTokens(accountId);
}

const formatted = formatChineseNumberedPoints(text);
const mediaItems: Array<{ type: string; localPath?: string; id?: string }> = [];
let mediaIds: string[] = [];
if (images.length) {
  for (const img of images) {
    const mediaType = img.toLowerCase().endsWith('.jpg') || img.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : img.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/png';
    const mediaId = await uploadImage(oauth.access_token, img, mediaType);
    mediaIds.push(mediaId);
    mediaItems.push({ type: 'image', localPath: img, id: mediaId });
  }
}
if (video) {
  await uploadVideoStub();
}

const threadParts = asThread ? splitThread(formatted) : [formatted];

if (dryRun) {
  console.log(JSON.stringify({
    status: 'dry_run',
    accountId,
    textLength: formatted.length,
    parts: threadParts,
    mediaItems,
  }, null, 2));
  process.exit(0);
}

let first: any = null;
let prevId: string | undefined;
const results: any[] = [];
for (let i = 0; i < threadParts.length; i++) {
  const payload: any = { text: threadParts[i] };
  if (i === 0 && mediaIds.length) payload.media = { media_ids: mediaIds };
  if (prevId) payload.reply = { in_reply_to_tweet_id: prevId };
  const res = await createTweet(oauth.access_token, payload);
  if (!first) first = res;
  prevId = res?.data?.id;
  results.push(res);
}

if (taskId) {
  await attachPlatformPublishResult(taskId, {
    platform: 'x',
    accountId,
    platformPostId: first?.data?.id,
    url: first?.data?.id && oauth?.profile?.username ? `https://x.com/${oauth.profile.username}/status/${first.data.id}` : undefined,
    textPreview: formatted.slice(0, 140),
    raw: results,
    media: {
      type: video ? 'video' : (images.length ? (threadParts.length > 1 ? 'mixed' : 'image') : (threadParts.length > 1 ? 'thread' : 'text')),
      count: mediaItems.length,
      items: mediaItems,
    },
  });
}

console.log(JSON.stringify({
  status: 'published',
  first,
  threadCount: results.length,
  results,
  url: first?.data?.id && oauth?.profile?.username ? `https://x.com/${oauth.profile.username}/status/${first.data.id}` : undefined,
}, null, 2));
