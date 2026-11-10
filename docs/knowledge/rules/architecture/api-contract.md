# api-contract — 接口契约规则（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | api-contract |
| **Category** | architecture |
| **Priority** | Critical |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | — |

## Rule

### 契约先行

契约文件是仓库根目录的 `openapi.yaml`（OpenAPI 3.0.3），是前后端唯一的事实源：字段名、类型、必填、状态码、错误码一处定稿，两端照做。

改动顺序固定四步，不能颠倒：

1. 改 `openapi.yaml`：路径、schema、状态码、示例。
2. 改后端：DTO 与 Controller 对齐新契约，补接口测试。
3. 改前端：`types.ts` 与 `api.ts` 对齐，补对应测试。
4. 跑两端验证，PR 里贴契约 diff。

先写后端再补契约、或先写前端类型再补契约，都会出现"代码比契约走得快"的时间，这段时间里任何联调结论都不可信。

### 路径命名

| 规则 | 例子 |
|---|---|
| 资源用复数名词 | `/quotes` |
| 层级用斜杠，不用下划线或驼峰 | `/quotes/{id}/items` |
| 路径参数用单数名词，花括号包裹 | `/quotes/{id}` |
| 仅当 CRUD 无法表达动作时才用动词子路径 | `/quotes/{id}/submit` |
| 不把动作写进资源名 | 禁止 `/getQuote`、`/createQuote` |
| 版本放 `info.version`，不写进路径 | 不用 `/v1/quotes` |

### 字段命名与格式

| 类别 | 规则 | 例子 |
|---|---|---|
| 一般字段 | snake_case | `weight_kg`、`updated_at` |
| 金额 | 整数分，字段名以 `_cents` 结尾 | `amount_cents: 1300` |
| 时间 | RFC3339 UTC，字段名以 `_at` 结尾 | `created_at`、`updated_at` |
| 标识 | `id`，`integer` + `format: int64` | `id: 1` |
| 枚举 | 小写字符串 | `zone: local \| remote` |
| 布尔 | `is_` / `has_` 前缀 | `is_express` |
| 数量与重量 | 带单位后缀 | `weight_kg`，不用 `weight` |

- 金额一律整数分，不用浮点数、不用字符串。`13.00` 写成 `1300`；后端 `BigDecimal` 元只在 Controller 边界转换一次。
- 时间只输出 UTC，不带时区偏移视为错误；前端展示时再按本地时区格式化。
- 字段可空时用 `nullable: true` 并在描述里说明"何时为空"，不靠前端猜。
- 不在响应里返回内部实现字段（数据库列名、JPA 实体字段、内部状态机值）。

### Schema

- 每个 schema 写 `required`；必填字段漏写 `required` 等于放任前端少传。
- 服务端生成的字段标 `readOnly: true`：`id`、`amount_cents`、`created_at`、`updated_at`。
- 请求与响应复用同一组 schema，用 `allOf` 组合输入与只读字段，避免两份字段列表各自演化。
- 每个有请求体的接口给至少两个 `examples`：一个成功、一个典型拒绝。
- 字段语义写进 `description`，例如 `updated_at` 说明"最后一次成功保存的时间，被拒绝的请求不改变它"。
- 数值范围写进 schema（`minimum` / `maximum`）；只写在注释里等于没有约束。

### 状态码与错误

| 场景 | 状态码 | 响应体 |
|---|---|---|
| 新建成功 | 201 | 完整资源 |
| 读取成功 | 200 | 资源或资源数组 |
| 删除成功 | 204 | 无响应体 |
| 字段缺失或类型错误 | 400 | `Error` |
| 资源不存在 | 404 | 空响应体或 `Error`，同一资源保持一致 |
| 业务规则拒绝 | 422 | `Error`，且不改变已存数据 |
| 未预期异常 | 500 | `Error`，不返回堆栈 |

- `code` 用大写下划线常量，前端按原值判断，不做字符串包含匹配。
- 400 与 422 的边界：格式不对是 400，格式对但业务不接受是 422；同一输入不允许有时 400 有时 422。
- 新增错误码要同时改三处：契约枚举、后端映射、前端提示文案。
- 错误响应不携带内部异常消息，对外只有 `code`，排查信息进日志。

### 版本与兼容

- `info.version` 用语义化版本：新增向后兼容的接口或可选字段升次版本；删除字段、改类型、改语义升主版本。
- 新增字段一律可选并给默认值说明，老前端不传也能工作。
- 删除或重命名字段：先标 `deprecated: true` 并写替代字段，两端改完后下一个主版本再删。
- 不改变既有字段的单位：`amount_cents` 一旦是分，永远不能改成元。
- 列表接口加分页属于破坏性变更，按主版本处理，不偷偷把数组换成对象。

### 前后端同步

- `frontend/src/types.ts` 的类型与 schema 一一对应、命名完全相同；不一致时以 `openapi.yaml` 为准。
- 本轮不引入代码生成。手写类型必须在 PR 里附"类型 ↔ schema"对照说明，新增或改名字段时尤其要写。
- 后端 `OpenApiTest` 至少验证：文件可解析、关键路径存在、必填字段在 `required` 里；它不能替代接口行为测试。
- 契约改动后前后端测试都要跑，只跑一端不算验证完成。

### 与 SDD 的接点

- 契约变更属于规格变更：新增字段写 ADDED，改语义写 MODIFIED，删字段写 REMOVED，并在验收场景里给出请求与响应样例。
- `tasks.md` 中契约任务单独成条并标注 `contract`，排在前后端任务之前。
- G2 验证检查三处一致：契约、后端响应、前端类型；任一不符即验证不通过。
- 归档时把当次契约版本号写进变更摘要，便于回溯 `info.version` 的推进历史。

## Rationale

前后端并行最容易坏在"谁先改"。把契约定为唯一事实源并固定改动顺序，让不一致在联调前就暴露；金额用整数分、时间用 UTC，则消除了跨语言序列化的精度与时区歧义。

## Verification

| Check | Blocks |
|---|---|
| 是否先改 `openapi.yaml` 再改两端 | pr-merge |
| 路径用复数资源，无动词资源名；版本不写进路径 | pr-merge |
| 字段 snake_case、金额 `_cents`、时间 `_at` + UTC | pr-merge |
| 必填字段在 `required`，服务端生成字段 `readOnly`，请求体有成功与拒绝两个 example | pr-merge |
| 400 与 422 边界未漂移；错误体只有 `code` | pr-merge |
| 新增错误码三处同步；前端类型与 schema 字段名一致 | pr-merge |
| 破坏性变更已升主版本或标 `deprecated`；两端测试均通过 | pr-merge |

## Examples

```yaml
# GOOD
Quote:
  allOf:
    - $ref: '#/components/schemas/ParcelInput'
    - type: object
      required: [id, amount_cents, created_at, updated_at]
      properties:
        id: {type: integer, format: int64, readOnly: true}
        amount_cents: {type: integer, readOnly: true}
        created_at: {type: string, format: date-time, readOnly: true, description: 创建时间，UTC}

# BAD — 金额用浮点数、字段驼峰、无 required
Quote:
  properties:
    totalPrice: {type: number}
```

## Exceptions

- 纯内部接口（不经前端）可不写示例，但仍需 `required` 与错误体约定。
- 当次变更若只读接口无请求体，可省略两个 example 的要求，并在 PR 中说明。
