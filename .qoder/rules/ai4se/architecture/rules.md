# 架构规则（architecture）

本目录只有这一个规则文件，它是该分类的权威正文。规则 ID 就是二级标题，`@rule:<id>` 与索引中的 `#<id>` 都指向本文件里的同名小节。

## 适用范围

所有仓库的模块划分、依赖方向、接口契约与持久化设计。与具体语言无关的约束写在本文件；`java-patterns` 一节只对 Java 项目生效。

## 规则总表

| ID | 规则 | 优先级 | 触发 | 适用栈 |
|---|---|---|---|---|
| api-contract | 接口契约先行 | Critical | always | — |
| layer-boundaries | 遵守声明的分层依赖方向 | Critical | auto | — |
| package-structure | 应用分层与包/目录分类（后端+前端+仓库级） | High | auto | java,react,typescript |
| no-circular-dependency | 禁止模块循环依赖 | Critical | auto | — |
| orchestration-execution-separation | 编排层不承载业务判断 | Critical | auto | — |
| java-patterns | Java 模式与项目持久化约定 | High | auto | java |

## api-contract

**接口契约先行。** 契约文件是仓库根目录的 `openapi.yaml`（OpenAPI 3.0.3），是前后端唯一的事实源：字段名、类型、必填、状态码、错误码一处定稿，两端照做。

### 改动顺序

固定四步，不能颠倒：

1. 改 `openapi.yaml`：路径、schema、状态码、示例。
2. 改后端：DTO 与 Controller 对齐新契约，补接口测试。
3. 改前端：`types.ts` 与 `api.ts` 对齐，补对应测试。
4. 跑两端验证，PR 里贴契约 diff。

先写后端再补契约、或先写前端类型再补契约，都会出现「代码比契约走得快」的时间，这段时间里任何联调结论都不可信。

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
- 字段可空时用 `nullable: true` 并在描述里说明「何时为空」，不靠前端猜。
- 不在响应里返回内部实现字段（数据库列名、JPA 实体字段、内部状态机值）。

### Schema

- 每个 schema 写 `required`；必填字段漏写 `required` 等于放任前端少传。
- 服务端生成的字段标 `readOnly: true`：`id`、`amount_cents`、`created_at`、`updated_at`。
- 请求与响应复用同一组 schema，用 `allOf` 组合输入与只读字段，避免两份字段列表各自演化。
- 每个有请求体的接口给至少两个 `examples`：一个成功、一个典型拒绝。
- 字段语义写进 `description`，例如 `updated_at` 说明「最后一次成功保存的时间，被拒绝的请求不改变它」。
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
- 本轮不引入代码生成。手写类型必须在 PR 里附「类型 ↔ schema」对照说明，新增或改名字段时尤其要写。
- 后端 `OpenApiTest` 至少验证：文件可解析、关键路径存在、必填字段在 `required` 里；它不能替代接口行为测试。
- 契约改动后前后端测试都要跑，只跑一端不算验证完成。

### 与 SDD 的接点

- 契约变更属于规格变更：新增字段写 ADDED，改语义写 MODIFIED，删字段写 REMOVED，并在验收场景里给出请求与响应样例。
- `tasks.md` 中契约任务单独成条并标注 `contract`，排在前后端任务之前。
- G2 验证检查三处一致：契约、后端响应、前端类型；任一不符即验证不通过。
- 归档时把当次契约版本号写进变更摘要，便于回溯 `info.version` 的推进历史。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 是否先改 `openapi.yaml` 再改两端 | pr-merge |
| 路径用复数资源，无动词资源名；版本不写进路径 | pr-merge |
| 字段 snake_case、金额 `_cents`、时间 `_at` + UTC | pr-merge |
| 必填字段在 `required`，服务端生成字段 `readOnly`，请求体有成功与拒绝两个 example | pr-merge |
| 400 与 422 边界未漂移；错误体只有 `code` | pr-merge |
| 新增错误码三处同步；前端类型与 schema 字段名一致 | pr-merge |
| 破坏性变更已升主版本或标 `deprecated`；两端测试均通过 | pr-merge |

### 示例

