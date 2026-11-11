# 安全规则（security）

本目录只有这一个规则文件，它是该分类的权威正文。规则 ID 就是二级标题，`@rule:<id>` 与索引中的 `#<id>` 都指向本文件里的同名小节。

## 适用范围

所有会进入生产路径的改动。`security-baseline` 是常开底线，`no-hardcoded-secrets` / `pii-scrubbing` / `prompt-injection-defense` 分别管凭据、个人信息与提示注入，`java-security` 是 Java 栈的具体做法。

## 规则总表

| ID | 规则 | 优先级 | 触发 | 适用栈 |
|---|---|---|---|---|
| security-baseline | 强制安全检查基线 | Critical | always | — |
| no-hardcoded-secrets | 禁止硬编码凭据 | Critical | always | — |
| pii-scrubbing | 日志与模型上下文脱敏 | Critical | auto | — |
| prompt-injection-defense | 防御提示注入 | Critical | auto | — |
| java-security | Java 安全做法 | Critical | always | java |

## security-baseline

**强制安全检查基线。** 任何触及生产路径的提交前，确认下面清单；发现安全问题立即停下，先修 CRITICAL 项、轮换已暴露凭据，再排查同类缺陷是否在别处也存在。

### 必查清单

- [ ] 没有硬编码凭据（API key、密码、token）
- [ ] 用户输入在信任边界处校验
- [ ] 已防注入（参数化查询 / 安全 API，禁止字符串拼接 SQL）
- [ ] 已防 XSS（对不可信 HTML 编码或净化）
- [ ] 会话 Cookie 认证的状态变更请求已开启 CSRF 防护
- [ ] 本次变更的认证与授权已验证
- [ ] 暴露端点有限流，或已记录例外
- [ ] 错误信息不泄露凭据、堆栈内部信息或个人信息

### 响应流程

1. 停止受影响路径上的功能开发。
2. 判定严重度（CRITICAL 阻断合并）。
3. 先修 CRITICAL 再继续。
4. 轮换已暴露的凭据。
5. 在代码库中检索同类模式。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 安全敏感改动的 PR 中是否附凭据扫描结果与清单确认 | pre-commit / pr-merge |

### 示例

```text
推荐：新端点使用参数化查询、校验输入、凭据从密钥存储读取。
不推荐：处理器用字符串拼接 SQL，并把原始异常文本返回给客户端。
```

### 例外

- 隔离沙箱中的非生产试验，在明确标注且不可能合入受保护分支时，可暂缓限流配置。

## no-hardcoded-secrets

**禁止硬编码凭据。**

- 源码与文档里都不提交 API key、token、密码、私钥。
- 凭据通过密钥存储或环境变量注入，并在环境规则里记录。
- 一旦暴露立即轮换。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 凭据扫描是否通过 | pre-commit / pr-merge |

### 示例

```java
// 推荐
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY must be set");

// 不推荐
private static final String API_KEY = "sk-live-...";
```

### 例外：无。

## pii-scrubbing

**日志与模型上下文脱敏。**

- 默认不记录原始个人信息（姓名、电话、证件号、支付数据）。
- 需要时在进入遥测或模型上下文前做脱敏或哈希。
- 允许处理个人信息的路径必须记录保留期。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 日志抽样与脱敏器测试 | pr-merge / runtime |

### 示例

```text
推荐：日志只存 user_id 的哈希。
不推荐：debug 日志里出现完整护照号。
```

### 例外：无。

## prompt-injection-defense

**防御提示注入。**

- 不把不可信用户内容无边界地拼进系统提示词。
- 模型输出触发的工具与文件访问必须白名单化并校验。
- 检索到的文档视为不可信数据，不是指令。

### 检查项

| 检查 | 阻断点 |
|---|---|
| 提示词构造评审与运行时防护 | pr-merge / runtime |

### 示例

```text
推荐：用户文本作为结构化数据字段传入，并带明确分隔符。
不推荐：system = base + user_message，没有任何隔离。
```

