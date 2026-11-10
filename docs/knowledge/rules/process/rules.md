# 流程规则（process）

本目录只有这一个规则文件，它是该分类的权威正文。规则 ID 就是二级标题，`@rule:<id>` 与索引中的 `#<id>` 都指向本文件里的同名小节。

## 适用范围

从规格到提交的整条工作流：先有规格再写代码（`spec-first`），实现按 TDD 纪律推进（`tdd-cycle`），提交以 spec 为单位（`git-commit-conventions`），分支与 PR 承载变更（`git-branching-and-pr`），评审按清单执行（`code-review-checklist`），Java 项目可挂编辑钩子（`java-hooks`）。

冲突时以更具体的规则为准：提交时机只看 `git-commit-conventions`，`tdd-cycle` 不定义提交边界。

## 规则总表

| ID | 规则 | 优先级 | 触发 | 适用栈 |
|---|---|---|---|---|
| spec-first | 先写规格再写代码 | Critical | always | — |
| tdd-cycle | TDD Red / Green / Refactor 循环 | Critical | always | — |
| git-commit-conventions | 提交时机（spec 级）与 commit message | Critical | always | — |
| git-branching-and-pr | 分支、PR、换行符与回滚 | High | always | — |
| code-review-checklist | Code Review 检查清单 | High | manual | java,react,typescript |
| java-hooks | Java 编辑钩子与本地检查 | Medium | auto | java |

## spec-first

**先写规格再写代码。** 没有该变更的规格包（change package），不写生产代码。

- 工件顺序：意图/提案 → 规格（可选设计）→ 任务 → 实现 → 归档。
- PR 必须引用稳定的 Spec ID，变更工件放在项目的 SDD 工作区内。
- Spec-First 义务与具体工具无关：OpenSpec、Speckit 等只是载体，选定一个并记录，不把政策文本绑死在某个工具或目录名上。

### 各阶段必须满足的内容要求

| 阶段 | 要求 |
|---|---|
| P1 提案 | `proposal.md` 写清 in-scope 与 out-of-scope；范围里出现「接口新增字段」时，必须同时开契约变更。 |
| P2 Delta Spec | 用 ADDED / MODIFIED / REMOVED 描述变更；每条变更带可验证的验收场景（输入 → 预期输出）；MODIFIED 条目要能说清旧行为与新行为的差异。 |
| P3 任务拆解 | `tasks.md` 每条任务标注落点（backend / frontend / contract / docs）与对应验证命令，一条任务只落一层；契约任务排在前后端任务之前。 |
| P4 实施验证 | 测试方法名与验收场景一一对应、术语一致；验证报告贴真实命令与输出摘要，不写「已验证」「测试通过」了事。 |
| P5 归档 | 本次变更如果改了团队做法，把新规则回写本规则目录并升版本；未回写的规则视为口头约定，不作为评审依据。 |

