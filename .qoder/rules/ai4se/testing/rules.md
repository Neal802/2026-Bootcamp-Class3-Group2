# 测试规则（testing）

本目录只有这一个规则文件，它是该分类的权威正文。规则 ID 就是二级标题，`@rule:<id>` 与索引中的 `#<id>` 都指向本文件里的同名小节。

## 适用范围

`java-testing` 管后端 JUnit 5；`web-testing` 管前端单元、组件与端到端。两者共用一条底线：测试名描述可观察的业务行为，不描述实现细节。

## 规则总表

| ID | 规则 | 优先级 | 触发 | 适用栈 |
|---|---|---|---|---|
| java-testing | JUnit 5 测试命名与结构 | High | auto | java |
| web-testing | 前端测试分层与写法 | High | auto | react,typescript |

## java-testing

**JUnit 5 测试命名与结构。** 按仓库 wrapper 执行测试，不手工 `mvn`：

```text
Windows     mvnw.cmd test
其他平台     ./mvnw test
```

### 测试类命名

默认 `被测类名 + Test`：`QuoteCalculatorTest`、`QuotePrinterTest`。

场景明显不同或单类过大时用 `被测类名 + 场景 + Test`：

```text
QuoteCalculatorMemberTest
QuoteCalculatorNonMemberTest
QuoteCalculatorPromotionTest
QuoteCalculatorBoundaryTest
OpenApiTest
```

适合拆分的情况：会员与非会员规则明显不同；促销或运费规则包含较多独立用例；单类过大不易定位；不同场景初始化方式不同。禁止仅为减少行数而拆分，拆分后的类必须有清晰稳定的业务边界。

### 测试方法命名（Input / Output 风格）

统一格式 `in_<输入条件>_out_<关键预期结果>`：

```java
in_member_originalPrice80_out_noPromotion_shipping10()
in_member_originalPrice100_out_noPromotion_freeShipping()
in_nonMember_originalPrice95_out_noPromotion_shipping10()
in_nonMember_originalPrice200_01_out_promotion20_freeShipping()
```

不使用 `isMember_price100_noPromotion_freeShipping()`：没有区分输入与预期；`isMember` 易被当作普通布尔方法；`price100` 没说明是原价、会员价还是券后金额。

四条细则：

- 会员身份写 `member` / `nonMember`，不写 `isMember` / `isNotMember`。
- 金额必须注明字段：`originalPrice`、`memberPrice`、`goods`，禁止 `price100`。
- 小数用下划线：`79.99` → `79_99`，`200.01` → `200_01`，整数不写下划线。
- 输出只写本场景关注的关键结果；需要全字段时用 `allAmountsZero` 这类概括，完整期望值放 JavaDoc 与断言。

输出使用肯定表达：`freeShipping`、`shipping10`、`noPromotion`、`promotion20`，禁止 `noFreeShipping` 这类双重否定。

```java
// 不推荐
in_member_originalPrice100_out_memberPrice80_promotion0_goods80_shipping0_total80()

// 推荐
in_member_originalPrice100_out_noPromotion_freeShipping()
```

特别注意 `in_nonMember_originalPrice100_out_promotion20_shipping10()`：`originalPrice = 100.00`、`memberPrice = 100.00`、`promotion = 20.00`、`goods = 80.00`、`shipping = 10.00`、`total = 90.00`。非会员免运费门槛是 `goods >= 100.00`，促销后仅 `80.00`，因此仍需付 `10.00` 运费。

### 测试结构：Given / When / Then

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

禁止在同一项目混用 `Given / When / Then`、`Arrange / Act / Assert`、`input / execute / output`；若改用后者，须整体统一。

### 测试 JavaDoc

包含多个金额字段或规则容易误解时，写出输入与预期：

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

命名、注释与代码术语必须一致，统一 `memberPrice`，禁止 `member_price`。

### 断言顺序与多字段断言

断言顺序与业务计算顺序一致：`original` → `memberPrice` → `promotion` → `voucher` → `goods` → `shipping` → `total`，能直接看出从哪一步开始偏。

多字段统一用 `assertAll`，保证一个字段失败仍能看到其它结论；每个断言带第三个参数写明字段名，失败信息里能定位：

```java
assertAll(
        () -> assertEquals(expectedOriginal, quote.original(), "original"),
        () -> assertEquals(expectedMemberPrice, quote.memberPrice(), "memberPrice"),
        () -> assertEquals(expectedTotal, quote.total(), "total")
);
```

### 测试引用常量，不抄数字

