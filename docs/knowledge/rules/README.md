# Rules knowledge

规则权威区，按 MECE 分类组织。Host 侧规则文件（如 `.qoder/rules/ai4se/`）是派生副本，冲突时以本目录为准。

| Category | 用途 |
|---|---|
| `process/` | spec-first、TDD 循环、提交规范、分支与 PR、评审清单 |
| `architecture/` | 分层边界、无循环依赖、编排与执行分离、接口契约、Java 模式与持久化 |
| `quality/` | 语言无关编码风格 + 栈相关编码风格（Java / Web） |
| `testing/` | 测试命名、结构、断言与边界值（Java / Web） |
| `security/` | 安全检查基线 |
| `documentation/` | 文档命名与结构、SDD 工件命名 |
| `modules/<id>/` | 单模块覆盖规则（仅在确有需要时创建） |

元数据格式与必需章节见 [_SCHEMA.md](_SCHEMA.md)；`_INDEX.md` 由 `scripts/kb-lint.sh` 编译，`_LOG.md` 只追加。

## 团队六条原则

1. 测试先行。先让测试因业务原因失败，再写实现。
2. 一次只推进一个业务场景。
3. 只在测试全部通过时重构。
4. 代码、测试、注释、提交记录使用同一套业务术语，不自行换词。
5. 优先保证可读，不以减少行数为目标。
6. 契约先行。接口字段、错误码、金额单位在 `openapi.yaml` 里定稿后前后端才动手。

## 团队规范的权威落点

以下规则来自团队《Code Style Guide》（v1）与 2026-11-10 的 v2 规范拆分，是该文档在本仓库的权威落点。分两批：第一批由 v1（Java 单文档）拆出，第二批由 v2 补齐的前端、契约、Git、文档四层新增。

### 第一批：v1 Java 约定

| 规则 | 覆盖内容 |
|---|---|
| [quality/java-coding-style.md](quality/java-coding-style.md) | 包与目录、命名与类名后缀、金额（`BigDecimal` / `Money.amount` / `RoundingMode` / 分与元边界）、常量与阈值唯一、计算顺序、三元与嵌套条件、异常表达、注释与 JavaDoc |
| [testing/java-testing.md](testing/java-testing.md) | 测试类与方法命名（`in_*_out_*`）、Given / When / Then、`assertAll` 与断言第三参数、常量引用、边界值、测试命令、历史测试迁移 |
| [process/tdd-cycle.md](process/tdd-cycle.md) | Red / Green / Refactor 循环与各阶段验证要求 |
| [process/git-commit-conventions.md](process/git-commit-conventions.md) | spec 级提交时机（verify / archive 各一次）、`<type>(<stage>): <change-id> <description>` 格式、提交前验证 |
| [process/code-review-checklist.md](process/code-review-checklist.md) | 生产代码、持久化、测试、前端、契约、TDD 与 Git 六段评审清单 |

### 第二批：v2 新增层

| 规则 | 覆盖内容 |
|---|---|
| [quality/naming-conventions.md](quality/naming-conventions.md) | 跨端命名速查、金额字段语义、术语唯一性 |
| [quality/web-coding-style.md](quality/web-coding-style.md) | 前端目录、命名、组件、请求层、类型与状态、样式、可访问性、i18n |
| [testing/web-testing.md](testing/web-testing.md) | 前端三层测试（纯逻辑 / 组件 / 端到端）、用例命名、语义化查询、提交前验证 |
| [architecture/api-contract.md](architecture/api-contract.md) | 契约先行四步、路径与字段格式、Schema、状态码与错误码、版本兼容、两端同步 |
| [architecture/java-patterns.md](architecture/java-patterns.md) | 通用 Java 模式 + 项目持久化约定（迁移只增不改、UTC 时钟、行对象与领域对象分离、仓储接口） |
| [process/git-branching-and-pr.md](process/git-branching-and-pr.md) | 分支策略、PR 五要素与标题格式、换行符与编码、不提交内容、回滚 |
| [process/spec-first.md](process/spec-first.md) | Spec 前置义务 + P1–P5 各阶段内容要求 |
| [documentation/document-conventions.md](documentation/document-conventions.md) | 文件命名、目录、文档骨架、语言与术语、ORID、图表、链接、版本规则 |
| [documentation/sdd-artifacts.md](documentation/sdd-artifacts.md) | OpenSpec 目录、capability 与 change-id 命名、决策记录、验证报告与检查点路径 |

引用方式：在评审意见、提交说明或 `AGENTS.md` 中使用 `@rule:<id>` 指针，不要复制规则正文。
