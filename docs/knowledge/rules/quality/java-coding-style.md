# java-coding-style — Java 编码风格（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | java-coding-style |
| **Category** | quality |
| **Priority** | High |
| **Activation** | auto |
| **Applies To** | all |
| **Stack** | java |

## Rule

### 包与目录

包名全部使用小写字母，根包固定 `training`，第二段是业务域。

```java
package training.quote;
```

```text
src/main/java/training/<domain>/
src/main/resources/db/migration/
src/test/java/training/<domain>/
```

- **按特性平铺，不默认分层。** 类少的时候，`QuoteController`、`QuoteService`、`QuoteRepository` 放在同一个包里；分层目录只增加跳转成本。
- 单个包超过 15 个类，或出现两个以上业务域时，再按 `<domain>/<layer>` 拆，拆之前先在 PR 里说明。
- 测试与被测类同包同名路径；迁移脚本固定在 `db/migration`。

### 命名

| 对象 | 命名方式 | 示例 |
|---|---|---|
| 类、接口、Record | `UpperCamelCase` | `QuoteCalculator`、`QuotePrinter` |
| 类名后缀 | 表达职责，不堆叠技术名词 | `QuoteController`、`QuoteService`、`QuoteRepository`、`QuoteRow`、`QuoteSummary`、`QuoteRejected`、`QuoteErrorHandler` |
| 方法、变量 | `lowerCamelCase` | `calculate`、`memberPrice` |
| 布尔变量 | 表达明确状态 | `member`、`isMember`、`eligibleForFreeShipping` |
| 常量 | 全大写，下划线分隔 | `MEMBER_SHIPPING_THRESHOLD`、`SHIPPING_FEE` |
| 金额常量后缀 | 阈值 `_THRESHOLD`、固定收费 `_FEE`、减免额 `_OFF`、券面额 `_FACE` | `PROMOTION_OFF`、`VOUCHER_FACE` |
| 包名 | 全小写 | `training.quote` |
| 数据库表与列 | snake_case，表名用复数 | `quotes`、`amount_cents`、`created_at` |
| 迁移脚本 | `V<序号>__<动词_名词>.sql` | `V1__create_quotes.sql` |
| 配置键 | 小写点分 | `spring.datasource.url` |

名称必须表达业务含义，禁止含义模糊的命名：

```java
// 不推荐
BigDecimal value;
BigDecimal result;
boolean flag;

// 推荐
BigDecimal originalPrice;
BigDecimal promotion;
BigDecimal shipping;
boolean member;
```

### 金额处理（CRITICAL）

- 金额统一使用 `BigDecimal`，禁止使用 `double` 或 `float` 处理货币，禁止用 `int` 表示分以外的金额。
- 金额常量统一通过项目提供的 `Money.amount` 创建，不用 `new BigDecimal(100)`、`BigDecimal.valueOf(100)` 这类写法，避免 scale 不一致。
- 金额比较统一使用 `compareTo`，禁止使用 `equals` 判断数值是否相等（`BigDecimal.equals` 同时比较数值和 scale，`80.0` 与 `80.00` 不相等）。
- 除法与按比例计算必须显式指定 `RoundingMode`，并说明在哪一步舍入。`Money.memberPrice` 用 `HALF_UP` 保留两位，测试需覆盖「只舍入一次」。
- `Money.amount` 使用 `RoundingMode.UNNECESSARY`：传入超过两位小数的字符串直接抛异常。这是有意的——字面量写错精度应当在测试里立刻暴露，而不是被静默四舍五入。
- 接口层与内部单位不同：契约里 `amount_cents` 是整数分，Java 内部是 `BigDecimal` 元。转换只发生在 Controller 或 DTO 边界，不在计算逻辑里做。

```java
private static final BigDecimal SHIPPING_AMOUNT = Money.amount("10.00");
private static final BigDecimal ZERO_AMOUNT = Money.amount("0.00");

if (goods.compareTo(MEMBER_SHIPPING_THRESHOLD) >= 0) {
    // 达到会员免运费门槛
}
```

### 常量

- 仅供当前类内部使用的常量使用 `private static final`。
- 只有属于明确的对外契约、且确实需要被其他类引用时才使用 `public static final`。
- 阈值必须能在规格里找到出处，常量名与规格术语一致，不另起译名。
- 同一个阈值只定义一次。测试需要时引用常量，不抄数字，避免改了实现忘了改测试。
- 阈值基于哪个金额判断（原价、会员价、券后金额）必须在方法名或 JavaDoc 里写清；`calculateShipping(goods)` 与 `calculateShipping(originalPrice)` 是两种不同的业务。

```java
private static final BigDecimal MEMBER_SHIPPING_THRESHOLD = Money.amount("80.00");
private static final BigDecimal NON_MEMBER_SHIPPING_THRESHOLD = Money.amount("100.00");
```

