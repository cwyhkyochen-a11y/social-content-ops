# 多平台发布支持计划

## 目标平台

| 平台 | 优先级 | 技术方案 | 现有 Skill | 状态 |
|------|--------|----------|------------|------|
| **X (Twitter)** | P0 | CDP / API | baoyu-skills 有 post-to-x | 待集成 |
| **Instagram** | P1 | instagrapi / CDP | 需调研 | 待开发 |
| **Facebook** | P1 | facebook-sdk / CDP | 需调研 | 待开发 |
| **Threads** | P2 | threads-api / CDP | 需调研 | 待开发 |

---

## 推荐方案

### 1. X (Twitter) - 推荐方案 A: 使用 baoyu-skills

**baoyu-skills** 已内置 `post-to-x` 技能，可直接集成：

```bash
npx skills run post-to-x --content "Hello World" --image path/to/image.png
```

**优点**:
- 现成可用，无需开发
- 与现有 baoyu-skills 生态一致

**缺点**:
- 依赖外部 skill，控制粒度有限

### 2. X (Twitter) - 推荐方案 B: 自建 CDP 脚本

参考 redbookskills 的实现方式，创建 `x_publish.py`：
- 复用 chrome_launcher.py
- 复用 image_downloader.py
- 实现 X 的表单填写逻辑

**优点**:
- 完全自主可控
- 技术栈与小红书一致

**缺点**:
- 需要开发时间
- X 的反爬机制较强

### 3. Instagram - 推荐方案: instagrapi

使用 Python 库 `instagrapi`：

```python
from instagrapi import Client

cl = Client()
cl.login(username, password)
cl.photo_upload("path/to/image.jpg", "Caption here")
```

**优点**:
- 不依赖浏览器
- 速度快

**缺点**:
- 账号容易被风控
- 需要处理验证码/2FA

### 4. Facebook - 推荐方案: facebook-sdk

使用官方 SDK：

```python
import facebook

graph = facebook.GraphAPI(access_token)
graph.put_object("me", "feed", message="Hello")
```

**注意**:
- 需要申请 Facebook App
- 个人账号发布受限较多

### 5. Threads - 推荐方案: threads-api (非官方)

```bash
pip install threads-api
```

```python
from threads_api import ThreadsAPI

api = ThreadsAPI()
api.login(username, password)
api.publish("Hello Threads", image_path="image.jpg")
```

**注意**:
- 非官方 API，可能不稳定
- Threads 官方 API 刚开放，限制较多

---

## 现有 Skill 调研结果

### 已确认可用的 Skill

1. **baoyu-skills (jimliu/baoyu-skills)**
   - ✅ post-to-x (Twitter/X)
   - ✅ post-to-wechat (微信公众号)
   - ✅ xhs-images (小红书配图)

### 需进一步调研的 Skill

暂无发现专门支持 Instagram、Facebook、Threads 的 OpenClaw Skill。

---

## 建议实施方案

### Phase 1: X (Twitter)
**推荐**: 自建 CDP 脚本
- 技术栈与小红书一致
- 便于统一管理多账号
- 可深度定制发布逻辑

### Phase 2: Instagram
**推荐**: 使用 instagrapi
- 快速集成
- 社区成熟

### Phase 3: Facebook + Threads
**推荐**: 先用现有方案，等待更稳定的 Skill 出现

---

## 技术实现参考

### X (Twitter) 发布流程

```python
# scripts/x_publish.py

from chrome_launcher import ensure_chrome
from cdp_publish import CDPClient

class TwitterPublisher:
    COMPOSE_URL = "https://twitter.com/compose/tweet"
    
    def publish(self, text, images=None):
        # 1. 确保 Chrome 启动
        # 2. 导航到 compose 页面
        # 3. 填写文本
        # 4. 上传图片
        # 5. 点击发布
```

### X 平台特殊处理

1. **字符限制**: 280 字符（普通）/ 4000 字符（Twitter Blue）
2. **图片限制**: 最多 4 张
3. **视频限制**: 最长 2 分 20 秒
4. **反爬**: X 的反爬较强，需要模拟真实用户行为

---

## 下一步行动

1. **确认方案**: P0 X (Twitter) 使用自建 CDP 还是 baoyu-skills？
2. **调研 Instagram**: 测试 instagrapi 的稳定性
3. **等待社区**: 关注是否有新的 Threads Skill 出现
