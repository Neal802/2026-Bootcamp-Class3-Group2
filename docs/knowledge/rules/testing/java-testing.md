# java-testing — JUnit 5 测试命名与结构（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | java-testing |
| **Category** | testing |
| **Priority** | High |
| **Activation** | auto |
| **Applies To** | all |
| **Stack** | java |

## Rule

### 测试类命名

测试类名称与被测试类对应，默认采用 `开发类名 + Test`：

| 开发类 | 测试类 |
|---|---|
| `QuoteCalculator.java` | `QuoteCalculatorTest.java` |
| `QuotePrinter.java` | `QuotePrinterTest.java` |

测试场景较多，或不同角色的业务规则明显不同时，采用 `开发类名 + 业务场景 + Test`：

```text
QuoteCalculatorMemberTest
QuoteCalculatorNonMemberTest
QuoteCalculatorPromotionTest
QuoteCalculatorBoundaryTest
```

适合拆分的情况：会员与非会员规则明显不同；促销或运费规则包含较多独立用例；单个测试类过大不易定位场景；不同场景的测试初始化方式不同。禁止仅为减少文件行数而拆分，拆分后的测试类必须具有清晰、稳定的业务边界。

### 测试方法命名（团队统一 Input / Output 风格）

统一格式：

```text
in_<输入条件>_out_<关键预期结果>
```

基本结构：

```text
in_<会员身份>_<输入金额字段及数值>_out_<关键业务结果>
```

```java
in_member_originalPrice80_out_noPromotion_shipping10()

in_member_originalPrice100_out_noPromotion_freeShipping()

in_nonMember_originalPrice95_out_noPromotion_shipping10()

in_nonMember_originalPrice200_01_out_promotion20_freeShipping()
```

不再使用 `isMember_price100_noPromotion_freeShipping()` 这类命名，原因：没有明确区分输入条件与预期结果；`isMember` 容易被理解为普通布尔判断方法；`price100` 没有说明是原价、会员价还是促销后的商品金额；结构难以在团队中稳定复用。

### 会员身份表达

测试方法名中统一使用 `member` 与 `nonMember`：

```java
in_member_originalPrice100_out_freeShipping()
in_nonMember_originalPrice95_out_shipping10()
```

禁止使用 `in_isMember_price100_out_freeShipping()`、`in_isNotMember_price95_out_shipping10()`。`isMember` 更适合作为 Java 布尔变量名。

### 金额必须注明字段类型

禁止含义模糊的 `price80`、`price100`、`price200_01`，应按实际输入或判断字段使用 `originalPrice80`、`memberPrice80`、`goods80`。字段含义见 [java-coding-style](../quality/java-coding-style.md) 的金额字段表。

### 小数金额表达

Java 方法名不能包含小数点，方法名中的小数统一使用下划线：

```text
79.99  -> 79_99
80.00  -> 80
80.01  -> 80_01
200.01 -> 200_01
```

```java
in_member_goods79_99_out_shipping10()
in_member_goods80_out_freeShipping()
in_member_goods80_01_out_freeShipping()
```

金额保留几位小数由测试数据和断言准确体现，方法名只用于清晰识别场景。

### 输出结果表达

使用明确的肯定表达：`freeShipping`、`shipping0`、`shipping10`、`noPromotion`、`promotion20`。禁止 `noFreeShipping` 这类双重否定，改用 `shipping10` 或 `chargeShipping`。

```java
// 推荐
in_member_originalPrice80_out_noPromotion_shipping10()

// 不推荐
in_isMember_price80_out_noPromotion_noFreeShipping()
```

输出只保留当前场景真正关注的关键结果，完整结果放在测试 JavaDoc 和断言中：

```java
// 不推荐
in_member_originalPrice100_out_memberPrice80_promotion0_goods80_shipping0_total80()

// 推荐
in_member_originalPrice100_out_noPromotion_freeShipping()
```

推荐命名清单：

```java
in_member_originalPrice0_out_allAmountsZero()

in_member_originalPrice80_out_noPromotion_shipping10()

in_member_originalPrice100_out_noPromotion_freeShipping()

in_nonMember_originalPrice95_out_noPromotion_shipping10()

in_nonMember_originalPrice100_out_promotion20_shipping10()

in_nonMember_originalPrice200_01_out_promotion20_freeShipping()
```