```yaml
# 推荐
Quote:
  allOf:
    - $ref: '#/components/schemas/ParcelInput'
    - type: object
      required: [id, amount_cents, created_at, updated_at]
      properties:
        id: {type: integer, format: int64, readOnly: true}
        amount_cents: {type: integer, readOnly: true}
        created_at: {type: string, format: date-time, readOnly: true, description: 创建时间，UTC}

# 不推荐 — 金额用浮点数、字段驼峰、无 required
Quote:
  properties:
    totalPrice: {type: number}
```

### 例外

- 纯内部接口（不经前端）可不写示例，但仍需 `required` 与错误体约定。
- 当次变更若只有只读接口、无请求体，可省略两个 example 的要求，并在 PR 中说明。

## layer-boundaries

**依赖必须遵守项目声明的分层方向。** 上层可以调用下层，反向调用禁止。

- 依赖方向以架构知识文档（`docs/knowledge/architecture/`）里声明的层为准，不以个人习惯为准。
- 跨层捷径必须有显式的 ADR 或例外记录，没有记录的跨层就是违规。
- 新模块在合并前先把自己的层写进架构知识文档，否则评审无法判断依赖是否合法。

| 检查 | 阻断点 |
|---|---|
| 导入 / 包依赖方向是否符合声明 | pre-commit / pr-merge |

```text
推荐：API 适配层依赖领域端口；领域层不导入适配层。
不推荐：领域包直接导入 HTTP 框架类型。
```

例外：无。

## package-structure

**触发分层时按标准分类组织包/目录，依赖只许自上而下。** 参照阿里巴巴 Java 开发手册的应用分层与分层领域模型规约，覆盖 Java 后端、React 前端与仓库级结构。本规则规定层语义、分类与依赖方向；分层时机与根包沿用 `java-coding-style` 的「包与目录」，前端目录细节以 `web-coding-style` 为准。

### 分层模型

手册推荐分层与本仓库两栈的对应如下（概念映射，不要求包名逐字相同）：

| 手册层 | Java 包 | 前端对应 | 职责 |
|---|---|---|---|
| 开放接口层 / Web 层 | controller | `api.ts` 请求出口 | 路由、参数校验、转换、错误码映射；无业务判断 |
| 终端显示层 | ui（可选） | `components/` + `XxxPage` | 渲染与交互，无业务逻辑 |
| Service 层 | service | `<feature>/*.ts` 纯逻辑 | 具体业务规则与编排 |
| Manager 层 | manager（可选） | `<feature>` 内通用逻辑 / hooks | 第三方封装、通用能力下沉、DAO 组合复用 |
| DAO 层 | dao / mapper | —（本地存储放 `<feature>`） | 数据访问、行对象 |
| 外部接口或第三方平台 | manager 封装 | `api.ts` 统一出口 | 外部 RPC/HTTP，返回值预处理与异常转化 |

### 分层时机

- 满足任一条件即须分层：单个包超过 15 个类；出现两个以上业务域；新建 Web 型项目（Spring Boot）。其余保持按特性平铺。
- 根包固定 `training`，第二段是业务域，分层后第三段是标准层包：`training/<domain>/<layer>/`。
- 拆层在单个 PR 里整体搬移并在 PR 说明；同一业务域不得一半平铺一半分层。

### 标准包分类（Java）

```text
src/main/java/training/<domain>/
├── controller/   Web 层：路由、绑定、转换、状态码入口
├── service/      Service 层：领域规则、编排、事务边界
├── manager/      Manager 层（可选）：第三方封装、通用下沉、DAO 组合
├── dao/          DAO 层：仓储接口与实现、行对象（JPA/JDBC）
├── mapper/       MyBatis SQL 映射：接口与 XML，与 dao 二选一
├── model/        领域对象（BO）：业务语义，无持久化注解
├── dto/          边界传输对象（DTO/Query）：请求/响应/查询，与契约对齐
├── exception/    领域异常与统一错误处理器
├── utils/        无状态通用工具，叶子包
└── ui/           终端显示层：桌面或服务端模板，Web 项目不建
```

