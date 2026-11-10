# web-coding-style — 前端 Web 编码风格（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | web-coding-style |
| **Category** | quality |
| **Priority** | High |
| **Activation** | auto |
| **Applies To** | all |
| **Stack** | react,typescript |

## Rule

### 适用范围

- React 18 或 19，以仓库 `package.json` 为准，不为统一而升级。
- TypeScript 严格模式，构建走 `tsc --noEmit && vite build`。
- Vite 作为开发服务器与打包器。
- 测试框架不强行统一：仓库已有 `node --test`、Vitest、Playwright 三种，按现有脚本用，不引入第二套做同一件事。

字段与错误码以 [api-contract](../architecture/api-contract.md) 为准；跨端命名见 [naming-conventions](naming-conventions.md)。

### 目录

```text
frontend/
  src/
    api.ts              请求层，唯一出口
    types.ts            契约类型与本地视图类型
    App.tsx             路由与页面骨架
    main.tsx            挂载入口
    styles.css          全局样式与变量
    components/         可复用组件
    <feature>/          业务模块，纯逻辑与状态放这里
    i18n/               文案与语言上下文
  tests/                非组件级的脚本测试
e2e/
  tests/                端到端用例
  playwright.config.ts
```

- 业务逻辑不写进组件。可计算、可测试的部分（状态迁移、校验、格式化）放到 `<feature>/*.ts`，组件只做取值、渲染、绑事件。
- 一个组件文件只导出一个组件，文件名与组件同名。
- 页面与组件分开命名：路由级页面用 `XxxPage.tsx`，可复用片段用名词（`ParcelForm`、`QuoteList`）。
- 纯逻辑模块用小驼峰文件名（`api.ts`、`types.ts`、`boardState.ts`）。
- 测试文件与被测模块同目录同名加后缀：`boardState.test.ts`、`ParcelForm.test.tsx`。

### 命名

| 对象 | 规则 | 例子 |
|---|---|---|
| 组件文件与组件 | UpperCamel，两者同名 | `ParcelForm.tsx` → `ParcelForm` |
| 页面组件 | `XxxPage` | `QuoteDetailPage` |
| hook | `useXxx`，文件名同 | `useQuotes.ts` → `useQuotes` |
| Context 与 Provider | `XxxContext` / `XxxProvider` | `LanguageContext` |
| 类型与接口 | UpperCamel，不加 `I` 前缀 | `ParcelInput`、`FieldErrors` |
| 联合类型成员 | 小写字符串字面量 | `'created' \| 'moved'` |
| 常量 | UPPER_SNAKE 或 `as const` 数组 | `LABEL_COLORS` |
| 事件处理函数 | `handleXxx`；props 用 `onXxx` | `handleSubmit` / `onAdd` |
| 请求函数 | 动词加资源名 | `loadQuotes`、`saveQuote`、`reviseQuote`、`deleteQuote` |
| 布尔 UI 状态 | `is` / `has` 前缀 | `isLoading`、`hasError` |
| CSS 类 | kebab-case，模块前缀 | `.parcel-form`、`.field-error` |
| 测试文件 | 同名加 `.test.ts(x)`；端到端 `.spec.ts` | `collision.test.ts`、`quotes.spec.ts` |

### 组件写法

- 用命名导出 `export function Component()`，不用默认导出。
- props 用 `type Props = {...}` 定义在组件上方，签名写 `({ onAdd }: Props)`。
- 子组件不接收整个状态对象。传它需要的字段和回调，避免一次改动引发全树重渲染。
- 组件超过 150 行，或出现第二段可命名的界面区块时，拆子组件或提取 hook。
- 不给组件加 `any`。第三方类型缺失时写最小本地类型，并在注释里说明来源。
- 条件渲染保持正向表达，避免多层嵌套三元；两个以上分支用提前 `return` 或拆子组件。

### 请求层

所有网络请求走 `src/api.ts`，组件里不直接 `fetch`。

```ts
export async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`/api${path}`, init);
  if (!response.ok) {
    const body: { code?: string } | null = await response.json().catch(() => null);
    throw new Error(body?.code || `HTTP ${response.status}`);
  }
  return response;
}
```

