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
