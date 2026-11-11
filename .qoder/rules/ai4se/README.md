# 规则知识库（rules）

规则权威区，按 MECE 分类组织。Host 侧规则文件（如 `.qoder/rules/ai4se/`）是派生副本，冲突时以本目录为准。

**每个分类目录只有一个 `rules.md`**，规则 ID 是文件内的二级标题。格式约定见 [_SCHEMA.md](_SCHEMA.md)。

## 分类入口

| 分类 | 文件 | 规则数 | 管什么 |
|---|---|---|---|
| process | [rules/process/rules.md](process/rules.md) | 6 | 规格先行、TDD 循环、提交时机与 message、分支与 PR、评审清单、Java 编辑钩子 |
| architecture | [rules/architecture/rules.md](architecture/rules.md) | 6 | 接口契约、分层边界、应用分层与包/目录分类、无循环依赖、编排与执行分离、Java 模式与持久化 |
| quality | [rules/quality/rules.md](quality/rules.md) | 4 | 语言无关编码风格、Java 编码风格、跨端命名、前端 Web 编码风格 |
| testing | [rules/testing/rules.md](testing/rules.md) | 2 | Java 测试命名与结构、前端三层测试 |
| security | [rules/security/rules.md](security/rules.md) | 5 | 安全基线、凭据、脱敏、提示注入、Java 安全做法 |
| documentation | [rules/documentation/rules.md](documentation/rules.md) | 2 | 文档命名结构与语言、SDD 工件目录与命名 |
| modules/&lt;id&gt; | `modules/<id>/rules.md` | — | 单模块覆盖规则，仅在确有需要时创建 |

## 规则 ID 一览

共 25 条。括号内是优先级。

- **process** — `spec-first`(Critical)、`tdd-cycle`(Critical)、`git-commit-conventions`(Critical)、`git-branching-and-pr`(High)、`code-review-checklist`(High)、`java-hooks`(Medium)
- **architecture** — `api-contract`(Critical)、`layer-boundaries`(High)、`package-structure`(High)、`no-circular-dependency`(High)、`orchestration-execution-separation`(High)、`java-patterns`(Medium)
- **quality** — `coding-style`(Critical)、`java-coding-style`(Critical)、`naming-conventions`(High)、`web-coding-style`(High)
- **testing** — `java-testing`(High)、`web-testing`(High)
- **security** — `security-baseline`(Critical)、`no-hardcoded-secrets`(Critical)、`pii-scrubbing`(Critical)、`prompt-injection-defense`(Critical)、`java-security`(Critical)
- **documentation** — `document-conventions`(Medium)、`sdd-artifacts`(High)

## 团队六条原则

1. 测试先行。先让测试因业务原因失败，再写实现。
2. 一次只推进一个业务场景。
3. 只在测试全部通过时重构。
4. 代码、测试、注释、提交记录使用同一套业务术语，不自行换词。
5. 优先保证可读，不以减少行数为目标。
6. 契约先行。接口字段、错误码、金额单位在 `openapi.yaml` 里定稿后前后端才动手。

## 来源

规则来自团队《Code Style Guide》（v1，Java 单文档）与 2026-11-10 的 v2 规范拆分（`class3-group2-*`）。v2 与 v1 冲突之处按下列裁决：

| 冲突点 | 裁决 |
|---|---|
| 提交时机 | 以 `git-commit-conventions` 为准：一个 change 只在 verify 通过后、archive 之后各提交一次 |
| Red / Green / Refactor 是否各自提交 | 不提交，只作工作纪律；v2 文档的 `<phase>: red\|green\|refactor` 不采纳 |
| 静态检查工具 | 团队未引入 ESLint / Prettier / Checkstyle，相关要求降为「仅在仓库确实引入时启用」 |

## 引用方式

在评审意见、提交说明或 `AGENTS.md` 中使用 `@rule:<id>`，需要指到具体分类时用 `rules/<category>/rules.md#<id>`。不要复制规则正文，也不要在 host 投影里改规则——改权威区再重投影。

`_INDEX.md` 由 `scripts/kb-lint.sh` 编译；`_LOG.md` 只追加。