| 包 | 放什么 | 不放什么 | 命名 |
|---|---|---|---|
| controller | 路由、参数绑定与校验、DTO↔领域转换、状态码映射入口 | 业务判断、直调 dao/mapper、SQL | `XxxController` |
| service | 业务规则与编排、事务边界、领域对象组装 | HTTP 框架类型、SQL、行对象 | `XxxService` |
| manager | 第三方平台封装（返回值预处理、异常转化）、缓存/中间件等通用能力、多 DAO 组合复用 | 具体业务规则（留在 service）、对 controller 直接暴露 | `XxxManager` |
| dao | 仓储接口与实现（JPA/JDBC/内存）、行对象 | 业务规则、行对象向上泄漏 | `XxxRepository`、`DatabaseXxxRepository` / `MemoryXxxRepository`、`XxxRow` |
| mapper | MyBatis 映射接口；XML 固定 `src/main/resources/mapper/` | 与 dao 并存、业务规则 | `XxxMapper` |
| model | 业务语义的领域对象（record） | JPA/JSON 注解、传输对象、框架类型 | 领域名词（`Quote`） |
| dto | 请求/响应/查询传输 record，与契约 schema 语义一一对应 | 业务方法、持久化注解、超过 2 个参数的查询用 Map | `XxxRequest` / `XxxResponse` / `XxxSummary` / `XxxQuery` |
| exception | 领域异常、统一错误处理器（按契约映射状态码） | 用异常做正常分支控制 | `XxxRejected`、`XxxNotFound`、`XxxErrorHandler` |
| utils | 无状态通用工具（如 `Money`） | 业务状态、对 service/dao/controller 等业务包的依赖 | `XxxUtils` 或通用名词（`Money`） |
| ui | 桌面（Swing/JavaFX）视图、服务端模板渲染与模板模型 | 业务规则、直调 dao | `XxxView` / `XxxFrame` / `XxxPanel` |

- manager 是可选层：有第三方平台调用、通用能力下沉或多 DAO 组合复用之一才建；否则不建，service 直连 dao，不为「齐全」建空包。
- mapper 与 dao 是同一持久化层的两种实现形态，一个项目二选一：JPA/JDBC 用 dao，MyBatis 用 mapper；不得两包并存。
- React 前端按 `web-coding-style` 放 `frontend/`，不进 Java 包；Web 项目不建 ui 包。
- 行对象只留在 dao/mapper 内，向上跨边界必须转成 model；dto 只出现在 controller 与 service 的边界签名，不进 dao/model。
- dto 类名与契约 schema 的对照在 PR 里说明（与前端「类型 ↔ schema」对照同口径）。

### 分层领域模型规约

手册的 DO/DTO/BO/Query/VO 是概念分类，本仓库映射到既有命名，**不整体改名为 XxxDO/XxxDTO**：

| 手册概念 | 含义 | 本仓库对象 | 所在 |
|---|---|---|---|
| DO | 与表结构一一对应，通过 DAO 向上传输 | 行对象 `XxxRow` | dao/mapper |
| DTO | Service/Manager 向外传输的对象 | `XxxRequest` / `XxxResponse` / `XxxSummary` | dto |
| BO | 封装业务逻辑的对象 | 领域对象（`Quote`） | model |
| Query | 查询请求对象，超过 2 个参数禁止 Map | `XxxQuery` | dto |
| VO | 显示层对象 | 前端 `types.ts` 视图类型 / ui 模板模型 | frontend / ui |

### 依赖方向

```text
ui / controller → service → manager（可选） → dao / mapper
controller / service → dto / model
dao / mapper → model
各层 → exception / utils；utils 不反向依赖任何业务包
```

- controller 不得绕过 service 直调 dao/mapper；service 不得反向依赖 controller/ui；model 不导入框架类型。
- 有 manager 层时第三方调用只走 manager；无 manager 时 service 直连 dao。
- 分层布局下仓储接口放 dao 包，service/manager 只依赖接口不依赖实现类（依赖倒置不变，见 `java-patterns`）。
- 跨层捷径按 `layer-boundaries` 必须有 ADR 或例外记录。

### 分层异常职责

参照手册分层异常处理规约，与本仓库 `api-contract` 对齐：

| 层 | 异常职责 |
|---|---|
| dao/mapper | 包装存储异常向上抛，不自行吞掉或打日志（日志由上层保证） |
| service/manager | 向上抛时必须带参数上下文记录日志；业务拒绝用专门异常（`XxxRejected`） |
| controller | 统一处理器按契约映射状态码与错误码，不返回堆栈、不继续上抛 |
| 前端 `api.ts` | 抛 `Error(code)` 用契约错误码原值，组件展示可读提示 |

