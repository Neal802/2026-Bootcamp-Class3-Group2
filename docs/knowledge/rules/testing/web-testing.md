# web-testing — 前端测试分层与写法（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | web-testing |
| **Category** | testing |
| **Priority** | High |
| **Activation** | auto |
| **Applies To** | all |
| **Stack** | react,typescript |

## Rule

### 分层

| 层 | 工具 | 放哪 | 测什么 |
|---|---|---|---|
| 纯逻辑单元 | 仓库现有（Vitest 或 `node --test`） | 与被测模块同目录 | 状态迁移、校验、格式化、请求参数拼装 |
| 组件 | Testing Library | 与组件同目录 | 渲染结果、交互回调、禁用态 |
| 端到端 | Playwright | `e2e/tests/` | 一条用户路径，含真实接口 |

测试框架按仓库现有脚本使用，不引入第二套做同一件事。

### 命名

- 文件名：单元 `xxx.test.ts`，组件 `Xxx.test.tsx`，端到端 `flow.spec.ts`。
- 用例名写英文陈述句，描述可观察行为：`appends the task to Backlog with default detail fields`、`shows the same saved quote after reloading the list`。禁止 `test1`、`works`、`should work`。
- `describe` 按被测函数或流程分组，与文件名一致。
- 端到端目录按用户流程命名文件，不按页面。

### 写法

- 查询优先 `getByRole`、`getByLabel`、`getByText`，CSS 选择器只用于结构断言（`.parcel-list li`）。
- 断言用户看得到的东西：文案、可见性、URL、输入值。不直接断言组件内部 state。
- 端到端一条用例走完一条完整路径（填表 → 保存 → 列表 → 详情 → 刷新），不在一条用例里塞多个不相关场景。
- 不保留 `console.log`。排查时临时加，提交前删。
- 异步等待用 `expect(...).toHaveText` 这类自动重试断言，不用 `waitForTimeout`。

### 提交前验证

按仓库已有脚本执行，不新增同义脚本：

```bash
npm run typecheck     # tsc --noEmit
npm run build         # tsc --noEmit && vite build
npm test              # 有 Vitest 的仓库
node --test tests/request.test.mjs   # 请求层脚本测试
npx playwright test   # 端到端，需要后端已启动
```

要求：类型检查零错误；改动的模块有对应测试；界面改动时至少跑通受影响的那条端到端用例。

### 与 SDD 的接点

- 规格里的验收场景直接落成端到端用例名，术语保持一致。
- `tasks.md` 中前端测试任务标注验证方式（类型检查、哪条 e2e）。

## Rationale

三层测试各回答一个问题：纯逻辑层验证"业务规则算得对"，组件层验证"用户看到的和能点的对"，端到端验证"整条路径在真实接口下走得通"。混层会让失败定位变慢——组件测试里做端到端的事，失败后无法判断是规则错还是渲染错。

## Verification

| Check | Blocks |
|---|---|
| 用例名是否为描述可观察行为的英文陈述句 | pr-merge |
| 纯逻辑是否有对应单元测试，是否与被测模块同目录 | pr-merge |
| 查询是否优先语义化选择器，是否残留 `console.log`、`waitForTimeout` | pr-merge |
| `npm run typecheck` 与 `npm run build` 是否通过 | pr-merge |
| 界面改动是否跑通受影响的端到端用例 | pr-merge |

## Examples

```ts
// GOOD
it('shows the same saved quote after reloading the list', async () => { /* ... */ });

// BAD
it('works', async () => { /* ... */ });
```

## Exceptions

- 仓库尚无端到端框架时，界面改动可用组件测试覆盖，并在 PR 描述中说明缺少哪一层验证。
- 第三方组件行为不可控时，允许对其使用 CSS 选择器断言，但需在注释中写明原因。
