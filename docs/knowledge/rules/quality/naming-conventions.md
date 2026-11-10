# naming-conventions — 跨端命名速查与术语唯一性（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | naming-conventions |
| **Category** | quality |
| **Priority** | High |
| **Activation** | always |
| **Applies To** | all |
| **Stack** | — |

## Rule

只覆盖"所有层都成立"的命名。Java 标识见 [java-coding-style](java-coding-style.md)，前端标识见 [web-coding-style](web-coding-style.md)。

### 跨端命名速查

| 对象 | 规则 | 例子 |
|---|---|---|
| 仓库目录 | 全小写，单词间连字符 | `parcel-quote`、`openspec-practice` |
| 分支 | `feature/` `fix/` `checkpoint/` + change-id | `feature/add-voucher-deduction` |
| change-id（规格与分支共用） | kebab-case，动词开头 | `add-voucher-deduction`、`fix-shipping-threshold` |
| 规格目录 | capability 用名词短语，kebab-case | `openspec/specs/quote-pricing/` |
| 文档文件 | `<class>-<group>-<topic>-<yyyymmdd>-v<n>.md` | `class3-group2-backend-java-20261110-v2.md` |
| 测试命令 | 沿用仓库已有脚本，不新造同义脚本 | `mvnw test`、`npm test`、`npm run typecheck` |
| 接口字段 | snake_case，前后端都不得转写 | `weight_kg`、`amount_cents`、`created_at` |
| Java 标识 | 类 UpperCamel / 方法变量 lowerCamel / 常量 UPPER_SNAKE | `QuoteCalculator`、`memberPrice`、`SHIPPING_FEE` |
| TS 标识 | 组件与类型 UpperCamel / 函数变量 lowerCamel | `QuoteDetailPage`、`loadQuotes` |
| 数据库对象 | 表与列 snake_case，迁移版本号递增 | `quotes`、`created_at`、`V1__create_quotes.sql` |
| CSS 类 | kebab-case，模块前缀 | `.parcel-form`、`.parcel-list` |
| 环境与配置键 | 小写点分 | `spring.datasource.url` |

### 两条必须守住的边界

1. **接口字段的 snake_case 是契约的一部分，前端不做驼峰转换。** `ParcelInput.weight_kg` 在 TS 里仍叫 `weight_kg`；表单状态 `FormValues` 也保持同名，只在值类型上从 `number` 变 `string`。转换只发生在提交前的解析函数里。只有纯界面状态（`isLoading`、`selectedId`）才用驼峰。
2. **同一个概念只有一个词。** 金额字段固定为 `originalPrice`、`memberPrice`、`promotion`、`voucher`、`goods`、`shipping`、`total`，不得出现 `price`、`amount`、`finalPrice`、`netPrice` 等近义词混用。

### 金额字段语义

| 字段 | 含义 |
|---|---|
| `originalPrice` | 商品原价，`calculate` 的输入金额 |
| `memberPrice` | 会员折扣后的金额 |
| `promotion` | 满减促销金额 |
| `goods` | 会员折扣、促销、代金券依次扣减后的商品金额 |
| `voucher` | 代金券抵扣金额 |
| `shipping` | 运费 |
| `total` | 最终支付金额 |

术语对照：`quote`（一次报价的计算结果，不用 quotation / order）、`voucher`（代金券抵扣，不用 coupon / discount）、`promotion`（满减，不用 discount）、`change`（一次规格驱动的变更单元，不用 task / ticket）。

## Rationale

跨端边界的命名一旦各写一套，字段在 Java、TypeScript、OpenAPI、数据库之间就会漂移，联调时只能靠人工对照。把速查表与术语表集中在一处，让"同一个概念只有一个词"成为可判定条件。

## Verification

| Check | Blocks |
|---|---|
| 接口字段是否保持 snake_case，未被前端转驼峰 | pr-merge |
| 金额字段是否使用固定集合，无 `price` / `amount` / `finalPrice` 等近义词 | pr-merge |
| 分支名、change-id、规格目录命名是否符合速查表 | pr-merge |

## Examples

```text
GOOD  weight_kg / amount_cents / created_at / originalPrice / goods
BAD   weightKg / amountCents / createdAt（接口层转驼峰）
BAD   price / amount / finalPrice / netPrice（金额同义词轮换）
```

## Exceptions

- 第三方 SDK 强制要求的命名（如某些 JSON 库的默认映射）需在 PR 中说明；映射只在边界处做一次，不扩散到业务代码。
- 纯界面状态可以有前端本地命名习惯，只要不与接口字段同名混淆。
