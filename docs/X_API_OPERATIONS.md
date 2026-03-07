# X API 日常操作说明

## 环境变量

```bash
export X_CLIENT_ID='你的 client id'
export X_CLIENT_SECRET='你的 client secret'
export X_REDIRECT_URI='https://xauth.kyochen.art/auth/x/callback'
export X_SCOPES='tweet.read tweet.write users.read offline.access'
```

## 1. 生成授权链接

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_oauth_start.ts
```

## 2. 刷新 token

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_refresh_token.ts --account-id <ACCOUNT_ID>
```

## 3. 干跑发帖

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_post_api.ts --account-id <ACCOUNT_ID> --text "test" --dry-run
```

## 4. 正式发帖

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_post_api.ts --account-id <ACCOUNT_ID> --text "test"
```

## 5. 自动线程

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_post_api.ts --account-id <ACCOUNT_ID> --text "很长的内容" --thread
```

## 6. 图片发帖

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_post_api.ts --account-id <ACCOUNT_ID> --text "配图内容" --images a.png b.jpg
```

## 7. 绑定 publish task

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_post_api.ts --account-id <ACCOUNT_ID> --task-id <PUBLISH_TASK_ID> --text "test"
```

## 当前已知限制

- 当前支持文本、自动 thread、图片上传
- 视频上传接口保留为占位，尚未完成
- 如 token 临近过期，会自动尝试 refresh
- 若 refresh 失败，需重新授权
- 中文 numbered list 会自动优化为更适合 X 的换行格式
