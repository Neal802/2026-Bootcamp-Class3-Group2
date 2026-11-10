# sdd-artifacts — SDD 工件目录与命名（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | sdd-artifacts |
| **Category** | documentation |
| **Priority** | High |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | — |

## Rule

本文件规定 SDD 工件放在哪、叫什么名字。**什么时候必须产出这些工件**见 [spec-first](../process/spec-first.md)；一般文档的命名、结构、术语见 [document-conventions](document-conventions.md)。

### 目录结构

沿用 OpenSpec：

```text
openspec/
  specs/<capability>/spec.md            活规格（Living Spec）
  changes/<change-id>/
    proposal.md
    design.md
    tasks.md
    specs/<capability>/spec.md          增量规格（Delta Spec）
    g1-decision.md
    g2-decision.md
    g3-decision.md
    summary.md
  changes/archive/<change-id>/          已归档变更
  templates/                            change-spec.md / main-spec.md 模板
  config.yaml
```

- `openspec/specs/` 是长期活规格的唯一权威位置，不另建第二套规格目录。
- 变更包在 `changes/<change-id>/` 内自包含：提案、增量规格、任务、决策记录同处一处，归档时整体移入 `changes/archive/`。

### 命名

| 对象 | 规则 | 例子 |
|---|---|---|
| `<capability>` | 名词短语，kebab-case | `quote-pricing`、`parcel-quote-api` |
| `<change-id>` | 动宾短语，kebab-case，动词开头 | `add-voucher-deduction`、`fix-shipping-threshold` |
| 决策记录 | 固定文件名，不自定义 | `g1-decision.md` / `g2-decision.md` / `g3-decision.md` |
| 变更摘要 | 固定文件名 | `summary.md` |
| 验证报告 | `docs/ai4se-plugins/<时间戳>-<技能名>-report.md` | `20261110-104848-local-verify-report.md` |
| 检查点记录 | `docs/ai4se-plugins/<时间戳>-<技能名>-checkpoints.md` | `20261110-104848-rules-govern-checkpoints.md` |
| 需求交接 | `requirement-workspace/handoff.md` | 预规格阶段的入口 |

- `<change-id>` 与分支名、PR 标题中的 change-id 完全相同，从提交能一路追到规格。
- 一个 change 只改一个 capability；跨能力就拆成两个 change。
- 决策记录不写成 `G1决策-最终.md`、`g1-decision-final-v2.md` 这类变体，固定名 + 版本管理即历史。
- 工件语言：正文中文；`SHALL` / `MUST` 等结构关键词保留英文；标题层级与 OpenSpec 模板一致。

### 工件职责边界

| 工件 | 写什么 | 不写什么 |
|---|---|---|
| `proposal.md` | 问题、in-scope / out-of-scope、影响面 | 实现细节、任务清单 |
| `specs/<capability>/spec.md`（Delta） | ADDED / MODIFIED / REMOVED 与可验证验收场景 | 代码路径、类名取舍 |
| `design.md` | 关键取舍、被否决的方案、风险 | 规格级验收条件 |
| `tasks.md` | 每条任务标注落点（backend / frontend / contract / docs）与验证命令 | 未拆分的「实现该功能」 |
| `g1/g2/g3-decision.md` | 决策结论、签署人、时间、证据路径 | 复述规格正文 |
| `summary.md` | 变更轨迹：change-id、PR 链接、契约版本、遗留项 | 新的决策结论 |

- `tasks.md` 一条任务只落一层；跨层的任务拆开，否则无法判断验证该由谁跑。
- 验证报告贴真实命令与输出摘要，不写「已验证」「测试通过」四个字。
- 决策记录只记录已经发生的裁定，不预填结论。

### 与版本的关系

- 契约版本（`openapi.yaml` 的 `info.version`）变化时，把版本号写进 `summary.md`，便于回溯推进历史。
- 归档后活规格被更新，`changes/archive/<change-id>/` 保持不变，作为不可变的历史证据。
- 团队做法的变更在 P5 回写 [rules](../README.md) 并升版本；未回写的口头约定不作为评审依据。

## Rationale

SDD 的价值在于从意图到代码的可追溯性，而可追溯性依赖固定路径与固定文件名：如果决策记录叫 `G1决策-最终.md`、增量规格散落在三个目录，归档时无法机械校验完整性，也无法从提交反查规格。

## Verification

| Check | Blocks |
|---|---|
| 变更包是否在 `openspec/changes/<change-id>/`，是否自包含 | pr-merge |
| `<capability>` 是否为名词短语 kebab-case，`<change-id>` 是否为动词开头 kebab-case | pr-merge |
| change-id 是否与分支名、PR 标题一致 | pr-merge |
| 决策记录是否为 `g1/g2/g3-decision.md` 固定名 | 归档前 |
| 一个 change 是否只改一个 capability | 归档前 |
| 验证报告是否位于 `docs/ai4se-plugins/<时间戳>-<技能名>-report.md` 且含真实输出 | pr-merge |
| 归档后 `changes/archive/<change-id>/` 是否保持不可变 | 归档前 |

## Examples

```text
GOOD  openspec/changes/add-voucher-deduction/specs/quote-pricing/spec.md
GOOD  openspec/changes/archive/fix-shipping-threshold/g2-decision.md
BAD   openspec/changes/voucher/G1决策-最终.md
BAD   openspec/specs/报价/ spec.md
```

## Exceptions

- 预规格阶段的探索产物放 `requirement-workspace/`，不进入 `openspec/changes/`；交接完成后按 change 拆包。
- 纯文档或工具配置类变更可不产出 `design.md`，但需在 `proposal.md` 说明省略原因。
