# Architecture knowledge

System architecture, C4, and topology notes.

## Declared layers

Dependency-direction authority: `@rule:layer-boundaries` and `@rule:package-structure`
([rules/architecture/rules.md](../rules/architecture/rules.md#package-structure)).

Standard layered layout for Java projects once the layering trigger is met
(single package > 15 classes, two or more business domains, or a new Spring Boot web project):

```text
ui / controller -> service -> manager (optional) -> dao / mapper -> model
controller / service -> dto / model / constant; config assembles beans only
```

```text
backend/src/main/java/staffing/
├── Application.java
├── controller/   Web 层
├── service/      Service 层
├── dao/          DAO 层（JPA/JDBC）
├── dto/          边界传输对象
├── model/        领域对象
├── constant/     业务枚举与静态字典
├── config/       Spring 配置与组件装配
├── exception/    异常与统一错误处理
└── utils/        无状态通用工具（按需）
```

- 根包固定 `staffing`；Web 型项目全局按层，不建业务域目录层。
- `dao` (JPA/JDBC) 与 `mapper` (MyBatis) 二选一；`manager` 仅在确有第三方封装或多 DAO 组合时建立。
- 非 Web 小项目才按特性平铺在 `staffing.<feature>`，类职责仍按包分类表；本项目为 Web 型，固定全局按层。跨层捷径需 ADR 或例外记录。
- The React frontend lives in `frontend/` per `@rule:web-coding-style`, outside Java packages.

## Application topology

```text
browser / Playwright (frontend/, e2e/)
        |  HTTP + X-User-Id header
        v
backend/   Spring Boot 4.1 (Java 21), port 8080, wire prefix /api
  controller -> service -> dao (JDBC) -> H2 file database
        |            |
        |            +-> RosterSummaryService -> DatabaseRosterSummaryService（名单读取）
        |            +-> MailGateway -> LoggingMailGateway（邮件 Outbox 适配）
        +-> Flyway migrations (db/migration, forward-only, V1-V6)
openapi.yaml   contract source of truth（`npm run lint:api` 校验）
```

- 运行时：单进程由 `staffing.Application` 启动；Jackson 使用 `SNAKE_CASE` 且省略空字段；**没有定时任务**，复审提醒由 `POST /api/notifications/review-reminders/scan` 触发扫描。
- 持久化：H2 文件库 `./data/staffing`（PostgreSQL 模式）；Flyway 应用 `V1`-`V6`；Hibernate 只做 schema 校验（`ddl-auto=validate`）；仓储是 `dao` 接口背后的 JDBC 实现，命名 `DatabaseXxxRepository`。
- 身份（本地桩）：`X-User-Id` 由 `ActorArgumentResolver` 解析为 `staffing.model.UserAccount`；系统角色为 `project_owner` 与 `resource_coordinator`；生产前必须替换为真实认证。
- 可见性：在 service 层强制，UI 只做隐藏。项目负责人只看自己项目下的需求；协调员只看 `owner_coordinator_id` 为自己的需求。
- 名单读取端口：`RosterSummaryService` 由 `DatabaseRosterSummaryService` 基于已确认推荐实现；change C 落地后零值实现已移除。
- 通知端口：`MailGateway.send(Notification)`，本地适配器为 `LoggingMailGateway`；发送失败只记录 `failed` 并可在通知页重试，不阻断业务。
- HTTP 面：26 个端点，覆盖身份/字典、项目与需求、名单、候选池、筛选与答复、推荐与终审、通知；权威清单在 `interfaces/README.md`，schema 在 `openapi.yaml`。
- 前端（已落地）：React 19 + TypeScript + Vite 8，位于 `frontend/`；`src/` 含 `api.ts`、`types.ts`、`route.ts`、`App.tsx`、`main.tsx`、`components/`、业务目录（`demands`、`projects`、`candidates`、`screening`、`review`、`roster`、`notifications`）、`i18n/`、`utils/`；工具链基线见 `operations/README.md`。
- 端到端：`e2e/playwright.config.ts` 与 `e2e/tests/*.spec.ts`，覆盖需求登记、需求编辑与评分、候选池、筛选、推荐终审、名单计数、通知 Outbox、协调员只读八条流程。
- 仓库布局：`backend/`（Java 服务）、`frontend/`（React + Vite + TypeScript）、`e2e/`（Playwright）、`openapi.yaml`（契约）、`docs/knowledge/`（本知识库）、`openspec/`（规格与变更）。
