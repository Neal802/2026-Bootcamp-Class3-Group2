# git-branching-and-pr — 分支、PR、换行符与回滚（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | git-branching-and-pr |
| **Category** | process |
| **Priority** | High |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | — |

## Rule

本文件只管分支拆分、PR 内容、换行符与回滚。**提交时机与 commit message 格式见 [git-commit-conventions](git-commit-conventions.md)**，此处不得另立一套。

### 分支

| 分支 | 用途 | 命名 |
|---|---|---|
| `main` | 可运行的主线 | 固定名称 |
| 功能 | 一个 change 一条分支 | `feature/<change-id>` |
| 修复 | 一个缺陷一条分支 | `fix/<change-id>` |
| 检查点 | 按练习要求从指定起点重启 | `checkpoint/<序号>-<主题>` |

- `change-id` 与规格里的变更 ID 一致，kebab-case，动词开头：`add-voucher-deduction`、`fix-shipping-threshold`。
- 一条分支只服务一个变更。顺手改的无关内容另开分支，不搭车。
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

- 一个 PR 对应一个 change。跨 change 的改动拆成多个 PR，否则归档时无法对应。
- 不合并自己没跑过验证的代码；历史被改写过要重跑。
- G2 验证通过后才合入，合入前验证结果必须是当前提交跑出来的。
- P5 归档时把 PR 链接写进变更摘要，作为完整轨迹。

### 换行符与编码

- 文本文件统一 LF。仓库根放 `.gitattributes`：`* text=auto eol=lf`。
- 例外只有 Windows 脚本：`*.cmd text eol=crlf`、`*.bat text eol=crlf`。已有的 `*.cmd whitespace=cr-at-eol` 保留，再补 eol 规则。
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

## Rationale

分支与 PR 是 change 的外层容器：容器边界清楚，评审才能只针对一个变更判断，归档时也才能把提交、规格、PR 对应起来。换行符规则看似无关业务，却直接决定「重新生成是否与仓库一致」这类校验能否成立。

## Verification

| Check | Blocks |
|---|---|
| 分支名是否为 `feature|fix|checkpoint` + change-id，是否只服务一个 change | pr-merge |
| PR 描述是否含 Spec ID、落点、验证、契约影响、截图五项 | pr-merge |
| PR 标题是否为 `[<change-id>] <type>: <description>` | pr-merge |
| 是否一个 PR 对应一个 change，且验证结果来自当前提交 | pr-merge |
| 文本文件是否 LF、无 BOM，`.gitattributes` 是否覆盖 `*.cmd` / `*.bat` 例外 | pr-merge |
| 是否混入 `target/`、`node_modules/`、`dist/`、IDE 配置与测试产物 | pr-merge |
| 回滚是否用 `git revert` 生成反向提交并走 PR | pr-merge |

## Examples

```text
GOOD  branch: feature/add-voucher-deduction
GOOD  PR:     [add-voucher-deduction] feat: deduct voucher from promoted price
BAD   branch: dev / test2 / zhangsan
BAD   PR 描述: "改了一些东西，测试过了"
```

```gitattributes
* text=auto eol=lf
*.cmd text eol=crlf
*.bat text eol=crlf
```

## Exceptions

- 提交时机与 message 格式以 [git-commit-conventions](git-commit-conventions.md) 为准；本文件不规定 commit 粒度。
- 单人练习仓库可省略 PR 流程，但仍需在变更摘要里写明验证命令与结果。
- 仓库已有 `.gitattributes` 且规则等价的，不重复改写。