工件目录与命名见 [sdd-artifacts](../documentation/rules.md#sdd-artifacts)。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 是否有该变更的规格包与必需工件 | pr-merge |
| PR 描述是否含 Spec ID | pr-merge |
| P1–P5 各阶段内容要求是否满足 | pr-merge |

### 示例

```text
推荐：PR 引用 Spec ID: add-voucher-deduction，并附 openspec/changes/add-voucher-deduction/ 完整工件。
不推荐：功能分支只有生产代码，没有 Spec ID，也没有规格包。
```

### 例外

- `docs/**` 下的纯文档改动，在组织策略允许时可豁免。
- 只修改 SDD 工作区自身（规格工具树）的元编辑，不需要再套一层 change。

## tdd-cycle

**Red / Green / Refactor 循环。** 团队核心原则：测试先行；一次只推进一个业务场景；先确认测试因预期业务原因失败，再写最小实现；只在测试全绿时重构；代码、测试、注释与提交记录使用同一套业务术语；优先保证清晰，不以减少行数为目标。

提交边界不在这里定义：一个 change 只在 verify 通过后与 archive 之后各提交一次，见 `git-commit-conventions`。Red / Green / Refactor 是工作纪律，不是提交节点。

### Red：先写失败测试

目标：用一个新测试描述尚未实现的行为，并确认它因预期原因失败。

- 一次只新增一个业务场景；测试代码必须可编译。
- 必须运行并亲眼看到失败。
- 失败原因必须是业务未实现或结果不符；语法错误、空指针、测试数据错误、环境错误都不算有效 Red。
- 失败输出必须留存，作为 verify 报告里的 Red 证据（不再有 Red 提交承载它）。

```text
输入：
- member = true
- originalPrice = 100.00

预期：
- memberPrice = 80.00
- promotion = 0.00
- voucher = 0.00
- goods = 80.00
- shipping = 0.00
- total = 80.00
```

该场景的测试名：`in_member_originalPrice100_out_noPromotion_freeShipping()`，命名规则见 [java-testing](../testing/rules.md#java-testing)。

### Green：最小实现通过测试

- 不提前实现未被测试驱动的规则。
- 不在本阶段做大范围重命名或结构调整。
- 当前测试通过后运行完整测试集，确认没有回归。
- 本阶段不提交。

### Refactor：在全绿状态下重构

允许的重构：提取 `calculatePromotion` / `calculateShipping`、把魔法数字提为命名常量、把嵌套三元改为提前返回、消除重复的测试准备代码、改善命名、删除无意义注释与调试输出。

- 重构前测试必须全绿，过程中频繁运行测试。
- 完成后运行完整测试集。
- 不增加新的业务行为。
- 本阶段不提交。

### 完整循环

```text
Red      → 写失败测试，运行并记录失败输出            （不提交）
Green    → 最小实现，当前测试通过 + 全量回归          （不提交）
Refactor → 全绿状态下整理结构，全量测试通过            （不提交）
Verify   → /opsx verify 通过后提交一次
Archive  → /opsx archive 之后提交一次
```

同一 change 内可以连续跑多轮 Red / Green / Refactor，但只对应 verify 与 archive 两次提交。

### 检查项

| 检查 | 阻断点 |
|---|---|
| Red 是否因预期业务原因失败（而非编译、环境或数据错误） | pr-merge |
| Red 的失败原因与输出是否记入 verify 报告 | pr-merge |
| Green 是否只含使当前测试通过的最小实现 | pr-merge |
| Refactor 是否未改变业务行为，前后完整测试集是否通过 | pr-merge |
| 是否未在 verify 通过前提交任何中间态 | pr-merge |

### 示例

```text
场景：会员原价 100.00 免运费（同一 change 内）
1. Red      → 写 in_member_originalPrice100_out_noPromotion_freeShipping，运行并记录失败输出
2. Green    → 最小实现，当前测试通过 + 全量回归
3. Refactor → 全量测试通过后再整理结构
4. 提交     → /opsx verify 通过后：feat(verify): quote-shipping-rule free shipping for member goods of 80
5. 提交     → /opsx archive 之后：chore(archive): quote-shipping-rule archive change and merge delta into living spec
```

### 例外

- 纯文档、构建脚本、IDE 配置等无业务行为的改动不受 Red / Green / Refactor 约束。
- 紧急缺陷修复仍需先复现失败测试；确实无法先行时，须在提交说明中记录原因与补测计划。

## git-commit-conventions

**提交时机（spec 级）与 commit message。**

### 一个 spec 对应两次提交（CRITICAL）

以 OpenSpec change（下称 spec）为提交单元，一个 spec 只产生两次提交：

1. **verify 提交** — `/opsx verify`（`openspec-verify-change`）通过后，一次性提交该 change 的完整内容：delta spec、设计、任务、生产代码、测试与验证证据。
2. **archive 提交** — `/opsx archive`（`openspec-archive-change`）之后，提交归档结果：`openspec/changes/archive/**`、living spec 合并结果，以及随之更新的知识库（`docs/knowledge/**`）。

除此之外，change 进行过程中不产生提交：

- Red、Green、Refactor 不再各自提交——它们只是工作纪律。
- 禁止在 verify 通过之前提交（半成品、未通过验证的实现、未完成的任务）。
- 禁止把多个 spec 合并到同一个提交；禁止把 verify 与 archive 两次提交合并。

确需在协作/备份场景保存中间状态时，只能使用本地临时提交，并在 verify 提交前 squash 掉，不得进入主干历史。

### Commit message 格式

```text
<type>(<stage>): <change-id> <description>
```

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

编写规则：

- 类型与阶段用英文小写。
- `<change-id>` 必须与 `openspec/changes/` 下的目录名一致，保证能从提交回溯到 spec。
- 描述用简洁动作（`add`、`support`、`extract`、`prevent`、`archive`），包含关键业务结果（会员身份、金额门槛、预期行为）。
- 不以句号结尾；禁止 `update code`、`change test`、`fix issue`、`work in progress` 等模糊描述。
- 排除 IDE 文件、编译产物与无关格式化修改。

### 提交前验证

```bash
# Maven Wrapper
mvnw.cmd test        # Windows
./mvnw test          # 其他平台
```

- verify 提交前：`/opsx verify` 报告齐全（实现与 change artifacts 一致），完整测试集通过。
- archive 提交前：归档完成，living spec 与知识库索引/日志已同步，完整测试集通过。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 每个 spec 是否恰好两次提交（verify / archive），阶段标记是否正确 | pr-merge |
| verify 提交前是否已通过 `/opsx verify` 且完整测试集通过 | pr-merge |
| archive 提交是否只含归档产物、living spec 合并与知识库更新 | pr-merge |
| Commit message 是否符合 `<type>(<stage>): <change-id> <description>` | pr-merge |
| 是否混入 WIP 中间提交、多个 spec 或无关修改 | pr-merge |

### 示例

```text
推荐 — 一个 change 两次提交
feat(verify): quote-shipping-rule free shipping for member goods of 80
chore(archive): quote-shipping-rule archive change and merge delta into living spec

不推荐 — 违反提交时机
test(red): add free shipping case for member with price 100      # 按 TDD 步骤提交（已废止）
feat(green): support free shipping for member goods of 80
refactor: extract member shipping threshold

不推荐 — 时机或原子性错误
feat: quote-shipping-rule done before verify                     # verify 未通过就提交
feat(verify): quote-shipping-rule + promotion-rule               # 两个 spec 混在一个提交
chore(archive): archive && merge living spec && fix typo         # 归档与无关修改混合
```

### 例外

- 非 spec 驱动的改动（勘误文档、CI 配置、依赖升级、工具脚本）可单次提交，按 `<type>: <description>` 省略 `<stage>` 与 `<change-id>`。
- 紧急缺陷修复可先提交 `fix: …` 止血，但须在同一迭代内补对应 change，并在提交说明中记录补单计划。
- 本规则与 `tdd-cycle` 中任何「按 TDD 步骤提交」的表述冲突时，以本规则为准。

## git-branching-and-pr

**分支、PR、换行符与回滚。** 提交时机与 message 格式见 `git-commit-conventions`，此处不另立一套。

### 分支

| 分支 | 用途 | 命名 |
|---|---|---|
| `main` | 可运行的主线 | 固定名称 |
| 功能 | 一个 change 一条分支 | `feature/<change-id>` |
| 修复 | 一个缺陷一条分支 | `fix/<change-id>` |
| 检查点 | 按练习要求从指定起点重启 | `checkpoint/<序号>-<主题>` |

- `change-id` 与规格里的变更 ID 一致，kebab-case，动词开头：`add-voucher-deduction`、`fix-shipping-threshold`。
- 一条分支只服务一个变更，顺手改的无关内容另开分支，不搭车。
- 不从别人的功能分支拉新分支；需要依赖时先合入 `main`。
- 不直接提交 `main`。检查点分支例外，由当次说明决定。

### PR

标题沿用 commit 风格，前面加 change-id：

```text
[add-voucher-deduction] feat: deduct voucher from promoted price
```

描述五项缺一项不予评审：

1. **Spec ID**：change-id 与 Delta Spec 位置。
2. **落点**：backend / frontend / contract / docs，各改了什么。
3. **验证**：执行的命令与结果摘要，不写「已测试」。
4. **契约影响**：是否改 `openapi.yaml`；改了贴 diff，没改写「无」。
5. **界面截图**：涉及界面时附上，路径相对仓库根。

- 一个 PR 对应一个 change；跨 change 的改动拆成多个 PR，否则归档时无法对应。
- 不合并自己没跑过验证的代码；历史被改写过要重跑。
- G2 验证通过后才合入，合入前验证结果必须是当前提交跑出来的。
- P5 归档时把 PR 链接写进变更摘要，作为完整轨迹。

### 换行符与编码

- 文本文件统一 LF。仓库根放 `.gitattributes`：`* text=auto eol=lf`。
- 例外只有 Windows 脚本：`*.cmd text eol=crlf`、`*.bat text eol=crlf`；已有的 `*.cmd whitespace=cr-at-eol` 保留，再补 eol 规则。
- 文件编码统一 UTF-8，不提交 BOM。
- 不让 `core.autocrlf` 的自动转换把已提交的 LF 文件改成 CRLF。

这不是洁癖：`core.autocrlf=true` 把检出文件转成 CRLF、生成脚本又写回 LF 时，「重新生成结果与仓库内容一致」的校验会莫名失败。

### 不提交的内容

```text
target/            Maven 构建产物
node_modules/      前端依赖
dist/              前端构建产物
.metals/           语言服务器缓存
*.mv.db *.trace.db H2 数据库文件
.idea/ *.iml       IDE 配置
e2e/test-results/  Playwright 产物
e2e/results.json   测试报告
.DS_Store
```

新增工具产生缓存目录时，先加 `.gitignore` 再继续，不先提交再删。

### 回滚

- 合并后发现问题用 `git revert` 生成反向提交，不改写已推送历史。
- 不对 `main` 做 force push。
- 不删除别人的分支，不用 `reset --hard` 处理共享分支。
- 回滚也走 PR，描述里写清回滚原因与受影响的变更。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 分支名是否为 `feature|fix|checkpoint` + change-id，是否只服务一个 change | pr-merge |
| PR 描述是否含 Spec ID、落点、验证、契约影响、截图五项 | pr-merge |
| PR 标题是否为 `[<change-id>] <type>: <description>` | pr-merge |
| 是否一个 PR 对应一个 change，验证结果是否来自当前提交 | pr-merge |
| 文本文件是否 LF、无 BOM，`.gitattributes` 是否覆盖 `.cmd` / `.bat` 例外 | pr-merge |
| 是否混入 `target/`、`node_modules/`、`dist/`、IDE 配置与测试产物 | pr-merge |
| 回滚是否用 `git revert` 生成反向提交并走 PR | pr-merge |

### 示例

```text
推荐  branch: feature/add-voucher-deduction
推荐  PR:     [add-voucher-deduction] feat: deduct voucher from promoted price
不推荐 branch: dev / test2 / zhangsan
不推荐 PR 描述: "改了一些东西，测试过了"
```

```gitattributes
* text=auto eol=lf
*.cmd text eol=crlf
*.bat text eol=crlf
```

### 例外

- 提交时机与 message 格式以 `git-commit-conventions` 为准，本规则不规定 commit 粒度。
- 单人练习仓库可省略 PR 流程，但仍需在变更摘要里写明验证命令与结果。
- 仓库已有等价 `.gitattributes` 时不重复改写。

## code-review-checklist

**Code Review 检查清单。** 评审只判断三件事：是否符合规格、是否符合本规则目录、是否留下隐患。风格偏好不构成阻断理由。条目与其来源规则冲突时，以来源规则为准；本清单只做索引，不新增规范。

### 生产代码

- [ ] 包名全小写，类按特性平铺在 `training.<domain>` 下。
- [ ] 类名、方法名、变量名、常量名符合 `java-coding-style`，类名后缀表达职责。
- [ ] 金额统一 `BigDecimal` + `Money.amount`，比较用 `compareTo`。
- [ ] 除法与按比例计算显式指定 `RoundingMode`，分与元转换只在边界层。
- [ ] 内部常量优先 `private static final`；同一阈值只定义一次，能在规格里找到出处。
- [ ] 无魔法数字、无嵌套三元，中间变量都有命名。
- [ ] 计算顺序可从上到下读出；促销门槛基于 `memberPrice`，运费门槛基于券后 `goods`。
- [ ] 输入非法抛 `IllegalArgumentException`，业务拒绝用专门异常类型。
- [ ] 注释说明业务原因，无流水账编号注释与调试代码。

### 持久化

- [ ] 迁移脚本只增不改，命名为 `V<序号>__<动词_名词>.sql`。
- [ ] 时间存 UTC，取时间走可注入时钟。
- [ ] 领域对象未标 JPA 注解，行对象与领域对象分离。
- [ ] 仓储接口在业务包内，实现可替换。

### 测试代码

- [ ] 测试类名符合 `被测类名 + Test` / `被测类名 + 场景 + Test`。
- [ ] 方法名符合 `in_<输入条件>_out_<关键预期结果>`，用 `member` / `nonMember`，金额带字段名。
- [ ] 小数用下划线（`200_01`），无双重否定，只写关键输出。
- [ ] 使用 Given / When / Then；多字段用 `assertAll`，每条带字段名第三参数。
- [ ] 断言顺序与计算顺序一致；阈值引用常量；无 `System.out.println`。
- [ ] 门槛覆盖以下、等于、以上；一个测试只描述一个业务场景。

### 前端

- [ ] 业务逻辑在组件之外，纯函数有单元测试。
- [ ] 接口字段保持 snake_case，没有私自转驼峰。
- [ ] 请求统一走 `api.ts`，错误按契约 `code` 原值判断。
- [ ] 类型与 `openapi.yaml` 一一对应，`any` 已消除。
- [ ] 表单控件有 label，可交互元素是 `button` 或 `a`。
- [ ] 文案集中在 `messages.ts`，无拼接句。
- [ ] 组件命名 UpperCamel 且文件名与组件名一致；状态用可辨识联合。
- [ ] 无 `console.log`、`waitForTimeout` 与直接 DOM 查询。
- [ ] 界面改动跑通受影响的端到端用例。

### 契约

- [ ] 契约先于两端代码改动。
- [ ] 路径为复数资源，无动词资源名，版本未写进路径。
- [ ] 字段 snake_case、金额 `_cents`、时间 `_at` + UTC。
- [ ] 必填在 `required`，服务端生成字段 `readOnly`，请求体有成功与拒绝两个 example。
- [ ] 400 与 422 边界未漂移，错误体只有 `code`。
- [ ] 新增错误码在契约、后端、前端三处一致。
- [ ] 破坏性变更已升主版本或标 `deprecated`，两端测试都跑过。

### TDD 与 Git

- [ ] Red 测试因预期业务原因失败，失败输出记入 verify 报告。
- [ ] Green 只含使当前测试通过的最小实现。
- [ ] Refactor 未改变业务行为；Green 与 Refactor 后完整测试集通过。
- [ ] 该 change 恰好两次提交：verify 通过后一次、archive 之后一次。
- [ ] 未出现按 TDD 步骤拆分的中间提交。
- [ ] archive 提交只含归档产物、living spec 合并与知识库更新。
- [ ] Commit message 符合 `<type>(<stage>): <change-id> <description>`。
- [ ] 未把两个 spec 或无关修改放入同一 commit。
- [ ] 已排除 IDE 文件、编译产物与无关格式化修改。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 生产代码段与持久化段是否全部勾选 | pr-merge |
| 测试代码段是否全部勾选 | pr-merge |
| 前端段是否全部勾选 | pr-merge |
| 契约段是否全部勾选 | pr-merge |
| TDD 与 Git 段是否全部勾选 | pr-merge |

### 示例

```text
有效评审意见：
  in_member_price100_out_freeShipping 命名未注明字段类型，
  应为 in_member_originalPrice100_out_noPromotion_freeShipping
  （见 rules/testing/rules.md#java-testing）

无效评审意见：
  命名不够清晰，改一下
```

### 例外

- `docs`、`chore`、`style` 类提交可只应用与改动范围相关的条目。
- 本次变更涉及不到的分段（如纯后端变更的「前端」段）可标记为不适用，但需在评审记录里写明。

## java-hooks

**Java 编辑钩子与本地检查。** 在宿主 agent 的钩子设置中配置 PostToolUse：

- **google-java-format**：编辑 `.java` 文件后自动格式化。
- **编译检查**：改动后执行 `mvnw.cmd compile`（Windows）或 `./mvnw compile`，确认仍然可编译。
- **checkstyle**：仅在仓库确实引入 Checkstyle 时启用；当前团队明确未引入 Checkstyle / ESLint / Prettier，格式靠评审与 IDE 默认值，不要为单个提交引入新工具链。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 改动 `java` 源码后是否仍可编译 | pr-merge |
| 若仓库已启用格式化/静态检查，是否已运行 | pr-merge |

### 例外

- 仓库未引入的检查工具不因本规则而引入；要引入须先在提案里说明并整体落地。

## 为什么这样定

以 spec 为提交单元，让主干历史里每个提交都对应一个「已验证、可评审、可整体回滚」的业务变更，而不是实现过程中的中间态。代价是 Red / Green / Refactor 的思考过程不再留在 Git 历史里，因此 Red 证据（失败原因与输出）必须记录在 verify 报告中，由报告承担过程可追溯性。分支与 PR 是 change 的外层容器：边界清楚，评审才能只针对一个变更判断，归档时也才能把提交、规格、PR 对应起来。

## 全分类检查清单

| 检查 | 阻断点 |
|---|---|
| 是否有规格包与 Spec ID，P1–P5 内容是否齐全 | pr-merge |
| Red / Green / Refactor 纪律是否遵守，Red 证据是否留存 | pr-merge |
| 一个 spec 是否恰好两次提交，message 是否合规 | pr-merge |
| 分支与 PR 五要素是否齐全，换行符与提交内容是否干净 | pr-merge |
| 评审清单是否逐段勾选 | pr-merge |
