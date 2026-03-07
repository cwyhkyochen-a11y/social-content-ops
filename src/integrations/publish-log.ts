import { db, publishTasks } from '../db/index.js';
import { eq } from 'drizzle-orm';

export type PlatformPublishResult = {
  platform: string;
  accountId?: string;
  platformPostId?: string;
  url?: string;
  textPreview?: string;
  raw?: any;
  publishedAt?: string;
  media?: {
    type?: 'text' | 'image' | 'video' | 'thread' | 'mixed';
    count?: number;
    items?: Array<{ type: string; url?: string; id?: string; localPath?: string }>;
  };
};

export async function attachPlatformPublishResult(taskId: string, result: PlatformPublishResult) {
  const rows = await db.select().from(publishTasks).where(eq(publishTasks.id, taskId)).limit(1);
  const row = rows[0] as any;
  let content = row?.content;
  if (typeof content === 'string') {
    try { content = JSON.parse(content); } catch {}
  }
  const history = Array.isArray(content?.publish_results) ? content.publish_results : [];
  const next = {
    ...(content || {}),
    publish_results: [
      ...history,
      {
        ...result,
        publishedAt: result.publishedAt || new Date().toISOString(),
      }
    ]
  };
  await db.update(publishTasks)
    .set({
      content: next as any,
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(publishTasks.id, taskId));
}
