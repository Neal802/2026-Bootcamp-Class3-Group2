# Operations knowledge

Ops, monitoring, incident, and release notes.

## 通知与复审提醒运行说明

- 邮件发送通过 `MailGateway` 适配：默认 `LoggingMailGateway` 只记录收件人与摘要，不连接真实 SMTP；接入真实邮件服务时替换该 Bean。
- 发送异常由 `NotificationService.record` 捕获并记为 `failed`，业务事务不回滚；失败记录在 `GET /api/notifications` 可见，并可用 `POST /api/notifications/{id}/retry` 重试。
- 复审提醒由 `ReviewReminderService` 扫描：复审到期日取自 `travel_reviewed_at + 6 个月`，到期前 30 天向“全体资源协调员”发送一封；同一候选人同一到期日只发一封（`payload` 中的候选人 + 到期日去重）。
- 演示数据 `V5` 预置一条失败的复审提醒（吴迪，到期日 2026-11-07），用于展示失败列表与重试；`V6` 回填该候选人的复审日期，使其状态推导为过期。
- 复审完成入口：`POST /api/candidates/{id}/travel-review`，将最近复审日期置为当天并顺延六个月。
- 演示环境不提供定时任务；提醒扫描由协调员在通知页手动触发（`POST /api/notifications/review-reminders/scan`），生产环境接入调度器时复用同一服务方法。

## 前端工具链基线

`frontend/` 的依赖版本以本节为准，升级前先核对本表。

| 依赖 | 版本基线 | 说明 |
|---|---|---|
| `vite` | ^8.3.5（实测 8.3.8） | Vite 8 内置 Rolldown，**不再依赖 esbuild** |
| `@vitejs/plugin-react` | ^6.3.0 | 与 Vite 8 配套 |
| `vitest` | ^5.1.0 | 配置文件从 `vitest/config` 导入 `defineConfig` |
| `typescript` | ^5.9 | `npm run build` 先执行 `tsc --noEmit` |
| `react` / `react-dom` | ^19 | — |

- 配置文件固定 `frontend/vite.config.ts`，不再使用 `vite.config.mjs`。
- `/api` 代理指向 `http://localhost:8080`；后端未启动时出现 `ECONNREFUSED` 属正常。
- 现有 5 个测试文件均为纯函数测试，**不安装** `jsdom` 与 `@testing-library`；新增 DOM 测试时再补。

### 已知故障：`Cannot read directory ... Access is denied`

**症状**

```text
X [ERROR] Cannot read directory "../../../../../../..": Access is denied.
X [ERROR] Could not resolve "...\frontend\vite.config.ts"
failed to load config from ...\frontend\vite.config.ts
```

**根因**：`vite` 7.x 依赖 `esbuild`；本机 Windows 下 esbuild 0.28.x 解析配置文件时会向上遍历到盘符根目录被拒，导致连已存在的配置文件都无法加载。Vite 8 改用 Rolldown，不经过 esbuild，因此不会触发。

**排查顺序**

1. 读取 `node_modules/vite/package.json` 确认主版本为 8，并检查 `node_modules/esbuild` **不存在**。
2. 若 `esbuild` 仍在，说明依赖树仍是 Vite 7：把 `package.json` 的 `vite`、`@vitejs/plugin-react`、`vitest` 对齐上表后执行 `npm install`（会移除 esbuild 及旧依赖）。
3. 确认配置文件为 `vite.config.ts`，且从 `vitest/config` 导入 `defineConfig`。
4. 三项验证：`npm run build`、`npm test`、`npm run dev`；dev 启动后访问 `http://localhost:5173/` 应为 HTTP 200。

**不要**回退到 Vite 7 + esbuild 组合。“依赖装齐、版本自洽”不代表可运行，必须以上述三项验证为准。

## 后端运行与验证

```text
Windows     mvnw.cmd clean test          # 全量测试
Windows     mvnw.cmd spring-boot:run     # 启动 8080
其他平台     ./mvnw clean test / ./mvnw spring-boot:run
```

- 工作目录为 `backend/`；数据文件 `backend/data/staffing.mv.db`，Flyway 启动时自动应用 `V1`-`V6`，迁移只增不改。
- 冒烟：`GET http://localhost:8080/api/health`；其余请求通过 `X-User-Id` 演示桩识别身份。
- 契约校验：仓库根执行 `npm run lint:api`（Redocly 校验 `openapi.yaml`）。
- 端到端：仓库根执行 `npm run test:e2e`（`e2e/playwright.config.ts`），需后端已启动。
