# Shared domain vocabulary

Cross-context terms used by every bounded context.

The single source of truth is the [ubiquitous language table](../README.md#ubiquitous-language)
in the domain index. Terms that appear in more than one context:

- `Role` (`project_owner`, `resource_coordinator`) and `Actor` (the resolved account behind `X-User-Id`).
- `RoleType`, `Level`, `SkillId`, `SkillCatalog`, `TravelDurationBand` — the fixed catalogs.
- `DemandStatus` (`draft` / `active` / `closed`) and `ProjectStatus` (`active` / `ended`).
- `Headcount`, `Confirmed count`, `Pending review count`, `Gap`, `Roster`.

Do not copy definitions here; extend the table in the domain index so no term has two meanings.
