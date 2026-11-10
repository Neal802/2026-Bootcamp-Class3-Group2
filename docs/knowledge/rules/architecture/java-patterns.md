# java-patterns — Java Patterns

## Metadata

| Field | Value |
|---|---|
| **ID** | java-patterns |
| **Category** | architecture |
| **Priority** | High |
| **Activation** | auto |
| **Applies To** | all |
| **Stack** | java |

## Rule

## Repository Pattern

Encapsulate data access behind an interface:

```java
public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findAll();
    Order save(Order order);
    void deleteById(Long id);
}
```

Concrete implementations handle storage details (JPA, JDBC, in-memory for tests).

## Service Layer

Business logic in service classes; keep controllers and repositories thin:

```java
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    public OrderSummary placeOrder(CreateOrderRequest request) {
        var order = Order.from(request);
        paymentGateway.charge(order.total());
        var saved = orderRepository.save(order);
        return OrderSummary.from(saved);
    }
}
```

## Constructor Injection

Always use constructor injection — never field injection:

```java
// GOOD — constructor injection (testable, immutable)
public class NotificationService {
    private final EmailSender emailSender;

    public NotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }
}

// BAD — field injection (untestable without reflection, requires framework magic)
public class NotificationService {
    @Inject // or @Autowired
    private EmailSender emailSender;
}
```

## DTO Mapping

Use records for DTOs. Map at service/controller boundaries:

```java
public record OrderResponse(Long id, String customer, BigDecimal total) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getTotal());
    }
}
```

## Builder Pattern

Use for objects with many optional parameters:

```java
public class SearchCriteria {
    private final String query;
    private final int page;
    private final int size;
    private final String sortBy;

    private SearchCriteria(Builder builder) {
        this.query = builder.query;
        this.page = builder.page;
        this.size = builder.size;
        this.sortBy = builder.sortBy;
    }

    public static class Builder {
        private String query = "";
        private int page = 0;
        private int size = 20;
        private String sortBy = "id";

        public Builder query(String query) { this.query = query; return this; }
        public Builder page(int page) { this.page = page; return this; }
        public Builder size(int size) { this.size = size; return this; }
        public Builder sortBy(String sortBy) { this.sortBy = sortBy; return this; }
        public SearchCriteria build() { return new SearchCriteria(this); }
    }
}
```

## Sealed Types for Domain Models

```java
public sealed interface PaymentResult permits PaymentSuccess, PaymentFailure {
    record PaymentSuccess(String transactionId, BigDecimal amount) implements PaymentResult {}
    record PaymentFailure(String errorCode, String message) implements PaymentResult {}
}

// Exhaustive handling (Java 21+)
String message = switch (result) {
    case PaymentSuccess s -> "Paid: " + s.transactionId();
    case PaymentFailure f -> "Failed: " + f.errorCode();
};
```

## API Response Envelope

Consistent API responses:

```java
public record ApiResponse<T>(boolean success, T data, String error) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

## 项目持久化约定（本项目团队约定）

本节覆盖 Web 型 Java 项目（Spring Boot + JPA + Flyway）的持久化做法，优先于上文通用示例。

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

### 仓储接口在业务包内

- 仓储接口（`QuoteRepository`）定义在业务包内，实现（`DatabaseQuoteRepository`、`MemoryQuoteRepository`）可替换。
- 测试优先使用内存实现，不为仓储写数据库集成测试；确实需要验证 SQL 语义时，单独标注为集成测试。

### 对象与不可变

- 值对象优先 `record`，字段默认 `final`；集合对外返回时做防御性拷贝。
- 不给 record 加 setter 式方法，需要变化时返回新实例。

## References

## Rationale

Stack-specific patterns norms for `java` keep agent output aligned with the project's chosen stack without duplicating common Rules.

## Verification

| Check | Blocks |
|---|---|
| PR review against this rule when touching `java` sources | pr-merge |
| 迁移脚本是否只增不改，命名为 `V<序号>__<动词_名词>.sql` | pr-merge |
| 时间是否存 UTC，取时间是否走可注入时钟而非 `Instant.now()` | pr-merge |
| 领域对象是否未被标注 JPA 注解，行对象与领域对象是否分离 | pr-merge |
| 仓储接口是否在业务包内，实现是否可替换 | pr-merge |

## Examples

See Good/Bad (or CORRECT/WRONG) samples in the Rule section when present.

## Exceptions

- None unless recorded in the project decision log / org policy.