### 前端目录映射

前端不引入第二套布局，层语义对应 `web-coding-style` 既有目录：

```text
frontend/src/
├── api.ts          请求出口：第三方接口封装、错误码转换
├── types.ts        DTO/VO 类型，与契约一一对应
├── components/     终端显示层：可复用组件
├── <feature>/      Service/Manager 层：纯逻辑、状态迁移、hooks
├── i18n/           显示层文案
└── utils/          可选叶子：跨特性通用工具，无业务逻辑
```

- 业务逻辑不进组件（见 `web-coding-style`）；本地存储等「前端持久化」放 `<feature>`，不建 dao 包。
- `utils/` 仅在确有跨特性通用工具时建，不预防性创建。

### 仓库级结构

```text
<repo>/
├── openapi.yaml                          契约 SoT（见 api-contract）
├── src/main/java/training/<domain>/…     Java 后端（或 backend/ 子模块）
├── src/main/resources/db/migration/      迁移只增不改
├── src/test/java/training/<domain>/…     测试与被测类同包
├── frontend/                             React 前端（见 web-coding-style）
├── e2e/                                  端到端测试
├── docs/                                 知识库与规则权威区
├── openspec/                             规格工件
└── scripts/                              验证与治理脚本
```

### 与按特性平铺的衔接

- 平铺布局：仓储接口、行对象、领域对象都放业务包（见 `java-patterns`）；类职责后缀仍以本规则分类为准。
- 触发分层后：仓储接口与行对象搬入 dao，领域对象搬入 model，边界传输对象搬入 dto，错误处理器搬入 exception，第三方封装搬入 manager。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 布局（平铺/分层）是否符合触发条件，同一域是否混用布局 | pr-merge |
| controller 是否含业务判断或直调 dao/mapper | pr-merge |
| 依赖方向是否自上而下，utils 是否反向依赖业务包 | pre-commit / pr-merge |
| 行对象是否泄漏出 dao/mapper，dto 是否进入 dao/model | pr-merge |
| mapper 与 dao 是否并存，Web 项目是否建 ui，是否建空 manager | pr-merge |
| 类名后缀是否符合包分类，领域模型是否按映射表落位 | pr-merge |
| 超过 2 个参数的查询是否用 Map，异常是否按分层职责处理 | pr-merge |
| 前端目录是否符合层映射，业务逻辑是否进组件 | pr-merge |

### 示例

```text
推荐：training.quote.controller.QuoteController → training.quote.service.QuoteService → training.quote.dao.QuoteRepository
推荐：QuoteService → PaymentGatewayManager（第三方封装） → 外部支付接口
不推荐：QuoteController 直接 new DatabaseQuoteRepository()（跨层捷径）
不推荐：QuoteUtils 里写会员折扣等业务判断（utils 承载业务）
不推荐：整体改名 QuoteDO/QuoteDTO（概念映射不改团队命名）
```

### 例外

- 纯计算型项目（无数据库、无 Web）不建 controller/dao/mapper/ui；桌面项目不建 controller。
- 现有平铺代码不强制搬迁；达到分层触发条件或下次因业务变更修改该文件时收口。

## no-circular-dependency

**模块依赖图必须无环。**

- 破除循环的方式是端口/接口，或抽出共享内核模块。
- 不允许用动态导入、运行时反射把循环藏起来并长期保留。
- 依赖图以包或模块为粒度，而不是文件粒度。

| 检查 | 阻断点 |
|---|---|
| 包依赖图中的环检测 | pre-commit / pr-merge |

```text
推荐：共享类型放在叶子模块，由两侧共同导入。
不推荐：A → B → A 的包导入。
```

例外：无。

## orchestration-execution-separation

**编排层不承载业务判断。**

- 编排/工作流层只负责路由与排序，不写领域策略判断。
- 业务判断留在有测试的领域或能力模块里。
- 提示词与工具可以辅助执行模块，但编排层依然不能拥有策略。

| 检查 | 阻断点 |
|---|---|
| 架构评审：编排器里是否出现业务策略 | pr-merge |

```text
推荐：编排器调用领域服务里的 decideRefund()。
不推荐：编排器内嵌退款资格判断的 if/else 树。
```

例外：无。

## java-patterns

**Java 模式与项目持久化约定。** 适用于 Java 项目；Web 型项目（Spring Boot + JPA + Flyway）以持久化小节为准。

