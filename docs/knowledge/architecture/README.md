# Architecture knowledge

System architecture, C4, and topology notes.

## Declared layers

Dependency-direction authority: `@rule:layer-boundaries` and `@rule:package-structure`
([rules/architecture/rules.md](../rules/architecture/rules.md#package-structure)).

Standard layered layout for Java projects once the layering trigger is met
(single package > 15 classes, two or more business domains, or a new Spring Boot web project):

```text
ui / controller -> service -> manager (optional) -> dao / mapper -> model
dto at controller/service boundaries; exception and utils are cross-cutting leaves
```

- `dao` (JPA/JDBC repositories) and `mapper` (MyBatis) are mutually exclusive persistence forms.
- Small projects stay feature-flat under `training.<domain>`; class responsibilities still follow the package taxonomy. Cross-layer shortcuts require an ADR or exception record.
- The React frontend lives in `frontend/` per `@rule:web-coding-style`, outside Java packages.
