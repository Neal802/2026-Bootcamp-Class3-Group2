# Interfaces knowledge

API、事件与集成契约。字段一律 snake_case；时间字段为 RFC3339 UTC；错误响应只返回 `code`。

## REST 面

机器可读契约以 `openapi.yaml` 为准，`npm run lint:api` 必须通过。按能力分组：

| 能力 | 端点 |
|---|---|
| 身份 / 字典 | `GET /me`、`GET /enums`、`GET /health` |
| 项目与需求 | `GET/POST /projects`、`GET/POST /demands`、`GET/PATCH /demands/{id}`、`POST /demands/{id}/publish`、`POST /demands/{id}/close` |
| 名单与计数 | `GET /demands/{id}/summary`、`GET /demands/{id}/roster` |
| 候选池 | `GET/POST /candidates`、`PUT /candidates/{id}`、`POST /candidates/{id}/deactivate`、`POST /candidates/{id}/restore`、`POST /candidates/{id}/travel-review` |
| 筛选与答复 | `GET /demands/{id}/screening`、`POST /demands/{id}/answers` |
| 推荐与终审 | `GET/POST /recommendations`、`POST /recommendations/{id}/confirm`、`POST /recommendations/{id}/reject`、`POST /recommendations/{id}/withdraw`、`POST /recommendations/{id}/release-request`、`POST /recommendations/{id}/release` |
| 通知 | `GET /notifications`、`POST /notifications/{id}/retry`、`POST /notifications/review-reminders/scan` |

身份当前为 `X-User-Id` 演示桩，生产环境必须替换为真实认证；权限判定在服务层，UI 只做隐藏。

## 邮件通知契约

邮件由事务内的 Outbox（`notifications` 表）驱动，业务操作与发送结果解耦。

| 类型 | 触发 | 收件人 | 必含 payload |
|---|---|---|---|
| `recommendation_submitted` | 提交推荐 | 项目负责人 | `project`、`role`、`candidate`、`submittedBy`、`link`；跨角色时加 `crossRole` |
| `rejected` | 驳回推荐 | 负责协调员 | `project`、`role`、`candidate`、`rejectionReason`、`decidedBy` |
| `demand_changed` | 发布后编辑需求 | 负责协调员 | `project`、`role`、`summary` |
| `confirmed` | 终审确认 | 负责协调员 | `project`、`role`、`candidate`、`decidedBy` |
| `release_requested` | 协调员发起释放 | 项目负责人 | `project`、`role`、`candidate`、`requestedBy`；可选 `reason` |
| `released` | 负责人确认释放 | 负责协调员 | `project`、`role`、`candidate`、`releasedBy` |
| `review_reminder` | 复审到期前 30 天 | 全体资源协调员 | `candidate`、`dueDate`、`note` |

- 评分只存在于筛选结果与推荐/终审详情；邮件 payload **不得**出现 `score`、`threshold`、`breakdown` 等评分字段。
- 状态只有 `sent` 与 `failed`；失败时写入 `error` 摘要，不阻断业务，可在通知页重试。
- 通知内容只做摘要，完整业务以接口读取为准；幂等键为“事件 + 业务对象”。