### 通用模式

- 仓储模式：数据访问封装在接口后，实现处理存储细节（JPA、JDBC、测试用内存实现）。
- 服务层承载业务逻辑，Controller 与 Repository 保持薄。
- 构造注入优先，禁止字段注入（`@Inject` / `@Autowired` 直接标字段）。
- DTO 用 `record`，映射发生在服务或 Controller 边界。
- 参数较多的对象用 Builder；领域结果有互斥分支时用 sealed 接口 + switch 穷举。

### 迁移脚本只增不改

- 已经提交过的迁移（如 `V1__create_quotes.sql`）不再编辑；新增变更写 `V2__...`、`V3__...`。
- 命名 `V<序号>__<动词_名词>.sql`，固定放在 `src/main/resources/db/migration`。
- 修改已上线结构时，先加新列或新表，再在后续迁移里清理旧结构，不做原地改定义。

### 时间统一 UTC

- 时间列 `created_at`、`updated_at` 存 UTC，接口输出 RFC3339。
- 取时间走 `QuoteClock` 这类可注入的时钟，不在业务代码里直接 `Instant.now()`，否则测试无法固定时间。

### 行对象与领域对象分离

- 持久化行对象（如 `QuoteRow`）负责映射表结构，领域对象（如 `Quote`）负责业务语义。
- 不给领域 record 标注 JPA 注解；领域对象不知道数据库的存在。

### 仓储接口位置随布局

- 按特性平铺布局：仓储接口（`QuoteRepository`）定义在业务包内；标准分层布局：接口与行对象放 dao 包（见 `package-structure`）。
- 两种布局下 service 都只依赖接口，实现（`DatabaseQuoteRepository`、`MemoryQuoteRepository`）可替换。
- 测试优先使用内存实现；确实需要验证 SQL 语义时，单独标注为集成测试。

### 对象与不可变

- 值对象优先 `record`，字段默认 `final`；集合对外返回时做防御性拷贝。
- 不给 record 加 setter 式方法，需要变化时返回新实例。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 依赖是否通过接口注入，未使用字段注入 | pr-merge |
| 迁移脚本是否只增不改，命名是否为 `V<序号>__<动词_名词>.sql` | pr-merge |
| 时间是否存 UTC，取时间是否走可注入时钟而非 `Instant.now()` | pr-merge |
| 领域对象是否未被标注 JPA 注解，行对象与领域对象是否分离 | pr-merge |
| 仓储接口位置是否符合布局（平铺：业务包 / 分层：dao），实现是否可替换 | pr-merge |

### 示例

```java
// 推荐 — 构造注入，字段不可变
public class NotificationService {
    private final EmailSender emailSender;

    public NotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }
}

// 不推荐 — 字段注入，无法直接构造测试
public class NotificationService {
    @Inject
    private EmailSender emailSender;
}
```

### 例外

- 现有代码里与本文件不一致的写法，在下次因业务变更修改该文件时收口，不单开重构提交。
- 纯计算型项目（无数据库）不适用持久化小节。

## 为什么这样定

契约是两端并行的唯一交汇点：不先定稿，就会出现「谁先改」的争论与联调期间的双向猜测，金额用整数分、时间用 UTC 则消除了跨语言序列化与本地时区的歧义。分层与无环约束保证变更可以增量交付；编排与策略分离让业务规则始终有测试可依。持久化只增不改是因为已执行的迁移无法回滚，行对象与领域对象分离则是为了让业务语义不被表结构绑住。包分类把「代码放哪」从个人习惯变成查表：评审按包名就能判定职责与依赖方向，新成员与 agent 放代码不用四处问；平铺阈值则让小项目不必过早支付分层的跳转成本，两者互为补充。

## 全分类检查清单

| 检查 | 阻断点 |
|---|---|
| 契约是否先于两端改动，三处（契约/后端/前端）是否一致 | pr-merge |
| 依赖方向是否遵守声明，是否存在跨层捷径或循环 | pre-commit / pr-merge |
| 包布局是否符合触发条件，层包职责与依赖方向是否符合分类 | pre-commit / pr-merge |
| 编排层是否混入业务策略判断 | pr-merge |
| Java 项目是否遵守持久化与不可变约定 | pr-merge |
