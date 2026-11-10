# code-review-checklist — Code Review 检查清单（本项目团队约定）

## Metadata

| Field | Value |
|---|---|
| **ID** | code-review-checklist |
| **Category** | process |
| **Priority** | High |
| **Activation** | manual |
| **Applies To** | all |
| **Stack** | java,react,typescript |

## Rule

### 生产代码

- [ ] 包名是否全部小写，类是否按特性平铺在 `training.<domain>` 下。
- [ ] 类名、方法名、变量名和常量名是否符合 Java 命名规范，类名后缀是否表达职责。
- [ ] 金额是否统一使用 `BigDecimal` 和 `Money.amount`。
- [ ] 金额比较是否使用 `compareTo`。
- [ ] 除法与按比例计算是否显式指定 `RoundingMode`，分与元转换是否只在边界层。
- [ ] 内部常量是否优先使用 `private static final`。
- [ ] 同一阈值是否只定义一次，能否在规格里找到出处。
- [ ] 是否消除了不必要的魔法数字。
- [ ] 是否避免多层嵌套三元表达式，中间变量是否都有命名。
- [ ] 业务计算顺序是否清晰。
- [ ] 运费和促销门槛是否使用了正确的金额字段（促销基于 `memberPrice`，运费基于券后 `goods`）。
- [ ] 输入非法是否抛 `IllegalArgumentException`，业务拒绝是否用专门异常类型而非字符串判断。
- [ ] 注释是否说明业务原因，而不是重复代码。
- [ ] 是否删除流水账式编号注释和调试代码。

### 持久化

- [ ] 迁移脚本是否只增不改，命名是否为 `V<序号>__<动词_名词>.sql`。
- [ ] 时间是否存 UTC，取时间是否走可注入时钟。
- [ ] 领域对象是否未被标注 JPA 注解，行对象与领域对象是否分离。
- [ ] 仓储接口是否在业务包内，实现是否可替换。

### 测试代码

- [ ] 测试类是否采用 `开发类名 + Test` 或 `开发类名 + 场景 + Test`。
- [ ] 测试方法是否采用 `in_<输入条件>_out_<关键预期结果>`。
- [ ] 是否使用 `member` 和 `nonMember` 表示会员身份。
- [ ] 金额是否明确标识为 `originalPrice`、`memberPrice` 或 `goods`。
- [ ] 小数金额是否使用下划线表达，例如 `200_01`。
- [ ] 是否避免 `noFreeShipping` 等双重否定。
- [ ] 是否只把关键输出写入测试方法名。
- [ ] 测试内容是否使用 Given / When / Then。
- [ ] 输入和预期结果是否清晰。
- [ ] 多字段结果是否使用 `assertAll`。
- [ ] 断言顺序是否与业务计算顺序一致。
- [ ] 是否移除 `System.out.println`。
- [ ] 是否覆盖门槛以下、等于门槛和门槛以上。
- [ ] 一个测试是否只描述一个业务场景。

### 前端

- [ ] 业务逻辑是否在组件之外，纯函数是否有单元测试。
- [ ] 接口字段是否保持 snake_case，没有私自转驼峰。
- [ ] 请求是否统一走 `api.ts`，错误处理是否按契约 `code` 原值判断。
- [ ] 类型是否与 `openapi.yaml` 一一对应，`any` 是否已消除。
- [ ] 表单控件是否有 label，可交互元素是否为 `button` 或 `a`。
- [ ] 文案是否集中在 `messages.ts`，没有拼接句子。
- [ ] 组件命名是否为 UpperCamel、文件名与组件名一致；状态是否用可辨识联合而非多个布尔。
- [ ] 是否残留 `console.log`、`waitForTimeout` 与直接 DOM 查询。
- [ ] 纯逻辑是否有测试，界面改动是否跑通受影响的端到端用例。

### 契约

- [ ] 契约是否先于两端代码改动。
- [ ] 路径是否为复数资源，无动词资源名，版本未写进路径。
- [ ] 字段是否 snake_case、金额 `_cents`、时间 `_at` + UTC。
- [ ] 必填是否在 `required`，服务端生成字段是否 `readOnly`，请求体是否有成功与拒绝两个 example。
- [ ] 400 与 422 的边界是否没有漂移，错误体是否只有 `code`。
- [ ] 新增错误码是否在契约、后端、前端三处一致。
- [ ] 破坏性变更是否升主版本或标 `deprecated`，两端测试是否都跑过。

### TDD 和 Git

- [ ] Red 测试是否因预期业务原因失败，失败输出是否记入 verify 报告。
- [ ] Green 是否只包含使当前测试通过的最小实现。
- [ ] Refactor 是否没有改变业务行为。
- [ ] Green 和 Refactor 后完整测试集是否通过。
- [ ] 该 change 是否恰好两次提交：verify 通过后一次、archive 之后一次。
- [ ] 是否未出现按 TDD 步骤拆分的中间提交。
- [ ] verify 提交是否确实在该 change 的 `/opsx verify` 通过之后。
- [ ] archive 提交是否只包含归档产物、living spec 合并与知识库更新。
- [ ] Commit message 是否符合 `<type>(<stage>): <change-id> <description>`。
- [ ] 是否避免把两个 spec 或无关修改放入同一个 commit。
- [ ] 是否排除 IDE 文件、编译产物和无关格式化修改。

## Rationale

清单把分散在编码、测试、前端、契约与 Git 规范中的可判定条目集中到一次评审动作里，避免评审者依赖记忆逐条回想；每条都指向具体文件中的规范，便于给出可执行的修改意见而非风格争论。

## Verification

| Check | Blocks |
|---|---|
| 生产代码段与持久化段清单是否全部勾选 | pr-merge |
| 测试代码段清单是否全部勾选 | pr-merge |
| 前端段清单是否全部勾选 | pr-merge |
| 契约段清单是否全部勾选 | pr-merge |
| TDD 和 Git 段清单是否全部勾选 | pr-merge |

## Examples

```text
Reviewer comment（GOOD）:
  in_member_price100_out_freeShipping 命名未注明字段类型，
  应为 in_member_originalPrice100_out_noPromotion_freeShipping
  （见 rules/testing/java-testing.md「金额必须注明字段类型」）

Reviewer comment（BAD）:
  命名不够清晰，改一下
```

## Exceptions

- 清单中的条目与其来源规则冲突时，以来源规则为准：本清单只做评审索引，不新增规范。
- `docs`、`chore`、`style` 类提交可只应用与其改动范围相关的条目。
