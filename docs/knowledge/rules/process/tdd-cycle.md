# tdd-cycle — TDD Red / Green / Refactor 循环（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | tdd-cycle |
| **Category** | process |
| **Priority** | Critical |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | java |

## Rule

团队核心原则：测试先行；一次只推进一个业务场景；先确认测试因预期业务原因失败，再编写最小实现；只在测试全部通过时重构；代码、测试、注释和提交记录都应准确表达业务意图；优先保证代码清晰，不以减少代码行数为目标。

提交边界不在这里定义：一个 change 只在 verify 通过后与 archive 之后各提交一次，见 [git-commit-conventions](git-commit-conventions.md)。Red / Green / Refactor 是工作纪律，不是提交节点。

### Red：先写失败测试

目标：用一个新测试描述尚未实现的业务行为，并确认测试因预期原因失败。

- 一次只新增一个业务场景。
- 测试代码必须可以编译。
- 必须运行测试并亲自看到失败。
- 失败原因必须是业务功能尚未实现或结果不符合预期。
- 因语法错误、空指针、测试数据错误或环境错误导致的失败，不属于有效的 Red。
- 失败输出必须留存，作为 verify 报告中的 Red 证据（因为不再有 Red 提交承载它）。

```text
输入：
- member = true
- originalPrice = 100.00

预期：
- memberPrice = 80.00
- promotion = 0.00
- goods = 80.00
- shipping = 0.00
- total = 80.00
```

该场景的测试名：`in_member_originalPrice100_out_noPromotion_freeShipping()`，命名规范见 [java-testing](../testing/java-testing.md)。

### Green：最小实现通过测试

目标：只编写足以使当前失败测试通过的最小生产代码。

- 不提前实现尚未被测试驱动的规则。
- 不在 Green 阶段进行大规模重命名或结构调整。
- 当前测试通过后，还要运行完整测试集，确认没有回归。
- 本阶段不提交。

### Refactor：在全绿状态下重构

目标：不改变外部行为，只改善代码结构和表达。允许的重构包括：提取 `calculatePromotion`、提取 `calculateShipping`、将魔法数字提取为命名常量、将多层三元表达式改为提前返回、消除重复测试准备代码、改善变量/方法/测试名称、删除无意义注释和调试输出。

- 重构前测试必须全部通过。
- 重构过程中应频繁运行测试。
- 重构完成后必须运行完整测试集。
- 不在 Refactor 阶段增加新的业务行为。
- 本阶段不提交。

### 完整循环

```text
Red      → 写失败测试，运行并记录失败输出            （不提交）
Green    → 最小实现，当前测试通过 + 全量回归          （不提交）
Refactor → 全绿状态下整理结构，全量测试通过            （不提交）
Verify   → /opsx verify 通过后提交一次
Archive  → /opsx archive 之后提交一次
```

每个阶段都应保持可理解、可回滚。同一 change 内可以连续跑多轮 Red / Green / Refactor，但只对应 verify 与 archive 两次提交，这两次提交的职责划分见 [git-commit-conventions](git-commit-conventions.md)。

## Rationale

Red / Green / Refactor 分离使得每一步都有可观察的验证信号：Red 证明测试确实能捕获缺失行为，Green 证明实现只满足当前场景，Refactor 在测试保护下改善结构而不改变行为。合并步骤会让失败原因与结构变动混在一起，无法定位回归来源。提交时机按 spec 归并后，过程证据由 verify 报告承担，循环本身仍是必须遵守的纪律。

## Verification

| Check | Blocks |
|---|---|
| Red 测试是否因预期业务原因失败（而非编译、环境或数据错误） | pr-merge |
| Red 的失败原因与输出是否记入 verify 报告 | pr-merge |
| Green 是否只包含使当前测试通过的最小实现 | pr-merge |
| Refactor 是否未改变业务行为，重构前后完整测试集是否通过 | pr-merge |
| 是否未在 verify 通过前提交任何中间态 | pr-merge |

## Examples

```text
User scenario: 会员原价 100.00 免运费（同一 change 内）
1. Red      → 写 in_member_originalPrice100_out_noPromotion_freeShipping，运行并记录失败输出
2. Green    → 最小实现，当前测试通过 + 全量回归
3. Refactor → 全量测试通过后再整理结构
4. Commit   → /opsx verify 通过后：feat(verify): quote-shipping-rule free shipping for member goods of 80
5. Commit   → /opsx archive 之后：chore(archive): quote-shipping-rule archive change and merge delta into living spec
```

## Exceptions

- 纯文档、构建脚本、IDE 配置等无业务行为的改动不受 Red / Green / Refactor 约束。
- 紧急缺陷修复仍需先复现失败测试；若确实无法先行，须在提交说明中记录原因与后续补测计划。
