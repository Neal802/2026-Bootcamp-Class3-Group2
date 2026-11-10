# Knowledge index

Regenerate via `scripts/kb-lint.sh` once that script is implemented; until then this
table is maintained by hand after structural changes (e.g. `/sdd:rules-govern`).

| Area                | Entry                                                                        | Source                                                                                      |
|---------------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| architecture        | Architecture                                                                 | [architecture/README.md](architecture/README.md)                                            |
| domain              | Domain knowledge                                                             | [domain/README.md](domain/README.md)                                                        |
| domain/shared       | Shared domain vocabulary                                                     | [domain/shared/README.md](domain/shared/README.md)                                          |
| external            | External systems knowledge                                                   | [external/README.md](external/README.md)                                                    |
| interfaces          | Interfaces knowledge                                                         | [interfaces/README.md](interfaces/README.md)                                                |
| operations          | Operations knowledge                                                         | [operations/README.md](operations/README.md)                                                |
| rules               | Rules knowledge (authority; host projections are derived copies)             | [rules/README.md](rules/README.md)                                                          |
| rules/_SCHEMA       | Rule schema — metadata table + required sections                             | [rules/_SCHEMA.md](rules/_SCHEMA.md)                                                        |
| rules/_LOG          | Rules change log (append-only)                                               | [rules/_LOG.md](rules/_LOG.md)                                                              |
| rules/architecture  | api-contract — 接口契约规则（契约先行 / 字段格式 / 版本兼容）                | [rules/architecture/api-contract.md](rules/architecture/api-contract.md)                    |
| rules/architecture  | layer-boundaries — Respect declared layer dependency direction               | [rules/architecture/layer-boundaries.md](rules/architecture/layer-boundaries.md)            |
| rules/architecture  | no-circular-dependency — No circular module dependencies                     | [rules/architecture/no-circular-dependency.md](rules/architecture/no-circular-dependency.md)|
| rules/architecture  | orchestration-execution-separation — Keep orchestration free of judgments    | [rules/architecture/orchestration-execution-separation.md](rules/architecture/orchestration-execution-separation.md) |
| rules/architecture  | java-patterns — Java Patterns (stack)                                        | [rules/architecture/java-patterns.md](rules/architecture/java-patterns.md)                  |
| rules/documentation | Documentation rules                                                          | [rules/documentation/README.md](rules/documentation/README.md)                              |
| rules/documentation | document-conventions — 文档命名、结构、语言与引用                            | [rules/documentation/document-conventions.md](rules/documentation/document-conventions.md)  |
| rules/documentation | sdd-artifacts — SDD 工件目录与命名                                           | [rules/documentation/sdd-artifacts.md](rules/documentation/sdd-artifacts.md)                |
| rules/process       | spec-first — Spec-First before production code                               | [rules/process/spec-first.md](rules/process/spec-first.md)                                  |
| rules/process       | tdd-cycle — TDD Red / Green / Refactor 循环                                  | [rules/process/tdd-cycle.md](rules/process/tdd-cycle.md)                                    |
| rules/process       | git-branching-and-pr — 分支、PR、换行符与回滚                                | [rules/process/git-branching-and-pr.md](rules/process/git-branching-and-pr.md)              |
| rules/process       | git-commit-conventions — Git 提交时机（spec verify / archive）与 Commit message  | [rules/process/git-commit-conventions.md](rules/process/git-commit-conventions.md)          |
| rules/process       | code-review-checklist — Code Review 检查清单                                 | [rules/process/code-review-checklist.md](rules/process/code-review-checklist.md)            |
| rules/process       | java-hooks — Java Hooks (stack)                                              | [rules/process/java-hooks.md](rules/process/java-hooks.md)                                  |
| rules/quality       | Quality rules (coding and refactoring)                                       | [rules/quality/README.md](rules/quality/README.md)                                          |
| rules/quality       | coding-style — Coding style (language-agnostic, Critical)                    | [rules/quality/coding-style.md](rules/quality/coding-style.md)                              |
| rules/quality       | java-coding-style — Java 编码风格（团队约定）                                | [rules/quality/java-coding-style.md](rules/quality/java-coding-style.md)                    |
| rules/quality       | naming-conventions — 跨端命名速查与术语唯一性（团队约定）                    | [rules/quality/naming-conventions.md](rules/quality/naming-conventions.md)                  |
| rules/quality       | web-coding-style — 前端 Web 编码风格（团队约定）                             | [rules/quality/web-coding-style.md](rules/quality/web-coding-style.md)                      |
| rules/security      | security-baseline — Mandatory security checks                                | [rules/security/security-baseline.md](rules/security/security-baseline.md)                  |
| rules/security      | no-hardcoded-secrets — No hardcoded secrets                                  | [rules/security/no-hardcoded-secrets.md](rules/security/no-hardcoded-secrets.md)            |
| rules/security      | pii-scrubbing — Scrub PII from logs and model context                        | [rules/security/pii-scrubbing.md](rules/security/pii-scrubbing.md)                          |
| rules/security      | prompt-injection-defense — Defend against prompt injection                   | [rules/security/prompt-injection-defense.md](rules/security/prompt-injection-defense.md)    |
| rules/security      | java-security — Java Security (stack)                                        | [rules/security/java-security.md](rules/security/java-security.md)                          |
| rules/testing       | Testing rules                                                                | [rules/testing/README.md](rules/testing/README.md)                                          |
| rules/testing       | java-testing — JUnit 5 测试命名与结构（团队约定）                            | [rules/testing/java-testing.md](rules/testing/java-testing.md)                              |
| rules/testing       | web-testing — 前端测试分层与写法（团队约定）                                 | [rules/testing/web-testing.md](rules/testing/web-testing.md)                                |
| rules/modules       | Reserved for single-submodule rule overlays (empty)                          | —                                                                                           |

Reference rules with `@rule:<id>` pointers (see `AGENTS.md`); do not copy rule bodies into
this index or into host projections.
