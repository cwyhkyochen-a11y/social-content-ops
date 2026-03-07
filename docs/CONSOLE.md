# content-ops 控制台

## 目标

提供一个默认本地运行的控制台，用于：

- 主动选择平台/账号创建发帖任务
- 上传图片/视频并写入本地媒体目录
- 查看代运营账号列表（只读）
- 查看发帖记录（成功 / 失败 / 待执行）

## 启动

```bash
cd /root/.openclaw/workspace/skills/content-ops
npm run console
```

默认监听：

- Host: `127.0.0.1`
- Port: `3210`

可通过环境变量覆盖：

```bash
CONTENT_OPS_CONSOLE_HOST=0.0.0.0 CONTENT_OPS_CONSOLE_PORT=3210 npm run console
```

## 页面能力

### 1. 代运营账号列表

只读展示：

- 名称
- 平台
- 主页地址
- 授权时间（从 `api_config.authorized_at/created_at` 推断）
- 当前是否可用

### 2. 手动发帖

表单支持：

- 选择目标账号
- 输入标题/任务名
- 输入正文
- 输入链接
- 上传图片/视频（多选）

控制台不会直接绕过调度层发帖，而是：

- 在 `publish_tasks` 新建一条任务
- 状态默认置为 `approved`
- 后续仍由 `publish-dispatch.py --task-id ... --execute` 执行发布

### 3. 发布记录

展示：

- 任务名 / 标题
- 平台 / 账号
- 当前状态
- 正文预览
- 创建/发布时间
- 发布结果链接
- 平台原生 post id
- 失败说明 / 备注

## 媒体上传

上传的文件默认保存到：

```text
/root/.openclaw/workspace/content-ops-workspace/console-uploads/
```

前端会先把文件转成 base64 上传，再由后端落盘，最终将本地路径写入 `publish_tasks.content.media`。
