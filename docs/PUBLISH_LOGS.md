# 通用发布日志约定

所有平台发布结果建议统一写入 `publish_tasks.content.publish_results` 数组。

单条结果结构：

```json
{
  "platform": "x",
  "accountId": "target account id",
  "platformPostId": "platform native post id",
  "url": "https://...",
  "textPreview": "前 140 字预览",
  "publishedAt": "2026-03-07T12:34:56.000Z",
  "media": {
    "type": "text|image|video|thread|mixed",
    "count": 2,
    "items": [
      {"type": "image", "id": "...", "localPath": "/tmp/a.png"}
    ]
  },
  "raw": {}
}
```

## 设计目标

- 多平台复用，不把结构绑死到 X
- 支持多次发布历史保留
- 支持后续接 Pinterest / Threads / Facebook / Instagram
- 可直接用于看板、审计、失败排查