- 路径不带 `/api` 前缀，统一由 `request` 拼上。
- 业务错误抛 `Error(code)`，`code` 用契约里的错误码原值（`INVALID_INPUT`、`SERVICE_UNAVAILABLE`），不翻译成中文再判断。
- 每个资源一组函数，命名是动词加资源：`load`（读列表或详情）、`save`（新建）、`revise`（整体更新）、`delete`。
- 函数返回已解析的业务类型，不返回 `Response`。需要读响应头时再单独设计。
- 写操作先设 pending 状态，完成或失败后复位；`onPendingChange` 这类回调用于让提交按钮在提交期间不可重复点击。
- 处理过期数据：详情页用路由 id 比对返回结果（`detail?.id === parsedId`）；新页面可能并发多次读取时用请求序号或 `AbortController` 丢弃过期结果，不靠"最后写入覆盖"。
- 请求参数不做隐式转换。`weight_kg` 从输入框拿到的是字符串，转数字在提交前的解析函数里做，并返回 `FieldErrors`。

### 类型与状态

- 契约类型集中在 `types.ts`，命名与 `openapi.yaml` 的 schema 对应。
- 列表用摘要类型，详情用完整类型；不把完整对象塞进列表接口。
- 本地派生类型单独命名并注明用途：`FormValues`（表单中的字符串值）、`FieldErrors`（字段级错误）、`LocalDraft`（未保存草稿）。
- 用可辨识联合表达状态机，不用一堆布尔：

```ts
type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; quotes: QuoteSummary[] }
  | { status: 'failed'; code: string };
```

- 本地存储带 schema 版本号（`BoardState.schemaVersion`）。结构变化时升版本并写迁移，读到未知版本按空状态处理，不让页面白屏。

### 样式

- 全局样式放 `src/styles.css`，颜色、间距、字号用 `:root` 变量，组件里不写十六进制色值。
- 类名 kebab-case，带模块前缀；子元素用后代选择器表达从属（`.parcel-list li`）。
- 状态类统一 `is-` 前缀：`.is-loading`、`.is-error`、`.is-active`。
- 内联 `style` 只用于运行时计算值（进度条宽度、拖拽位移），静态样式一律进 CSS。
- 不引入 UI 组件库与 CSS 框架，除非当次提案写明理由并经组内确认。

### 可访问性

- 表单控件必须有可关联标签：`<label htmlFor>` 配 `id`，端到端测试能用 `getByLabel` 找到。
- 可点击的东西用 `<button>` 或 `<a>`，不给 `div` 绑 `onClick`。
- 图标按钮补 `aria-label`；纯装饰图标加 `aria-hidden`。
- 状态变化用文本表达（`1300 cents`、`Saved`），不只靠颜色。
- 新增交互检查键盘可达：Tab 能到，Enter 或 Space 能触发。

### 文案与国际化

- 界面文案集中在 `i18n/messages.ts`，组件里不写死句子。
- key 用小驼峰，按区块分组，占位符用 `{count}`、`{title}`。
- 不拼接句子片段，语言顺序不同时必然出错，改为整句模板。
- 页面标题、按钮、错误提示用词一致，不一处 `Order` 一处 `Quote`。

### 与 SDD 的接点

- 规格里的验收场景直接落成端到端用例名。
- `tasks.md` 中前端任务标注要改的页面或组件，以及验证方式（类型检查、哪条 e2e）。
- 界面变更在 PR 里附截图，路径写相对仓库根。
- 发现契约缺字段时先改 `openapi.yaml`，不在前端临时补字段。

## Rationale

前端的问题多来自"业务逻辑长在组件里"和"接口字段在边界被改名"。把纯逻辑下沉到 `<feature>/*.ts`、请求收敛到 `api.ts`、契约字段原样透传，能让组件保持薄、让测试能脱离渲染验证业务。

## Verification

| Check | Blocks |
|---|---|
| 组件文件名与组件同名、使用命名导出 | pr-merge |
| 业务逻辑不在组件内，纯函数有对应测试 | pr-merge |
| 接口字段保持 snake_case，未转驼峰 | pr-merge |
| 请求只走 `api.ts`，错误码用契约原值，过期响应有处理 | pr-merge |
| 表单控件有 label，可点击元素是 button 或 a | pr-merge |
| 文案在 `messages.ts`，无拼接句；样式用 `:root` 变量 | pr-merge |

## Examples

```tsx
// GOOD
export function ParcelForm({ onSubmit }: Props) { /* ... */ }

// BAD — 默认导出 + any
export default function Form(props: any) { /* ... */ }
```

```ts
// GOOD — 业务错误用契约错误码
throw new Error(body?.code || `HTTP ${response.status}`);

// BAD — 中文提示当判断依据
if (message.includes('不可用')) { /* ... */ }
```

## Exceptions

- 已有历史组件若使用默认导出，在下次因业务变更修改该文件时统一为命名导出，不单开重构提交。
- 仓库已有测试框架不一致时，按仓库现状执行，不引入第二套；新增仓库可任选其一并在 README 记录。
