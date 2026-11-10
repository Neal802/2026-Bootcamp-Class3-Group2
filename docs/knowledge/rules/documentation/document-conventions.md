# document-conventions — 文档命名、结构、语言与引用（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | document-conventions |
| **Category** | documentation |
| **Priority** | Medium |
| **Activation** | auto |
| **Applies To** | all |
| **Stack** | — |

## Rule

适用范围：小组共享的规范、方案、评审记录、日报。SDD 工件（proposal、delta spec、决策记录、验证报告）的目录与命名见 [sdd-artifacts](sdd-artifacts.md)。代码注释规则属于语言规范，不在本文件。

### 文件命名

规范与方案类：

```text
<class>-<group>-<topic>-<yyyymmdd>-v<n>.md
```

- `topic` 用 kebab-case、英文，描述内容而不是文种：写 `backend-java`，不写 `doc1`。
- 日期是**该版本定稿的日期**，不是起草日期。
- 版本号从 `v1` 开始只增不减。修改后新文件另存，旧文件保留并标注被取代。
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
- 不使用「赋能」「抓手」「闭环」「打通」这类含义模糊的词。写具体动作：先改契约、再改两端。

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

### 更新与版本

- 规范的修改走 PR，与代码改动一样；改完在文件头更新 `version` 与 `updated`。
- 只有三种情况升版本：新增强制规则、删除已有规则、修改会导致既有代码不合规。补例子、修错别字只改 `updated`。
- 评审文档看三件事：有没有可判定的规则、例子是否来自真实代码、检查清单能不能直接照着做。
- 过期文档标注「已废弃」并写明替代文档，不直接删除。

## Rationale

文档的可检索性来自命名与目录，可判定性来自陈述句与检查清单；两者缺失时，规范会退化成「大家都知道但没人照做」的口头约定。正文唯一则是为了防止两份拷贝各自演化后无法判断哪份有效。

## Verification

| Check | Blocks |
|---|---|
| 文件名是否符合 `<class>-<group>-<topic>-<yyyymmdd>-v<n>.md` 或记录类命名 | 评审 |
| 文件头是否有 id、title、version、updated | 评审 |
| 开头是否说明适用范围与读者；标题是否不超过三级 | 评审 |
| 例子是否来自真实代码且与规则一致 | 评审 |
| 术语是否与术语表一致，无同义词轮换 | 评审 |
| 是否无绝对路径、链接可点开 | 合并前 |
| 规范类文档是否有检查清单并标注阻断点 | 评审 |
| 变更是否升版本或只改 `updated`，符合升版条件 | 评审 |

## Examples

```text
GOOD  class3-group2-backend-java-20261110-v2.md
GOOD  work/20261030/ORID.md
BAD   后端规范-最终版2.md
BAD   /home/alice/training/team-docs/backend.md（绝对路径）
```

## Exceptions

- 第三方模板或工具生成的目录结构（如 `.github/`）不强制套用本命名。
- 一次性排查记录、会话日志等非交付文档可放临时目录，不进入版本管理。