### 空行和代码布局

- 字段、构造方法、公共方法、私有方法之间保留一个空行。
- 同一逻辑步骤内部不要加入过多空行。
- 不为了视觉对齐添加不稳定的额外空格。
- 一个方法保持单一职责；当方法包含多个可独立命名的业务步骤时，提取私有方法。

### 业务表达：计算顺序必须清晰

`QuoteCalculator` 的计算流程应能从代码中直接识别：

1. 参数校验（负数直接拒绝），零金额等特殊输入早返回。
2. 计算会员价。
3. 根据会员价计算促销减免。
4. 计算促销后的商品金额（`afterPromotion`）。
5. 计算代金券抵扣，得到券后商品金额 `goods`。
6. 根据 `goods` 和会员身份计算运费。
7. 计算最终总价。

```java
public Quote calculate(BigDecimal original, boolean member) {
    if (original.signum() < 0) {
        throw new IllegalArgumentException("price must not be negative");
    }
    if (original.signum() == 0) {
        BigDecimal zero = Money.amount("0.00");
        return new Quote(original, zero, zero, zero, zero, zero, zero);
    }

    BigDecimal memberPrice = Money.memberPrice(original, member);
    BigDecimal promotion = calculatePromotion(memberPrice);
    BigDecimal afterPromotion = memberPrice.subtract(promotion);
    BigDecimal voucher = calculateVoucher(afterPromotion);
    BigDecimal goods = afterPromotion.subtract(voucher);
    BigDecimal shipping = calculateShipping(goods, member);
    BigDecimal total = goods.add(shipping);

    return new Quote(original, memberPrice, promotion, voucher, goods, shipping, total);
}
```

- 中间变量必须命名，不把整条表达式塞进构造参数；`afterPromotion` 这类过渡值也要命名，否则读的人不知道减到哪一步。
- 不在计算过程中打印日志或 `System.out`，结果通过返回值暴露。

### 方法命名

计算型方法优先使用 `calculate`，避免使用容易被理解为普通属性访问的 `get`。若团队已统一使用 `getPromotion`、`getShipping`，可以保留，但同一项目内不得混用两种风格。

```java
calculatePromotion(memberPrice)
calculateShipping(goods, member)
```

### 三元表达式

简单的二选一可以使用三元表达式：

```java
return goods.compareTo(threshold) >= 0
        ? ZERO_AMOUNT
        : SHIPPING_AMOUNT;
```

涉及多个业务等级时，禁止多层嵌套三元表达式，改为从最高阈值到最低阈值的提前返回：

```java
// 不推荐
return memberPrice.compareTo(PROMOTION_LEVEL_3) >= 0 ? PROMOTION_LEVEL_3_AMOUNT :
        memberPrice.compareTo(PROMOTION_LEVEL_2) >= 0 ? PROMOTION_LEVEL_2_AMOUNT :
        memberPrice.compareTo(PROMOTION_LEVEL_1) >= 0 ? PROMOTION_LEVEL_1_AMOUNT : ZERO_AMOUNT;

// 推荐
private static BigDecimal calculatePromotion(BigDecimal memberPrice) {
    if (memberPrice.compareTo(PROMOTION_LEVEL_3) >= 0) {
        return PROMOTION_LEVEL_3_AMOUNT;
    }
    if (memberPrice.compareTo(PROMOTION_LEVEL_2) >= 0) {
        return PROMOTION_LEVEL_2_AMOUNT;
    }
    if (memberPrice.compareTo(PROMOTION_LEVEL_1) >= 0) {
        return PROMOTION_LEVEL_1_AMOUNT;
    }
    return ZERO_AMOUNT;
}
```

理由：阅读方向清楚、便于增删促销等级、便于断点和调试、突出业务规则而非表达式技巧。

### 运费逻辑与金额字段含义

运费门槛必须明确基于哪个金额判断。本项目运费基于会员折扣和促销减免后的 `goods` 判断。

```java
private static BigDecimal calculateShipping(BigDecimal goods, boolean member) {
    BigDecimal threshold = member
            ? MEMBER_SHIPPING_THRESHOLD
            : NON_MEMBER_SHIPPING_THRESHOLD;

    return goods.compareTo(threshold) >= 0
            ? ZERO_AMOUNT
            : SHIPPING_AMOUNT;
}
```

参数名必须体现语义，禁止 `calculateShipping(BigDecimal price, boolean member)`。

| 字段 | 含义 |
|---|---|
| `originalPrice` | 商品原价，即 `calculate` 的输入金额 |
| `memberPrice` | 会员折扣后的金额 |
| `promotion` | 满减促销减免金额 |
| `voucher` | 代金券抵扣金额 |
| `goods` | 会员折扣、促销、代金券依次扣减后的商品金额 |
| `shipping` | 运费 |
| `total` | 最终支付金额 |

