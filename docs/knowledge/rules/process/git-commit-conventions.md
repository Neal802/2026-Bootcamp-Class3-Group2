# git-commit-conventions — Git 提交时机（spec 级）与 Commit message（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | git-commit-conventions |
| **Category** | process |
| **Priority** | Critical |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | — |

## Rule

### 提交时机：一个 spec 对应两次提交（CRITICAL）

以 OpenSpec change（下称 spec）为提交单元，一个 spec 只产生两次提交：

1. **verify 提交** — `/opsx verify`（`openspec-verify-change`）通过后，一次性提交该 change 的完整内容：delta spec、设计、任务、生产代码、测试以及验证证据。
2. **archive 提交** — `/opsx archive`（`openspec-archive-change`）之后，提交归档结果：`openspec/changes/archive/**`、living spec 合并结果、以及随之更新的知识库（`docs/knowledge/**`）。

除此之外，change 进行过程中不产生提交：

- Red、Green、Refactor 不再各自提交——它们只是工作纪律，不是提交边界。
- 禁止在 verify 通过之前提交（半成品、未通过验证的实现、未完成的任务）。
- 禁止把多个 spec 合并到同一个提交。
- 禁止把 verify 与 archive 两次提交合并。

若确需在协作/备份场景保存中间状态，只能使用本地临时提交，并在 verify 提交前 squash 掉，不得进入主干历史。

### Commit message 格式

```text
<type>(<stage>): <change-id> <description>
```

`<stage>` 标识提交所属的 spec 阶段：

| Stage | 触发时机 | 提交内容 |
|---|---|---|
| `verify` | `/opsx verify` 通过后 | 该 change 的规格 + 代码 + 测试 + 验证证据 |
| `archive` | `/opsx archive` 之后 | 归档目录、living spec 合并、知识库更新 |

| Type | 使用场景 |
|---|---|
| `test` | 新增或修改测试 |
| `feat` | 新增业务功能 |
| `fix` | 修复缺陷 |
| `refactor` | 重构且不改变外部行为 |
| `docs` | 修改文档或注释 |
| `style` | 仅调整代码格式 |
| `chore` | 构建、配置、归档或其他维护工作 |

```text
feat(verify): quote-shipping-rule free shipping for member goods of 80
chore(archive): quote-shipping-rule archive change and merge delta into living spec
```

### 编写规则

- 使用英文小写类型与阶段。
- `<change-id>` 必须与 `openspec/changes/` 下的目录名一致，保证可从提交回溯到 spec。
- 描述使用简洁动作表达，如 `add`、`support`、`extract`、`prevent`、`archive`。
- 描述应包含关键业务结果，如会员身份、金额门槛或预期行为。
- 不以句号结尾。
- 禁止 `update code`、`change test`、`fix issue`、`work in progress` 等模糊描述。
- 排除 IDE 文件、编译产物和无关格式化修改。

### 提交前验证

```bash
# Maven
mvn test

# Gradle
./gradlew test
```

- verify 提交前：`/opsx verify` 报告齐全（实现与 change artifacts 一致），完整测试集通过。
- archive 提交前：归档已完成，living spec 与知识库索引/日志已同步，完整测试集通过。

## Rationale

以 spec 为提交单元，让主干历史中的每个提交都对应一个"已验证、可评审、可整体回滚"的业务变更，而不是实现过程中的中间态。代价是 Red / Green / Refactor 的思考过程不再留在 Git 历史里，因此 Red 证据（失败原因、失败输出）必须记录在 verify 报告中，由报告承担过程可追溯性。

## Verification

| Check | Blocks |
|---|---|
| 每个 spec 是否恰好两次提交（verify / archive），阶段标记是否正确 | pr-merge |
| verify 提交前是否已通过 `/opsx verify` 且完整测试集通过 | pr-merge |
| archive 提交是否仅包含归档产物、living spec 合并与知识库更新 | pr-merge |
| Commit message 是否符合 `<type>(<stage>): <change-id> <description>` | pr-merge |
| 是否混入 WIP 中间提交、多个 spec 或无关修改 | pr-merge |

## Examples

```text
GOOD — 一个 change 两次提交
feat(verify): quote-shipping-rule free shipping for member goods of 80
chore(archive): quote-shipping-rule archive change and merge delta into living spec

BAD — 违反提交时机
test(red): add free shipping case for member with price 100      # 按 TDD 步骤提交（已废止）
feat(green): support free shipping for member goods of 80
refactor: extract member shipping threshold

BAD — 时机或原子性错误
feat: quote-shipping-rule done before verify                    # verify 未通过就提交
feat(verify): quote-shipping-rule + promotion-rule              # 两个 spec 混在一个提交
chore(archive): archive && merge living spec && fix typo        # 归档与无关修改混合
```

## Exceptions

- 非 spec 驱动的改动（勘误文档、CI 配置、依赖升级、工具脚本）可单次提交，按 `<type>: <description>` 省略 `<stage>` 与 `<change-id>`。
- 紧急缺陷修复可先提交 `fix: …` 止血，但须在同一迭代内补对应 change，并在提交说明中记录补单计划。
- 本文件的提交时机与 [tdd-cycle](tdd-cycle.md) 中任何"按 TDD 步骤提交"的表述冲突时，**以本文件为准**；tdd-cycle 的 Red / Green / Refactor 仅作为工作纪律保留。
