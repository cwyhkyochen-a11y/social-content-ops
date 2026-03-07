import fs from 'fs';

export type XCreatePostInput = {
  text: string;
  reply?: { in_reply_to_tweet_id: string };
  quote_tweet_id?: string;
  media?: { media_ids: string[] };
};

export async function createTweet(accessToken: string, input: XCreatePostInput) {
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`create_tweet_failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

export async function getMe(accessToken: string) {
  const res = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`get_me_failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function uploadMediaInit(accessToken: string, totalBytes: number, mediaType: string, mediaCategory = 'tweet_image') {
  const body = new URLSearchParams({
    command: 'INIT',
    total_bytes: String(totalBytes),
    media_type: mediaType,
    media_category: mediaCategory,
  });
  const res = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`x_media_init_failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function uploadMediaAppend(accessToken: string, mediaId: string, segmentIndex: number, buffer: Buffer) {
  const form = new FormData();
  form.append('command', 'APPEND');
  form.append('media_id', mediaId);
  form.append('segment_index', String(segmentIndex));
  form.append('media', new Blob([buffer]));
  const res = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`x_media_append_failed: ${res.status} ${txt}`);
  }
}

async function uploadMediaFinalize(accessToken: string, mediaId: string) {
  const body = new URLSearchParams({ command: 'FINALIZE', media_id: mediaId });
  const res = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`x_media_finalize_failed: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

export async function uploadImage(accessToken: string, filePath: string, mediaType = 'image/png') {
  const buffer = fs.readFileSync(filePath);
  const init = await uploadMediaInit(accessToken, buffer.length, mediaType, 'tweet_image');
  const mediaId = init.media_id_string;
  await uploadMediaAppend(accessToken, mediaId, 0, buffer);
  await uploadMediaFinalize(accessToken, mediaId);
  return mediaId;
}

export async function uploadVideoStub() {
  throw new Error('video_upload_not_implemented_yet');
}
