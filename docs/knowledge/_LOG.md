# Knowledge log

Append-only timeline of KB changes.

| date | id | change | author |
|---|---|---|---|
| 2026-11-10 | kb.rules | 初始化 `rules/` MECE 骨架并落地团队 Java Code Style：`java-coding-style`、`java-testing`、`tdd-cycle`、`git-commit-conventions`、`code-review-checklist` | agent |
| 2026-11-10 | kb.index | `_INDEX.md` 补齐 rules 各分类条目与来源链接；`rules/quality/README`、`rules/testing/README` 标注已应用的 java 栈规则 | agent |
| 2026-11-10 | kb.rules.commit | Git 提交规则改为 spec 级：verify 通过后一次、archive 之后一次；冲突处以 `git-commit-conventions` 为准，同步调整 `tdd-cycle`、`code-review-checklist`、`rules/README`、`_INDEX.md` | agent |
| 2026-11-10 | kb.rules.v2 | 吸收团队 v2 规范（`class3-group2-*-20261110-v2`）中未覆盖部分：新增 `naming-conventions`、`web-coding-style`、`web-testing`、`api-contract`、`git-branching-and-pr`、`document-conventions`、`sdd-artifacts` 七条；补齐 `java-coding-style`、`java-testing`、`java-patterns`、`spec-first`、`code-review-checklist`；规则总数 24 → 31 | agent |
| 2026-11-10 | kb.index | `_INDEX.md` 增补上述七条规则条目；`rules/README` 增加团队六条原则与两批规则表 | agent |
| 2026-11-10 | kb.rules.consolidate | 规则目录重构为 `rules/<category>/rules.md` 单文件并全中文；`_INDEX.md` 改为每分类一行、`rules/_INDEX.md` 改为规则内锚点表；`rules/README.md` 与 `_SCHEMA.md` 中文化；修正规则总数口径为 24 条（31 是原文件数） | agent |
| 2026-11-11 | kb.rules.package-structure | 新增 `package-structure` 规则（标准分层包分类与依赖方向），衔接 `java-patterns` / `java-coding-style`；`architecture/README.md` 补 Declared layers；规则总数 24→25；首次建立 `.qoder/rules/ai4se` 投影 | agent |
| 2026-11-11 | kb.rules.package-structure.v2 | 参照阿里巴巴开发手册扩展为完整应用分层（Manager 可选层、DO/DTO/BO/Query/VO 概念映射、分层异常职责、前端目录层映射、仓库级结构）；适用栈扩为 java,react,typescript；规则总数不变 25 | agent |