```java
// 推荐
BigDecimal threshold = QuoteCalculator.MEMBER_SHIPPING_THRESHOLD;

// 不推荐
BigDecimal threshold = Money.amount("80.00");
```

- 需要被同包测试引用的常量写成包级可见（`static final`，不带修饰符），不为测试升成 `public`。
- 门槛自身的边界点（减 0.01、等于、加 0.01）仍要写出具体数值，因为这几个点就是在验证常量取值的含义。

### 一个测试描述一个业务场景

「一个业务场景」可以包含多个相关输出（同一报价同时验证折扣、促销、券、商品金额、运费与总价）。禁止在一个方法里连续执行多个价格或会员身份的场景。同一规则需要大量输入时用 `@ParameterizedTest`，每组参数仍要有明确场景含义。

### 不保留调试输出

正式测试禁止保留 `System.out.println(quote)`。排查时临时加，提交前删除。

### 边界值

所有金额门槛至少覆盖门槛以下、刚好等于、门槛以上：

```text
goods = 79.99  -> shipping = 10.00
goods = 80.00  -> shipping = 0.00
goods = 80.01  -> shipping = 0.00
```

促销门槛 `100.00`、`300.00`、`500.00` 同样各覆盖 `threshold - 0.01`、`threshold`、`threshold + 0.01`。

写测试前先确认门槛基于哪个字段：促销门槛基于 `memberPrice`，运费门槛基于券后的 `goods`，`originalPrice` 只是外部输入。判断依据写错，边界测试会全部通过却验证了错误行为。

### 历史测试迁移

早于本规则的驼峰式方法名（如 `emptyOrderHasNoCharge`）按整类迁移：新写的测试一律用 `in_/out_`；旧类在下次因业务变更被修改时整类重命名，一次改完。不允许同一个类里两种风格混用。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 测试类名是否为 `被测类名 + Test` 或 `被测类名 + 场景 + Test` | pr-merge |
| 测试方法是否为 `in_*_out_*`，是否用 `member` / `nonMember`，金额是否带字段名 | pr-merge |
| 是否使用 Given / When / Then 与 `assertAll`，断言顺序是否与计算顺序一致 | pr-merge |
| 每个断言是否带字段名第三参数 | pr-merge |
| 阈值是否引用常量而非抄数字 | pr-merge |
| 是否覆盖门槛以下、等于、以上；是否残留 `System.out.println` | pr-merge |
| `mvnw.cmd test`（或 `./mvnw test`）是否全绿，验证报告是否贴真实输出摘要 | pr-merge |

### 例外

- 若项目改用 `Arrange / Act / Assert`，须整体统一修改，禁止局部混用。
- 纯文档、构建脚本等无业务行为的改动不要求补测试。

## web-testing

**前端测试分层与写法。**

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

### 检查项

| 检查 | 阻断点 |
|---|---|
| 用例名是否为描述可观察行为的英文陈述句 | pr-merge |
| 纯逻辑是否有对应单元测试，是否与被测模块同目录 | pr-merge |
| 查询是否优先语义化选择器，是否残留 `console.log`、`waitForTimeout` | pr-merge |
| `npm run typecheck` 与 `npm run build` 是否通过 | pr-merge |
| 界面改动是否跑通受影响的端到端用例 | pr-merge |

### 示例

```ts
// 推荐
it('shows the same saved quote after reloading the list', async () => { /* ... */ });

// 不推荐
it('works', async () => { /* ... */ });
```

### 例外

- 仓库尚无端到端框架时，界面改动可用组件测试覆盖，并在 PR 描述中说明缺少哪一层验证。
- 第三方组件行为不可控时，允许对其使用 CSS 选择器断言，但需在注释中写明原因。

## 为什么这样定

Input / Output 风格的方法名让输入条件与预期结果在同一行内可直接区分，配合 Given / When / Then 与 `assertAll` 断言顺序，失败信息直接指向出错的业务计算步骤。前端三层测试各回答一个问题：纯逻辑层验证「业务规则算得对」，组件层验证「用户看到的和能点的对」，端到端验证「整条路径在真实接口下走得通」。混层会让失败定位变慢——组件测试里做端到端的事，失败后无法判断是规则错还是渲染错。

## 全分类检查清单

| 检查 | 阻断点 |
|---|---|
| 测试名是否描述可观察行为，术语是否与规格一致 | pr-merge |
| 断言是否覆盖业务计算顺序，失败信息能否直接定位字段 | pr-merge |
| 门槛类规则是否覆盖减 0.01、等于、加 0.01 | pr-merge |
| 后端 `mvnw.cmd test`、前端 `typecheck` + `build` 是否全绿 | pr-merge |