特别注意 `in_nonMember_originalPrice100_out_promotion20_shipping10()`：`originalPrice = 100.00`、`memberPrice = 100.00`、`promotion = 20.00`、`goods = 80.00`、`shipping = 10.00`、`total = 90.00`。非会员免运费门槛为 `goods >= 100.00`，促销后 `goods` 仅 `80.00`，因此仍需支付 `10.00` 运费。

### 测试用例结构：Given / When / Then

```java
@Test
void in_member_originalPrice100_out_noPromotion_freeShipping() {
    // Given
    BigDecimal originalPrice = Money.amount("100.00");
    boolean member = true;

    // When
    Quote quote = new QuoteCalculator().calculate(originalPrice, member);

    // Then
    assertAll(
            () -> assertEquals(Money.amount("100.00"), quote.original(), "original"),
            () -> assertEquals(Money.amount("80.00"), quote.memberPrice(), "memberPrice"),
            () -> assertEquals(Money.amount("0.00"), quote.promotion(), "promotion"),
            () -> assertEquals(Money.amount("0.00"), quote.voucher(), "voucher"),
            () -> assertEquals(Money.amount("80.00"), quote.goods(), "goods"),
            () -> assertEquals(Money.amount("0.00"), quote.shipping(), "shipping"),
            () -> assertEquals(Money.amount("80.00"), quote.total(), "total")
    );
}
```

禁止在同一项目中混用 `Given / When / Then`、`Arrange / Act / Assert`、`input / execute / output`。若团队决定改用 `Arrange / Act / Assert`，须整体统一修改。

### 测试 JavaDoc

包含多个金额字段或规则容易误解时，明确写出输入与预期结果：

```java
/**
 * 会员情况下，在完成会员折扣和促销计算后，商品金额满 80 元免运费。
 *
 * 输入：
 * - originalPrice = 100.00
 * - member = true
 *
 * 预期：
 * - original = 100.00
 * - memberPrice = 80.00
 * - promotion = 0.00
 * - voucher = 0.00
 * - goods = 80.00
 * - shipping = 0.00
 * - total = 80.00
 */
```

命名、注释和代码使用的术语必须一致，统一使用 `memberPrice`，禁止混用 `member_price`、`member price`。

### 断言顺序与多字段断言

断言顺序与业务计算顺序一致：`original` → `memberPrice` → `promotion` → `voucher` → `goods` → `shipping` → `total`，便于快速判断计算从哪一步开始出现偏差。

多字段结果统一使用 JUnit 5 的 `assertAll`，保证一个字段失败后仍能看到其他断言结果；每个断言带第三个参数写明字段名，失败信息里能直接定位：

```java
assertAll(
        () -> assertEquals(expectedOriginal, quote.original(), "original"),
        () -> assertEquals(expectedMemberPrice, quote.memberPrice(), "memberPrice"),
        () -> assertEquals(expectedTotal, quote.total(), "total")
);
```

### 测试引用常量，不抄数字

测试里需要阈值时引用实现中的常量，不重复抄写数字，避免改了实现忘了改测试：

```java
// 推荐
BigDecimal threshold = QuoteCalculator.MEMBER_SHIPPING_THRESHOLD;

// 不推荐
BigDecimal threshold = Money.amount("80.00");
```

- 需要被同包测试引用的常量写成包级可见（`static final`，不带修饰符），不要为了测试把它升成 `public`。
- 门槛自身的边界点（减 0.01、等于、加 0.01）仍需写出具体数值，因为这几个点就是要验证常量取值的含义。

### 测试命令

按仓库 wrapper 执行，不手工 `mvn`：

```text
Windows        mvnw.cmd test
其他平台        ./mvnw test
```

验证报告贴真实输出摘要（用例数、失败数），不写「测试通过」四个字。

### 一个测试描述一个业务场景

"一个业务场景"可以包含多个相关输出（同一报价同时验证折扣、促销、商品金额、运费和总价）。禁止在一个测试方法中连续执行多个不同价格或不同会员身份的场景。同一规则需要验证大量输入数据时使用 `@ParameterizedTest`，但每组参数仍应具备明确的场景含义。