### 例外：无。

## java-security

**Java 安全做法。**

### 凭据管理

- 源码里不硬编码 API key、token、凭据。
- 用环境变量（`System.getenv`）或密钥管理器（Vault、云厂商密钥服务）提供生产凭据。
- 含密配置放 `.gitignore`，不提交。

### SQL 注入防护

- 一律使用参数化查询，禁止把用户输入拼进 SQL。
- 用 `PreparedStatement` 或框架的参数化 API（如 `JdbcTemplate` 的 `?` 占位）。
- 原生查询里用到的输入仍要校验与净化。

```java
// 不推荐 — 字符串拼接导致注入
Statement stmt = conn.createStatement();
String sql = "SELECT * FROM orders WHERE name = '" + name + "'";
stmt.executeQuery(sql);

// 推荐 — 参数化
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE name = ?");
ps.setString(1, name);
```

### 输入校验

- 在系统边界先校验再处理。
- 用 Bean Validation（`@NotNull`、`@NotBlank`、`@Size`）标注 DTO。
- 文件路径与用户提供的字符串使用前净化；校验失败快速拒绝并给出明确消息。

```java
public Order createOrder(String customerName, BigDecimal amount) {
    if (customerName == null || customerName.isBlank()) {
        throw new IllegalArgumentException("customer name is required");
    }
    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException("amount must be positive");
    }
    return new Order(customerName, amount);
}
```

### 认证与授权

- 不自行实现加密算法，使用成熟库。
- 密码用 bcrypt 或 Argon2 存储，绝不用 MD5 / SHA1。
- 授权检查在服务边界执行。
- 日志中清除敏感数据，不记录密码、token 与个人信息。

### 依赖安全

- 用 `mvnw.cmd dependency:tree` 审计传递依赖。
- 用 OWASP Dependency-Check 或同类工具扫描已知 CVE。
- 依赖保持更新，配置 Dependabot 或 Renovate。

### 错误信息

- API 响应不暴露堆栈、内部路径与 SQL 错误。
- 在处理器边界把异常映射为安全的通用消息。
- 服务端记录详细错误，客户端只拿通用提示。

```java
try {
    return orderService.findById(id);
} catch (OrderNotFoundException ex) {
    log.warn("order not found: id={}", id);
    return ApiResponse.error("Resource not found");
} catch (Exception ex) {
    log.error("unexpected error processing order id={}", id, ex);
    return ApiResponse.error("Internal server error");
}
```

### 检查项

| 检查 | 阻断点 |
|---|---|
| 是否硬编码凭据，是否从环境或密钥存储读取 | pr-merge |
| 是否全部参数化查询，无字符串拼接 SQL | pr-merge |
| 边界输入是否校验，错误响应是否泄露内部信息 | pr-merge |
| 密码哈希算法是否合规，授权检查是否在服务边界 | pr-merge |

### 例外

- 现有代码中与本规则不一致的写法，在下次因业务变更修改该文件时收口，不单开重构提交。

## 为什么这样定

一条常开的安全基线能挡住 agent 与代码生成最常见的疏漏，而不必等到专项安全评审；凭据、个人信息与提示注入之所以单列，是因为它们的失败模式各不相同（泄露、合规、越权执行），修复动作也不同。Java 一节的写法是把基线落到具体 API 上，避免「知道要防注入但写不出来」。

## 全分类检查清单

| 检查 | 阻断点 |
|---|---|
| 安全清单是否逐项确认，CRITICAL 项是否清零 | pre-commit / pr-merge |
| 凭据是否来自环境或密钥存储，扫描是否通过 | pre-commit / pr-merge |
| 日志与模型上下文是否已脱敏 | pr-merge / runtime |
| 提示词与工具访问是否有边界与白名单 | pr-merge / runtime |
| Java 项目是否使用参数化查询与安全哈希 | pr-merge |
