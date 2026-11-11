# Knowledge log

Append-only timeline of KB changes.

| date | id | change | author |
|---|---|---|---|
| 2026-11-10 | kb.rules | 初始化 `rules/` MECE 骨架并落地团队 Java Code Style：`java-coding-style`、`java-testing`、`tdd-cycle`、`git-commit-conventions`、`code-review-checklist` | agent |
| 2026-11-10 | kb.index | `_INDEX.md` 补齐 rules 各分类条目与来源链接；`rules/quality/README`、`rules/testing/README` 标注已应用的 java 栈规则 | agent |
| 2026-11-10 | kb.rules.commit | Git 提交规则改为 spec 级：verify 通过后一次、archive 之后一次；冲突处以 `git-commit-conventions` 为准，同步调整 `tdd-cycle`、`code-review-checklist`、`rules/README`、`_INDEX.md` | agent |
| 2026-11-10 | kb.rules.v2 | 吸收团队 v2 规范（`class3-group2-*-20261110-v2`）中未覆盖部分：新增 `naming-conventions`、`web-coding-style`、`web-testing`、`api-contract`、`git-branching-and-pr`、`document-conventions`、`sdd-artifacts` 七条；补齐 `java-coding-style`、`java-testing`、`java-patterns`、`spec-first`、`code-review-checklist`；规则总数 24 → 31 | agent |
| 2026-11-10 | kb.index | `_INDEX.md` 增补上述七条规则条目；`rules/README` 增加团队六条原则与两批规则表 | agent |
| 2026-11-10 | kb.rules.consolidate | 规则目录重构为 `rules/<category>/rules.md` 单文件并全中文；`_INDEX.md` 改为每分类一行、`rules/_INDEX.md` 改为规则内锚点表；`rules/README.md` 与 `_SCHEMA.md` 中文化；修正规则总数口径为 24 条（31 是原文件数） | agent |
| 2026-11-11 | kb.rules.package-structure | 新增 `package-structure` 规则（标准分层包分类与依赖方向），衔接 `java-patterns` / `java-coding-style`；`architecture/README.md` 补 Declared layers；规则总数 24→25；首次建立 `.qoder/rules/ai4se` 投影 | agent |
| 2026-11-11 | kb.rules.package-structure.v2 | 参照阿里巴巴开发手册扩展为完整应用分层（Manager 可选层、DO/DTO/BO/Query/VO 概念映射、分层异常职责、前端目录层映射、仓库级结构）；适用栈扩为 java,react,typescript；规则总数不变 25 | agent |
| 2026-11-11 | kb.rules.layout.staffing | 后端实际布局切换为 `staffing/<layer>` 全局按层（65 个 Java 文件搬移，`mvnw clean test` 49 项通过）；同步 `package-structure`、`java-coding-style`、`code-review-checklist`、`architecture/README` 与仓库级结构；新增 constant/config 层语义 | agent |
| 2026-11-11 | kb.architecture.topology-domain.vocabulary | `architecture/README.md` 补应用拓扑（Spring Boot 4.1 / Java 21、H2 + Flyway、`X-User-Id` stub、服务端可见性、名单读取端口与 HTTP 面）；`domain/README.md` 补上下文地图、术语表（含 wire 值）与不变量，`domain/shared` 改为指向唯一术语表；`scripts/verify-links.sh` 由占位改为复用 `portability.test.mjs` 的 Markdown 链接检查 | agent |
| 2026-11-11 | kb.operations.frontend-toolchain | 新增前端工具链基线（Vite 8/Rolldown、plugin-react 6、vitest 5，esbuild 已退出依赖树）与 `Cannot read directory ... Access is denied` 故障的排查顺序；登记不得回退 Vite 7 + esbuild；build/test/dev 三项为验收口径 | agent |
| 2026-11-11 | kb.domain.candidate-scoring | `domain/README.md` 补候选池、筛选、推荐与通知上下文，新增候选人/复审状态/跨角色补位/评分/阈值/快照/推荐状态/释放申请/通知术语与不变量，来源扩展到 B/C/D Delta | agent |
| 2026-11-11 | kb.interfaces.notification | `interfaces/README.md` 补 REST 能力分组与邮件通知契约：七类通知的收件人、必含 payload、`sent`/`failed` 语义、失败不阻断与“邮件不含评分”约束 | agent |
| 2026-11-11 | kb.operations.notification | `operations/README.md` 补 `MailGateway` 适配、失败记录与重试、复审提醒扫描与周期幂等、演示数据 V5/V6 说明 | agent |
| 2026-11-11 | kb.align.code-structure | 按当前代码对齐规范：architecture 拓扑补 `V1`-`V6`、`DatabaseRosterSummaryService`、`MailGateway`/`LoggingMailGateway`、26 个端点、前端与 e2e 已落地；package-structure/java-patterns 补端口命名（`XxxGateway`、`DatabaseXxxService`）并收紧 manager 触发条件；java-coding-style 修正测试放置（HTTP 接口测试统一 `staffing/controller`）；web-coding-style 补 `route.ts` 与依赖基线指针；code-review-checklist 增分层归属与测试放置检查；operations 补后端运行与验证命令 | agent |
