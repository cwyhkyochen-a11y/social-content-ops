# X API 接入与开发者后台填写指南

## 当前新增能力

已补充最小可用的 X 官方 API 发布链路：

- OAuth 2.0 + PKCE 授权启动脚本
- 回调服务 `/auth/x/callback`
- token 持久化到 `target_accounts.api_config.oauth`
- 官方 API 文本发帖脚本
- 对外页面：`/x/app`、`/privacy`、`/terms`

## 一、开发者后台建议填写

假设服务器公网 IP 为 `YOUR_SERVER_IP`，回调服务跑在 3000 端口：

- Callback URI / Redirect URL:
  - `http://YOUR_SERVER_IP:3000/auth/x/callback`
- Website URL:
  - `http://YOUR_SERVER_IP:3000/x/app`
- Organization name:
  - 你的组织名 / 个人名称
- Organization URL:
  - `http://YOUR_SERVER_IP:3000/x/app`
- Terms of Service:
  - `http://YOUR_SERVER_IP:3000/terms`
- Privacy Policy:
  - `http://YOUR_SERVER_IP:3000/privacy`

> 说明：正式生产更建议 HTTPS + 域名。当前先用 IP 跑通开发测试。

## 二、环境变量

```bash
export X_CLIENT_ID='你的 client id'
export X_CLIENT_SECRET='你的 client secret'
export X_REDIRECT_URI='http://YOUR_SERVER_IP:3000/auth/x/callback'
export X_SCOPES='tweet.read tweet.write users.read offline.access'
# 可选
export X_TARGET_ACCOUNT_ID='已有 target_accounts.id'
```

## 三、启动回调服务

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_oauth_callback_server.ts
```

## 四、生成授权链接

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_oauth_start.ts
```

打开输出的 URL 完成授权。

## 五、测试文本发布

```bash
cd ~/.openclaw/workspace/skills/content-ops
npx tsx scripts/x_post_api.ts --account-id <ACCOUNT_ID> --text "Hello from X API"
```

## 六、当前限制

- 当前只完成 **文本发帖**
- 图片/视频 media upload 还没接
- token 暂存于 `target_accounts.api_config.oauth`，后续推荐拆成独立 oauth 表
- 当前对外页面为最小模板，够开发者后台先填写，但不算正式法务版
