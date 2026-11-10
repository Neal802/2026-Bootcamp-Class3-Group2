# spec-first — Spec-First before production code

## Metadata

| Field | Value |
|---|---|
| **ID** | spec-first |
| **Category** | process |
| **Priority** | Critical |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | — |

## Rule

1. Do not write production code without an agreed change-spec package for that change.
2. Prefer a clear artifact order: intent/proposal → spec (+ optional design) → tasks → implementation → archive (or the equivalent sequence of the project's chosen SDD backend).
3. PRs must cite a stable Spec ID for the change and keep change artifacts under the project's SDD workspace (path and layout follow the selected backend).
4. The Spec-First **obligation** is backend-agnostic. OpenSpec, Speckit, and other SDD frameworks are interchangeable carriers — choose one per project (or per change family) and record it; do not hard-bind policy text to a single tool name or folder layout.

### 各阶段必须满足的内容要求（本项目团队约定）

| 阶段 | 要求 |
|---|---|
| P1 提案 | `proposal.md` 必须写清 in-scope 与 out-of-scope；范围里出现「接口新增字段」时，必须同时开契约变更。 |
| P2 Delta Spec | 用 ADDED / MODIFIED / REMOVED 描述变更；每条变更带可验证的验收场景（输入 → 预期输出）；MODIFIED 条目要能说清旧行为与新行为的差异。 |
| P3 任务拆解 | `tasks.md` 每条任务标注落点（backend / frontend / contract / docs）与对应验证命令，一条任务只落一层；契约任务排在前后端任务之前。 |
| P4 实施验证 | 测试方法名与验收场景一一对应、术语一致；验证报告贴真实命令与输出摘要，不写「已验证」「测试通过」了事。 |
| P5 归档 | 本次变更如果改了团队做法，把新规则回写 [rules](../README.md) 并升版本；未回写的规则视为口头约定，不作为评审依据。 |

工件目录与命名见 [sdd-artifacts](../documentation/sdd-artifacts.md)。

## Rationale

Keeps Spec-First executable and prevents implementation drift from unverified intent, while remaining compatible with multiple SDD backends as the pack evolves.

## Verification

| Check | Blocks |
|---|---|
| Change-spec package + required artifacts present for the selected backend | pr-merge |
| PR body contains Spec ID | pr-merge |
| P1–P5 各阶段内容要求是否满足（in/out scope、ADDED/MODIFIED/REMOVED、任务落点与验证命令、真实输出、回写规则） | pr-merge |

## Examples

### Good

- PR cites `Spec ID: add-foo` and includes the change package required by the project's SDD backend (e.g. OpenSpec change under `openspec/changes/…`, or Speckit / other equivalent layout).

### Bad

- Feature branch with production code only and no Spec ID / no change-spec package.

## Exceptions

- Pure docs under `docs/**` may be exempt when org policy says so.
- Edits solely inside the project's SDD workspace (spec tooling trees) do not require a nested change for meta-edits of existing packages.
