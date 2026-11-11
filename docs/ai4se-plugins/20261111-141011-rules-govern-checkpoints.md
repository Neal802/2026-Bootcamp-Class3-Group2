# Checkpoint log — rules-govern

- skill: skill.rules.govern
- command: /sdd:rules-govern
- root: d:/software/training/TATP/day12/2026-Bootcamp-Class3-Group2
- started_at: 2026-11-11T14:10:11+0800
- host_agent: qoder

## Checkpoints

| id | topic | choice | rationale | status |
|----|-------|--------|-----------|--------|
| C1 | root | 当前 workspace | 用户请求针对本仓库 `docs/knowledge/rules/`；权威树在此（2026-11-10 旧日志的 root 为另一目录） | answered |
| C2 | mode | `check-merge` | 权威树完整（24 条规则、每分类单文件、含团队裁决），用户弹窗确认增量补齐 | answered |
| C3 | langs | `java` | 复用 2026-11-10 裁决：团队栈 Java + React/TS | skipped-preanswered |
| C4 | host | `qoder` | 复用 2026-11-10 裁决；本 workspace 投影此前未建立，本次首刷 | skipped-preanswered |
| C5 | submodule-mapping | `all` | 单模块仓库，无 submodule overlay 需求 | skipped-preanswered |

## Brainstorm — 包结构语义裁决（用户弹窗确认）

| 决策点 | 裁决 |
|---|---|
| 分层时机 | 保留按特性平铺阈值（单包 >15 类 / ≥2 业务域），新增「新建 Web 型项目」触发；触发后必须用标准包分类 |
| dao/mapper | dao=持久化（仓储接口与实现，JPA/JDBC）；mapper=MyBatis 专用，与 dao 同层二选一；JPA 项目不建 mapper |
| ui | Java 视图层（桌面 Swing/JavaFX 或服务端模板）；React 前端按 web-coding-style 放 frontend/，Web 项目不建 ui |

## Apply

- mode: apply（手工增量合并；用户已弹窗确认增量意图）
- plan_summary: dry-run（`--mode check-merge --langs java`）18 CREATE（rulepack 单规则旧布局）/ 2 CONFLICT（`_SCHEMA.md`、`README.md`）/ 其余 SKIP
- created: `architecture/rules.md#package-structure`（新规则，High/auto/java）；`docs/knowledge/architecture/README.md#declared-layers`；`AGENTS.md#Rules-pointers`；本日志
- skipped: **rulepack 单规则文件全部不创建** —— 项目 `_SCHEMA` 约定每分类单文件（用户 2026-11-10 裁决），机械 apply 会复活已删除的 27 个旧文件；保留结构性 override，改手工增量。`modules/` 空目录不创建（_SCHEMA：仅在确有需要时创建）
- conflicts: `_SCHEMA.md` / `README.md` differs-from-rulepack（项目定制，保留）；`java-patterns`「仓储接口在业务包内」与 `java-coding-style`「包与目录」按新裁决修订并互链，不静默覆盖
- modified: `architecture/rules.md`（规则总表、新规则、java-patterns 仓储位置随布局、为什么这样定、全分类检查清单）；`quality/rules.md`（包与目录触发条件、命名后缀指针、检查项）；`rules/_INDEX.md`（25 条重排）；`rules/README.md`（计数与一览）；`knowledge/_INDEX.md`；`rules/_LOG.md` 与 `knowledge/_LOG.md`（追加）
- 环境备注: `init-checkpoint-log.sh` 依赖 `vendor/ai4se-plugins`（本 workspace 为空），日志按 skill 模板手工创建；bash 经 Git Bash 调用

## Host projection

- host: qoder
- dest: `.qoder/rules/ai4se`
- refreshed: yes（`project-host.sh --host qoder --apply`，本 workspace 首次投影）

## Post-apply merge — 完整结构（参照阿里巴巴开发手册，同日）

- 输入：用户要求「参考阿里巴巴开发手册，把完整的结构给出来，不仅仅是 java 的」；手册原文经 WebFetch 核实（应用分层、分层领域模型规约、分层异常处理规约）
- 裁决（弹窗）：映射式引入（Manager 可选层、DO/DTO/BO/Query/VO 概念映射、团队命名不改）；覆盖后端+前端+仓库级
- 变更：`package-structure` 扩展（分层模型映射表、manager 行与可选层条款、XxxQuery 与 >2 参数禁 Map、领域模型映射表、分层异常职责表、前端目录映射、仓库级结构、检查项与示例扩充）；适用栈 java → java,react,typescript
- 衔接：`web-coding-style` 目录段补层语义指针与 utils/ 可选叶子；`naming-conventions` 补概念映射指针；`rules/README` 措辞；`architecture/README` 分层图补 manager；两级 _LOG 追加
- 规则总数不变：25（扩展既有规则，不新增 ID）
- 投影：重跑 `project-host.sh --host qoder --apply`，diff 校验零差异

## Next

- suggested (optional): /sdd:quality-checklist
- user may skip or reorder