### 测试中不保留调试输出

正式测试中禁止保留 `System.out.println(quote);`。测试结果由断言判断；排查问题时可临时使用，提交前必须删除。

### 边界值测试

所有涉及金额门槛的规则至少覆盖门槛以下、刚好等于门槛、门槛以上：

```text
goods = 79.99 -> shipping = 10.00
goods = 80.00 -> shipping = 0.00
goods = 80.01 -> shipping = 0.00
```

```java
in_member_goods79_99_out_shipping10()
in_member_goods80_out_freeShipping()
in_member_goods80_01_out_freeShipping()
```

促销门槛 `100.00`、`300.00`、`500.00` 分别覆盖 `threshold - 0.01`、`threshold`、`threshold + 0.01`。

测试前必须确认门槛基于哪个金额字段：促销门槛基于 `memberPrice`，运费门槛基于券后的 `goods`。

### 历史测试迁移

早于本规则的驼峰式测试方法名（如 `emptyOrderHasNoCharge`）按整类迁移：新写的测试一律用 `in_/out_`；旧类在下次因业务变更被修改时整类重命名，一次改完。不允许同一个类里两种风格混用。

前端测试分层、组件测试与端到端见 [web-testing](web-testing.md)。

## Rationale

Input / Output 风格的方法名让输入条件与预期结果在同一行内可直接区分，配合 Given / When / Then 结构和 `assertAll` 断言顺序，使失败信息直接指向出错的业务计算步骤，而不是迫使读者回读测试体。

## Verification

| Check | Blocks |
|---|---|
| 测试类名是否为 `开发类名 + Test` 或 `开发类名 + 场景 + Test` | pr-merge |
| 测试方法是否为 `in_*_out_*`，是否使用 `member` / `nonMember`，金额是否带字段名 | pr-merge |
| 是否使用 Given / When / Then 与 `assertAll`，断言顺序是否与计算顺序一致 | pr-merge |
| 每个断言是否带字段名第三参数，失败信息能否直接定位 | pr-merge |
| 测试引用阈值时是否引用常量而非抄写数字 | pr-merge |
| 是否覆盖门槛以下、等于门槛、门槛以上；是否残留 `System.out.println` | pr-merge |
| `mvnw.cmd test`（或 `./mvnw test`）是否全绿，验证报告是否贴真实输出摘要 | pr-merge |

## Examples

完整测试示例：

```java
package training.quote;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

class QuoteCalculatorMemberTest {

    private final QuoteCalculator calculator = new QuoteCalculator();

    /**
     * 会员情况下，在完成会员折扣和促销计算后，商品金额满 80 元免运费。
     *
     * 输入：
     * - originalPrice = 100.00
     * - member = true
     *
     * 预期：
     * - original = 100.00
     * - memberPrice = 80.00
     * - promotion = 0.00
     * - voucher = 0.00
     * - goods = 80.00
     * - shipping = 0.00
     * - total = 80.00
     */
    @Test
    void in_member_originalPrice100_out_noPromotion_freeShipping() {
        // Given
        BigDecimal originalPrice = Money.amount("100.00");
        boolean member = true;

        // When
        Quote quote = calculator.calculate(originalPrice, member);

        // Then
        assertAll(
                () -> assertEquals(Money.amount("100.00"), quote.original(), "original"),
                () -> assertEquals(Money.amount("80.00"), quote.memberPrice(), "memberPrice"),
                () -> assertEquals(Money.amount("0.00"), quote.promotion(), "promotion"),
                () -> assertEquals(Money.amount("0.00"), quote.voucher(), "voucher"),
                () -> assertEquals(Money.amount("80.00"), quote.goods(), "goods"),
                () -> assertEquals(Money.amount("0.00"), quote.shipping(), "shipping"),
                () -> assertEquals(Money.amount("80.00"), quote.total(), "total")
        );
    }
}
```

对应的 TDD 提交序列见 [tdd-cycle](../process/tdd-cycle.md) 与 [git-commit-conventions](../process/git-commit-conventions.md)。

## Exceptions

- 本文件替换 rulepack 默认 `java-testing` 中与团队约定重叠的部分。
- 若项目改用 `Arrange / Act / Assert`，须整体统一修改，禁止局部混用。
