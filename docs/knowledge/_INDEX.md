# 知识库索引

`scripts/kb-lint.sh` 可用后由该脚本重新生成；在此之前，结构性变化后手工维护此表。

规则条目指向分类文件 `rules/<category>/rules.md`，规则本身是该文件内的二级标题锚点，引用时写 `rules/<category>/rules.md#<id>`。

| 区域 | 条目 | 来源 |
|---|---|---|
| architecture | 架构知识 | [architecture/README.md](architecture/README.md) |
| domain | 领域知识 | [domain/README.md](domain/README.md) |
| domain/shared | 共享领域词汇 | [domain/shared/README.md](domain/shared/README.md) |
| external | 外部系统知识 | [external/README.md](external/README.md) |
| interfaces | 接口知识 | [interfaces/README.md](interfaces/README.md) |
| operations | 运维知识 | [operations/README.md](operations/README.md) |
| rules | 规则总览（权威区；host 投影是派生副本） | [rules/README.md](rules/README.md) |
| rules/_SCHEMA | 规则文件格式：每分类一个文件、ID 即锚点 | [rules/_SCHEMA.md](rules/_SCHEMA.md) |
| rules/_LOG | 规则变更日志（只追加） | [rules/_LOG.md](rules/_LOG.md) |
| rules/process | 流程规则 6 条：`spec-first`、`tdd-cycle`、`git-commit-conventions`、`git-branching-and-pr`、`code-review-checklist`、`java-hooks` | [rules/process/rules.md](rules/process/rules.md) |
| rules/architecture | 架构规则 6 条：`api-contract`、`layer-boundaries`、`package-structure`、`no-circular-dependency`、`orchestration-execution-separation`、`java-patterns` | [rules/architecture/rules.md](rules/architecture/rules.md) |
| rules/quality | 质量规则 4 条：`coding-style`、`java-coding-style`、`naming-conventions`、`web-coding-style` | [rules/quality/rules.md](rules/quality/rules.md) |
| rules/testing | 测试规则 2 条：`java-testing`、`web-testing` | [rules/testing/rules.md](rules/testing/rules.md) |
| rules/security | 安全规则 5 条：`security-baseline`、`no-hardcoded-secrets`、`pii-scrubbing`、`prompt-injection-defense`、`java-security` | [rules/security/rules.md](rules/security/rules.md) |
| rules/documentation | 文档规则 2 条：`document-conventions`、`sdd-artifacts` | [rules/documentation/rules.md](rules/documentation/rules.md) |
| rules/modules | 单模块覆盖规则预留（当前为空） | — |

用 `@rule:<id>` 指针引用规则（见 `AGENTS.md`）；不要把规则正文复制进本索引或 host 投影。
