# Rules change log

| date | id | change | author |
|---|---|---|---|
| 2026-11-10 | rules-init | `/sdd:rules-govern --mode init --langs java` 生成 MECE 骨架（common 15 + java 5） | agent |
| 2026-11-10 | java-coding-style | 以团队《Code Style Guide》§2–§4 替换 pack 默认 Java 编码风格（命名、金额、常量、布局、业务表达、注释） | agent |
| 2026-11-10 | java-testing | 以团队 §5–§8、§11 替换 pack 默认 Java 测试规则（`in_*_out_*` 命名、Given / When / Then、`assertAll`、边界值） | agent |
| 2026-11-10 | tdd-cycle | 新增 Red / Green / Refactor 循环规则（Critical，取自 §9） | agent |
| 2026-11-10 | git-commit-conventions | 新增小步提交、`<type>(<phase>): <description>` 与提交前验证规则（取自 §10） | agent |
| 2026-11-10 | code-review-checklist | 新增生产代码 / 测试代码 / TDD 与 Git 三段评审清单（取自 §12） | agent |
| 2026-11-10 | git-commit-conventions | **提交时机改为 spec 级**：一个 change 在 `/opsx verify` 通过后、`/opsx archive` 之后各提交一次；格式改为 `<type>(<stage>): <change-id> <description>`；Priority 升为 Critical。取代原「按 TDD 步骤小步提交」 | agent |
| 2026-11-10 | tdd-cycle | 移除「Red / Green / Refactor 分别提交」表述，改为不提交的工作纪律；Red 证据转由 verify 报告承载；新增「未在 verify 前提交中间态」检查项 | agent |
| 2026-11-10 | code-review-checklist | TDD 与 Git 段改为校验 spec 级两次提交与 message 格式，新增「无 TDD 中间提交」「archive 提交范围」检查项 | agent |
| 2026-11-10 | naming-conventions | 新增跨端命名速查、金额字段语义（含 `voucher`）与术语唯一性（取自团队规范总览 §4） | agent |
| 2026-11-10 | web-coding-style | 新增前端 Web 编码风格：目录、命名、组件、请求层、类型与状态、样式、可访问性、i18n（取自 v2 前端规范） | agent |
| 2026-11-10 | web-testing | 新增前端三层测试、用例命名、语义化查询与提交前验证（取自 v2 前端规范测试段） | agent |
| 2026-11-10 | api-contract | 新增接口契约规则：契约先行四步、路径与字段格式、Schema、状态码与错误码、版本兼容、前后端同步（取自 v2 契约规范） | agent |
| 2026-11-10 | git-branching-and-pr | 新增分支策略、PR 五要素、换行符与编码、不提交内容、回滚（取自 v2 Git 规范；**不采纳**其 TDD 三步提交与 `<phase>` 格式，提交时机仍以 git-commit-conventions 为准） | agent |
| 2026-11-10 | document-conventions | 新增文档命名、目录、骨架、语言与术语、ORID、图表、链接与版本规则（取自 v2 文档规范） | agent |
| 2026-11-10 | sdd-artifacts | 新增 OpenSpec 目录结构、capability / change-id 命名、决策记录与验证报告路径（取自 v2 文档规范 §6） | agent |
| 2026-11-10 | java-coding-style | 按 v2 后端规范补齐：包按特性平铺、类名后缀、金额常量后缀、`RoundingMode` 与 `Money.amount` 的 UNNECESSARY 语义、分与元边界、阈值唯一与可溯源、`voucher` 字段、对象不可变、异常与错误映射 | agent |
| 2026-11-10 | java-testing | 按 v2 后端规范补齐：断言顺序插入 `voucher`、断言第三参数、测试引用常量、`mvnw.cmd test`、历史驼峰测试整类迁移 | agent |
| 2026-11-10 | java-patterns | 追加项目持久化约定：迁移只增不改、UTC 与可注入时钟、行对象与领域对象分离、仓储接口在业务包内 | agent |
| 2026-11-10 | spec-first | 追加 P1–P5 各阶段内容要求（in/out scope、ADDED/MODIFIED/REMOVED、任务落点与验证命令、真实输出、规则回写） | agent |
| 2026-11-10 | code-review-checklist | 新增持久化、前端、契约三段；生产代码段补 `RoundingMode`、阈值唯一、异常表达；Stack 扩为 `java,react,typescript` | agent |
| 2026-11-10 | rules-structure | **合并为每分类一个 `rules.md`**：删除 27 个旧文件（24 个单规则文件 + 3 个分类 README），规则正文并入 `process` / `architecture` / `quality` / `testing` / `security` / `documentation` 六个文件；正文统一中文；规则 ID 保留为二级标题以保证 `@rule:<id>` 与 `#<id>` 锚点可用；分类级新增 `规则总表`、`为什么这样定`、`全分类检查清单` 取代逐条 Metadata / Rationale | agent |
| 2026-11-10 | _SCHEMA | 改写为本项目约定：分类单文件、ID 即锚点、总表字段与单条规则必需小节 | agent |
| 2026-11-10 | rules-count | 修正规则总数口径：实际 24 条（process 6 / architecture 5 / quality 4 / testing 2 / security 5 / documentation 2）；此前记录的「31」是 md 文件数，不是规则条数 | agent |
| 2026-11-11 | package-structure | 新增标准分层包分类：controller/service/dao/mapper/model/dto/exception/utils/ui 的职责、禁放、命名与依赖方向；分层时机（>15 类 / ≥2 域 / 新建 Web 型）与平铺衔接。用户裁决：保留平铺阈值、dao=持久化且 mapper=MyBatis 二选一、ui=Java 视图层 | agent |
| 2026-11-11 | java-patterns | 仓储接口位置改为随布局：平铺在业务包、分层在 dao；service 始终只依赖接口；检查项同步 | agent |
| 2026-11-11 | java-coding-style | 包与目录衔接 package-structure（新增 Web 型项目触发分层）；类名后缀与检查项引用包分类 | agent |
| 2026-11-11 | rules-count | 规则总数 24→25（architecture 5→6）；_INDEX、rules/README、knowledge/_INDEX 同步 | agent |
| 2026-11-11 | package-structure | 参照阿里巴巴开发手册扩展为完整应用分层：分层模型映射（开放接口/Web/终端显示/Service/Manager/DAO/第三方）、Manager 可选层、DO/DTO/BO/Query/VO 概念映射（命名不改）、分层异常职责、前端目录层映射与仓库级结构；适用栈扩为 java,react,typescript。用户裁决：映射式引入、覆盖后端+前端+仓库级 | agent |
| 2026-11-11 | web-coding-style / naming-conventions | 补层语义与领域模型概念映射指针（@rule:package-structure）；前端 utils/ 可选叶子 | agent |