促销门槛基于 `memberPrice`，运费门槛基于券后的 `goods`；`originalPrice` 是外部输入，不一定是最终用于门槛判断的金额。`Quote` 是 record，字段顺序即业务计算顺序，不要随意调换。

### 对象与不可变

- 值对象优先使用 `record`；字段默认 `final`，只有确实需要变化的状态才可变。
- 集合字段对外返回时做防御性拷贝（`List.copyOf`、`Map.copyOf`）。
- 不给 record 加 setter 式方法；需要变化时返回新实例。

### 异常与错误表达

- 输入非法抛 `IllegalArgumentException`，消息写英文小写短语且不带句号：`"price must not be negative"`。
- 业务拒绝用专门的异常类型（如 `QuoteRejected`），不用 `RuntimeException` 加字符串判断。
- 不用异常做正常分支控制：零金额、无促销这类可预期情况用返回值表达。
- Controller 层由统一的错误处理器（如 `QuoteErrorHandler`）映射状态码：参数缺失或类型错误 400，业务拒绝 422，资源不存在 404。映射以契约为准，不在 Controller 里散落 `if` 判断。

持久化相关约定（迁移脚本只增不改、行对象与领域对象分离、`QuoteClock` 与 UTC）见 [java-patterns](../architecture/java-patterns.md)。

### 注释

注释解释"为什么"，用于说明关键业务规则、阈值基于哪个中间金额判断、特殊边界条件、无法从代码直接看出的设计原因。

```java
// 不推荐
// 获取会员价格
BigDecimal memberPrice = Money.memberPrice(original, member);

// 推荐
// 运费门槛基于会员折扣和促销减免后的商品金额判断。
BigDecimal shipping = calculateShipping(goods, member);
```

```java
/**
 * 根据促销后的商品金额判断是否收取运费。
 * 会员满 80 元免运费，非会员满 100 元免运费。
 *
 * @param goods  会员折扣和促销减免后的商品金额
 * @param member 是否为会员
 * @return 应收取的运费
 */
private static BigDecimal calculateShipping(BigDecimal goods, boolean member) {
    // implementation
}
```

禁止在最终代码中保留流水账式编号注释（`// 1. 判断金额是否为 0`、`// 2. 获取会员价格` …）。练习初期可临时使用，重构完成后删除或改写为解释业务原因的注释。

### 补充：通用 Java 约定（沿用 pack 默认，未被本团队约定覆盖时适用）

- 构造注入优先，禁止字段注入。
- `Optional<T>` 仅用于可能无结果的查找方法返回值，禁止作为字段类型和方法参数。
- 领域异常继承 `RuntimeException` 且消息包含上下文；避免在非顶层处理处 `catch (Exception e)`。
- 流式操作保持短管道，复杂逻辑优先使用循环。

## Rationale

统一的 Java 风格约定让团队与 agent 产出的代码在命名、金额精度、常量可见性和业务表达上保持一致；金额使用 `BigDecimal` 与 `compareTo` 是为了避免浮点误差和 scale 比较陷阱，显式 `RoundingMode` 则是为了让舍入发生的位置成为可评审的决定，而不是实现细节的副产品。

## Verification

| Check | Blocks |
|---|---|
| 金额是否全部为 `BigDecimal` 且由 `Money.amount` 构造；金额比较是否使用 `compareTo` | pr-merge |
| 除法与按比例计算是否显式指定 `RoundingMode`；分与元的转换是否只在 Controller / DTO 边界 | pr-merge |
| 是否消除了魔法数字、多层嵌套三元表达式，阈值是否使用正确的中间金额字段 | pr-merge |
| 同一阈值是否只定义一次，测试是否引用常量而不是抄数字 | pr-merge |
| 命名是否表达业务含义；内部常量是否优先 `private static final`；金额常量后缀是否符合 `_THRESHOLD/_FEE/_OFF/_FACE` | pr-merge |
| 包是否按特性平铺；类名后缀是否表达职责 | pr-merge |
| 输入非法是否抛 `IllegalArgumentException`，业务拒绝是否用专门异常类型 | pr-merge |
| 注释是否解释业务原因，是否残留流水账编号注释和调试代码 | pr-merge |

## Examples

Good / Bad 对照见 Rule 段各小节中的 `// 推荐` 与 `// 不推荐` 代码块。

## Exceptions

- 本文件替换 rulepack 默认 `java-coding-style` 中与本团队约定重叠的部分；未被本节覆盖的通用约定仍按 pack 默认为准。
- 若团队改用 `getPromotion` / `getShipping` 命名，须整体统一，不得与 `calculate*` 混用。
