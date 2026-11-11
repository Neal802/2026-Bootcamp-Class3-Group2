# 文档规则（documentation）

本目录只有这一个规则文件，它是该分类的权威正文。规则 ID 就是二级标题，`@rule:<id>` 与索引中的 `#<id>` 都指向本文件里的同名小节。

## 适用范围

`document-conventions` 管一般文档的命名、目录、骨架、语言与引用；`sdd-artifacts` 管 OpenSpec 工件与验证报告的目录与文件名。代码注释规则属于语言规范，不在本文件（见 [java-coding-style](../quality/rules.md#java-coding-style) 与 [web-coding-style](../quality/rules.md#web-coding-style)）。

## 规则总表

| ID | 规则 | 优先级 | 触发 | 适用栈 |
|---|---|---|---|---|
| document-conventions | 文档命名、结构、语言与引用 | Medium | auto | — |
| sdd-artifacts | SDD 工件目录与命名 | High | always | — |

## document-conventions

**文档命名、结构、语言与引用。**

### 文件命名

规范与方案类：

```text
<class>-<group>-<topic>-<yyyymmdd>-v<n>.md
```

- `topic` 用 kebab-case、英文，描述内容而不是文种：写 `backend-java`，不写 `doc1`。
- 日期是**该版本定稿的日期**，不是起草日期。
- 版本号从 `v1` 开始只增不减；修改后新文件另存，旧文件保留并标注被取代。
- 拆分后的一组文档共用同一日期与版本号，一眼能看出是同一批。

记录与附件类：

| 类型 | 命名 | 例子 |
|---|---|---|
| 日报 | `work/<yyyymmdd>/ORID.md` | `work/20261030/ORID.md` |
| 评审记录 | `<yyyymmdd>-review-<topic>.md` | `20261110-review-backend-rules.md` |
| 变更摘要 | `openspec/changes/<change-id>/summary.md` | `add-voucher-deduction/summary.md` |
| 截图 | `<topic>-<画面>.png`，放 `assets/` | `assets/quote-detail-after-save.png` |
| 图表源文件 | 与导出图同名，扩展名不同 | `sdd.excalidraw` / `sdd.svg` |

禁止：`新建文档.md`、`最终版.md`、`最终版2.md`、`temp.md`，以及带空格或中文的文件名。日期统一 `yyyymmdd`，不用 `2026.11.10` 或 `11-10`。

### 目录

| 位置 | 放什么 | 不放什么 |
|---|---|---|
| 团队共享目录（`TATP/team-docs/`） | 小组规范、方案、评审记录 | 个人作业产物、临时草稿 |
| 团队共享目录 `work/<yyyymmdd>/` | 当天日报与当日材料 | 跨天复用的规范 |
| 个人提交目录（`my-report/`） | 个人交付与当次作业；作业要求交在这里时它就是正文位置 | 与正文同名的第二份拷贝 |
| `<repo>/openspec/` | 规格与变更包 | 会议记录、日报 |
| `<repo>/docs/` | 仓库级说明、契约、规则 | 个人笔记 |

**同一份规范的正文只放一处。** 正文在别处时，另一处只放指针文件写明「正文见某路径」，不复制正文，避免两份慢慢写歪。

### 文档骨架

```markdown
---
id: kb.rules.<slug>
title: <标题>
version: <n>
updated: <yyyymmdd>
area: rules
---

# 标题

## 1. 适用范围
## 2. 正文分节（按主题，不按篇幅）
## N. 检查清单
## N+1. 与 SDD 的接点（涉及流程的文档才写）
```

缺段要在开头说明原因。要求：

- 标题最多三级。四级标题说明该拆分文件了。
- 开头一段说清这份文档解决什么问题、谁该读，不超过五行。
- 规则用陈述句，一条一个意思。不用「原则上」「尽量」这类无法判定的词：要么是要求，要么是建议并标明。
- 例子必须来自本组真实代码，不编造类名、字段名。示例与规则冲突时，先改示例。
- 表格用于对照，不用于堆长句；单元格内容超过两行改成列表。
- 每份规范结尾给检查清单，检查项可判定，并标注阻断点是「评审」还是「合并前」。

### 语言与术语

- 正文中文；代码、标识符、命令、字段名、commit message 用英文。
- 术语一次定义、全程复用；金额字段固定 `originalPrice`、`memberPrice`、`promotion`、`voucher`、`goods`、`shipping`、`total`。
- 不用同义词轮换：同一份文档里不出现「报价、报价单、询价单」三种说法指同一件事。
- 缩写首次出现写全称：`SDD（Spec Driven Development）`。
- 不使用「赋能」「抓手」「闭环」「打通」这类含义模糊的词，写具体动作：先改契约、再改两端。

常用术语表：

| 术语 | 含义 | 不用 |
|---|---|---|
| quote | 一次报价的计算结果 | quotation、order |
| voucher | 代金券抵扣金额 | coupon、discount（促销用 promotion） |
| promotion | 满减促销金额 | discount |
| goods | 折扣、促销、代金券依次扣减后的商品金额 | netPrice、finalPrice |
| change | 一次规格驱动的变更单元 | task、ticket |
| change-id | 变更标识，与分支名一致 | ticket-no |

### 日报（ORID）

四段固定顺序，每段三到六句：

| 段 | 写什么 | 判定标准 |
|---|---|---|
| O 客观事实 | 今天做了什么、改了哪些文件、数字是多少 | 不看代码也能复述发生了什么 |
| R 感受反思 | 卡在哪、意外在哪、情绪状态 | 说具体位置，不写「收获很大」 |
| I 理解诠释 | 为什么这样做对或错，背后的原理 | 能解释给没参加的人听 |
| D 行动决定 | 下次具体怎么做，可执行 | 下周能被检查是否做到 |

- 事实带数字与文件名，例如「M6×2+M10×1 的用例」，不写「补了一些测试」。
- 感受写触发点，例如「语法合法但语义错，肉眼 review 无效」，不写「有点难」。
- 理解要落到机制，例如「聚合键的选择是业务语义的声明」。
- 决定要可验证，例如「下次跳过通读，先构造最小可区分用例」。
- 不写流水账时间线。ORID 是给未来的自己看的判断记录，不是打卡。

### 图表与附件

- 优先 Mermaid，直接写在 Markdown 里，随文档一起进入版本管理。
- 需要手绘的用 Excalidraw，源文件与导出图同名同目录，两个都提交。
- 截图只截相关内容，去掉无关窗口；界面截图保留浏览器地址栏路径，便于对照路由。
- 图片放 `assets/`，文件名 kebab-case，不出现 `截图20261110(1).png`。

### 链接与引用

- 文档之间用相对路径链接，不写 `D:\software\training\...` 这类绝对路径，换机器就断。
- 引用代码写文件路径与符号名，不写行号，行号会变。
- 引用外部资料给完整标题与链接，不只贴 URL。
- 引用规格写 change-id 与文件路径：`openspec/changes/add-voucher-deduction/specs/quote-pricing/spec.md`。
- 引用本规则目录时用 `rules/<category>/rules.md#<id>` 形式，直接指向规则小节。

### 更新与版本

- 规范的修改走 PR，与代码改动一样；改完在文件头更新 `version` 与 `updated`。
- 只有三种情况升版本：新增强制规则、删除已有规则、修改会导致既有代码不合规。补例子、修错别字只改 `updated`。
- 评审文档看三件事：有没有可判定的规则、例子是否来自真实代码、检查清单能不能直接照着做。
- 过期文档标注「已废弃」并写明替代文档，不直接删除。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 文件名是否符合规范类或记录类命名 | 评审 |
| 文件头是否有 id、title、version、updated | 评审 |
| 开头是否说明适用范围与读者；标题是否不超过三级 | 评审 |
| 例子是否来自真实代码且与规则一致 | 评审 |
| 术语是否与术语表一致，无同义词轮换 | 评审 |
| 是否无绝对路径、链接可点开 | 合并前 |
| 规范类文档是否有检查清单并标注阻断点 | 评审 |
| 变更是否升版本或只改 `updated`，符合升版条件 | 评审 |

### 示例

```text
推荐  class3-group2-backend-java-20261110-v2.md
推荐  work/20261030/ORID.md
不推荐 后端规范-最终版2.md
不推荐 /home/alice/training/team-docs/backend.md（绝对路径）
```

### 例外

- 第三方模板或工具生成的目录结构（如 `.github/`）不强制套用本命名。
- 一次性排查记录、会话日志等非交付文档可放临时目录，不进入版本管理。

## sdd-artifacts

**SDD 工件目录与命名。** 什么时候必须产出这些工件见 [spec-first](../process/rules.md#spec-first)。

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

- `tasks.md` 一条任务只落一层；跨层任务拆开，否则无法判断验证该由谁跑。
- 验证报告贴真实命令与输出摘要，不写「已验证」「测试通过」四个字。
- 决策记录只记录已经发生的裁定，不预填结论。

### 与版本的关系

- 契约版本（`openapi.yaml` 的 `info.version`）变化时，把版本号写进 `summary.md`，便于回溯推进历史。
- 归档后活规格被更新，`changes/archive/<change-id>/` 保持不变，作为不可变的历史证据。
- 团队做法的变更在 P5 回写本规则目录并升版本；未回写的口头约定不作为评审依据。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 变更包是否在 `openspec/changes/<change-id>/` 且自包含 | pr-merge |
| `<capability>` 是否为名词短语 kebab-case，`<change-id>` 是否为动词开头 kebab-case | pr-merge |
| change-id 是否与分支名、PR 标题一致 | pr-merge |
| 决策记录是否为 `g1/g2/g3-decision.md` 固定名 | 归档前 |
| 一个 change 是否只改一个 capability | 归档前 |
| 验证报告是否位于 `docs/ai4se-plugins/<时间戳>-<技能名>-report.md` 且含真实输出 | pr-merge |
| 归档后 `changes/archive/<change-id>/` 是否保持不可变 | 归档前 |

### 示例

```text
推荐  openspec/changes/add-voucher-deduction/specs/quote-pricing/spec.md
推荐  openspec/changes/archive/fix-shipping-threshold/g2-decision.md
不推荐 openspec/changes/voucher/G1决策-最终.md
不推荐 openspec/specs/报价/spec.md
```

### 例外

- 预规格阶段的探索产物放 `requirement-workspace/`，不进入 `openspec/changes/`；交接完成后按 change 拆包。
- 纯文档或工具配置类变更可不产出 `design.md`，但需在 `proposal.md` 说明省略原因。

## 为什么这样定

文档的可检索性来自命名与目录，可判定性来自陈述句与检查清单；两者缺失时，规范会退化成「大家都知道但没人照做」的口头约定。SDD 的价值在于从意图到代码的可追溯性，而可追溯性依赖固定路径与固定文件名：决策记录一旦出现 `G1决策-最终.md` 这类变体、增量规格散落在多个目录，归档时无法机械校验完整性，也无法从提交反查规格。正文唯一则是为了防止两份拷贝各自演化后无法判断哪份有效。

## 全分类检查清单

| 检查 | 阻断点 |
|---|---|
| 文件名、目录归属、文件头字段是否合规 | 评审 |
| 术语是否唯一，例子是否来自真实代码 | 评审 |
| 链接是否为相对路径且可点开 | 合并前 |
| SDD 工件目录与文件名是否符合约定 | 归档前 |
