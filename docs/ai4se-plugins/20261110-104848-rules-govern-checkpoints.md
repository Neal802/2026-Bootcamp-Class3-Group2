# Checkpoint log — rules-govern

- skill: skill.rules.govern
- command: /sdd:rules-govern
- root: /d/ITA/Day12/ai4se-baseline
- started_at: 2026-11-10T10:48:48+0800
- host_agent: qoder

## Checkpoints

| id | topic | choice | rationale | status |
|----|-------|--------|-----------|--------|
| C1 | root | `/d/ITA/Day12/ai4se-baseline` | workspace root confirmed earlier in this session | skipped-preanswered |
| C2 | mode | `init` | `docs/knowledge/rules/` held only a stub README — no Critical rules yet | answered |
| C3 | langs | `java` | team Code Style Guide targets a Java exercise project (Maven/Gradle, JUnit 5) | answered |
| C4 | host | `qoder` | workspace is driven from Qoder IDE (`.qoder/`); projection keeps rules agent-visible | answered |
| C5 | submodule-mapping | `all` | single-module repository; no submodule overlays needed yet | answered |

## Apply

- mode: apply
- plan_summary: 24 CREATE / 1 SKIP, 0 CONFLICT (`--mode init --langs java`)
- created: `process/` `architecture/` `quality/` `testing/` `security/` `documentation/` `modules/`; `architecture/{layer-boundaries,no-circular-dependency,orchestration-execution-separation,java-patterns}.md`; `process/{spec-first,java-hooks}.md`; `quality/{README,coding-style,java-coding-style}.md`; `security/{no-hardcoded-secrets,pii-scrubbing,prompt-injection-defense,security-baseline,java-security}.md`; `testing/{README,java-testing}.md`; `_SCHEMA.md` `_INDEX.md` `_LOG.md`; `AGENTS.md#Rules-pointers`
- skipped: `README.md` (non-empty)
- conflicts: none
- post-apply rewrite: team Code Style Guide split into `quality/java-coding-style.md` (rulepack java default replaced), `testing/java-testing.md` (rulepack java default replaced), new `process/tdd-cycle.md`, `process/git-commit-conventions.md`, `process/code-review-checklist.md`; `README.md` extended with the team rule map

## Host projection

- host: qoder
- dest: `.qoder/rules/ai4se`
- refreshed: yes

## Post-apply merge — 团队 v2 规范（同日，手工增量）

- 输入：`class3-group2-{standards-index,backend-java,frontend-web,api-contract,git-review,docs-writing,codeStyle}-*.md`
- 判定：v1 内容（Java 编码/测试/TDD）已被既有 5 条规则覆盖；v2 新增加 `naming-conventions`、`web-coding-style`、`web-testing`、`api-contract`、`git-branching-and-pr`、`document-conventions`、`sdd-artifacts`
- 补齐既有：`java-coding-style`、`java-testing`、`java-patterns`、`spec-first`、`code-review-checklist`
- 冲突处理：v2 的「Red / Green / Refactor 分别提交」「`<phase>: red|green|refactor`」**不采纳**，提交时机仍按 `git-commit-conventions`（spec 级两次提交，用户已裁定）
- 结果：authority 31 个 md；projection 32 个 md（含 `README.projection.md`）；`docs/knowledge` 全量链接校验 0 断链

## Post-apply consolidation — 每分类单文件（同日，用户要求）

- 需求：`rules/process` 下一个 md、`quality` 下一个 md，语言统一为中文
- 做法：31 个 md → 10 个（`README` `_INDEX` `_LOG` `_SCHEMA` + 6 个 `<category>/rules.md`）；删除 27 个旧文件（24 个单规则文件 + 3 个分类 `README.md`）
- 锚点保全：规则 ID 仍是二级标题 `## <id>`，中文规则名放紧跟的加粗行，`@rule:<id>` 与 `#<id>` 继续可用
- 结构收敛：逐条 Metadata 表 → 分类级 `规则总表`；逐条 Rationale → 分类级 `为什么这样定`；逐条 Verification → `检查项` 表；新增 `全分类检查清单`
- 语言：六个分类文件、`README.md`、`_INDEX.md`、`_SCHEMA.md`、两份 `_LOG.md` 全部改为中文；代码、标识符、命令、commit message 保留英文
- 口径修正：规则实际 24 条（process 6 / architecture 5 / quality 4 / testing 2 / security 5 / documentation 2）；此前的「31」是 md 文件数
- 投影：先清空 `.qoder/rules/ai4se/` 再重跑 `project-host.sh --host qoder --apply`，避免 `cp` 回退路径残留旧文件；结果 11 个文件（6 个 `rules.md` + 4 个根文件 + `README.projection.md`）
- 校验：`docs/knowledge` 全量相对链接 broken=0；24 条规则锚点逐一命中

## Next

- suggested (optional): /sdd:quality-checklist
- user may skip or reorder
