# Domain knowledge

Bounded contexts and the ubiquitous language of the talent-borrowing application.
This file owns the vocabulary; `shared/` only links back here, so terms stay unique.

## Context map

| Context | Capability | Responsibility | Code anchors |
|---|---|---|---|
| demand-management | `demand-management` | Project and demand registration, lifecycle, field validation | `model/Project`, `model/Demand`, `service/ProjectService`, `service/DemandService` |
| roster-and-gap | `roster-and-gap` | Headcount/confirmed/pending/gap counts and the read-only confirmed roster | `model/RosterSummary`, `model/RosterEntry`, `service/RosterSummaryService` |
| candidate-pool | `candidate-profile` | Candidate records, skills and maturity, availability, travel willingness, review status, deactivation | `model/Candidate`, `service/CandidateService` |
| candidate-screening | `candidate-screening` | Hard filters, cross-role fill, weighted scoring, include/exclude result | `service/ScreeningService` |
| recommendation | `recommendation-review`, `confirmation-record` | Submission, final review, rejection, withdrawal, two-step release, score snapshot | `model/Recommendation`, `service/RecommendationService` |
| notification (supporting) | `notification` | Email outbox, failure record and retry, review reminders | `model/Notification`, `service/NotificationService`, `service/ReviewReminderService` |
| identity (supporting) | — | In-app accounts, two system roles, `X-User-Id` stub | `model/UserAccount`, `constant/Role` |
| catalog (supporting) | — | Fixed role, level, skill and travel dictionaries | `constant/RoleType`, `Level`, `SkillId`, `SkillCatalog`, `TravelDurationBand` |

Downstream changes (`add-candidate-pool-and-screening`, `add-recommendation-review-and-notification`) read demands through this model; they do not own demand data.

## Ubiquitous language

| Term | 中文 | Wire value | Meaning |
|---|---|---|---|
| Project | 项目 | — | Container for demands: name, start/end date, status, project owner. |
| Demand | 岗位需求 | — | Staffing request under a project: role, level, skills, headcount, arrival date, duration, location, travel, owning coordinator. |
| Project owner | 项目负责人 | `project_owner` | System role that creates projects and demands; sees only demands under own projects. |
| Resource coordinator | 资源协调员 | `resource_coordinator` | System role responsible for executing demands; sees only demands where `owner_coordinator_id` is self. |
| Role type | 岗位角色 | `pm` / `ba` / `dev` / `qa` / `ux` | Target role of the demand. |
| Level | 职级要求 | `junior` / `senior` / `lead` / `principal` | Minimum seniority required by the demand. |
| Skill | 技能要求 | `backend` / `frontend` / `project_management` / `business_analysis` / `testing` / `ui_design` | Fixed six-item skill catalog (`SkillCatalog`). |
| Maturity | 最低成熟度 | 1-5 | Minimum maturity required for each skill. |
| Headcount | 需求人数 | — | Places requested; must be greater than zero. |
| Confirmed count | 已确认人数 | — | Candidates confirmed for the demand; zero until change C lands. |
| Pending review count | 待审人数 | — | Recommendations awaiting final review; zero until change C lands. |
| Gap | 缺口 | — | `headcount - confirmed count`, recomputed on every read. |
| Roster | 已确认名单 | — | Read-only list of confirmed candidates: name, role, level, skill summary, arrival date, confirmation time. |
| Arrival date | 到岗时间 | — | Required start date carried by the demand; roster rows reuse it. |
| Travel band | 出差时长档位 | `short` / `two_months` / `half_year` / `long` | Travel duration category; required together with months per year when travel is required. |
| Travel months per year | 每年可出差月数 | — | Positive integer; present only when travel is required. |
| Demand status | 需求状态 | `draft` / `active` / `closed` | Lifecycle: draft to active to closed (terminal). |
| Project status | 项目状态 | `active` / `ended` | Project lifecycle state. |
| Candidate | 候选人 | — | Internal employee record: role type, level, skills with maturity, base location, availability window, travel willingness, active/inactive status. |
| Candidate status | 档案状态 | `active` / `inactive` | Inactive candidates never enter screening results or new recommendations. |
| Travel willingness | 出差意愿 | — | Whether the candidate accepts travel, the accepted duration bands and the maximum months per year. |
| Travel review status | 复审状态 | `valid` / `expired` / `unknown` | Derived from the latest review date; due date = review date + 6 months; expired and unknown never count as willing. |
| Cross-role fill | 跨角色补位 | — | When the demand role has no qualified candidate, another role may fill it if one level higher and one skill in the target role domain reaches Practitioner (3). |
| Score | 评分 | — | Σ(demand skill score × candidate maturity level) for qualified candidates; excluded candidates are not scored. |
| Max score | 满分 | — | Σ(skill score × 5) of the demand. |
| Recommendation threshold | 推荐阈值 | — | Positive integer, 0 < threshold ≤ max score; total ≥ threshold is `recommend`, otherwise `hold`. |
| Verdict | 推荐标记 | `recommend` / `hold` | Advisory only; never blocks submission or changes the recommendation state machine. |
| Score snapshot | 评分快照 | — | Total, threshold, max, verdict and per-skill items captured at submission; never recalculated afterwards. |
| Recommendation status | 推荐状态 | `pending_review` / `confirmed` / `rejected` / `withdrawn` / `released` | Only confirmed recommendations enter the roster. |
| Release request | 释放申请 | — | Coordinator-initiated; the person stays on the roster until the project owner confirms the release. |
| Notification | 通知事件 | `recommendation_submitted` / `rejected` / `demand_changed` / `confirmed` / `released` / `release_requested` / `review_reminder` | Outbox record with `sent` or `failed` status; failures never block the business operation. |

## Invariants

- Gap equals headcount minus confirmed count; counts are recomputed on read, never cached.
- Headcount must be greater than zero and, on change, must not fall below the confirmed count.
- Required skills: at least one, no duplicates, each maturity between 1 and 5.
- Travel: when required, band and months per year (positive) must be present; when not required, both must be absent.
- Closed demands are terminal: no edits, no reactivation; create a new demand instead.
- Project end date must not precede its start date.
- Visibility is enforced in the service layer: project owners by project ownership, coordinators by `owner_coordinator_id`. The UI only hides data; it is not the security boundary.
- Inactive candidates are excluded from the default candidate list, screening results and new recommendations; deactivation is refused while a pending or confirmed recommendation exists.
- Cross-role fill requires the demand role to have no qualified candidate, a candidate one level higher, and a skill in the target role domain at maturity ≥ 3; Principal demands have no cross-role candidates.
- Skill scores are positive integers; the threshold must satisfy 0 < threshold ≤ Σ(skill score × 5).
- The score snapshot is written once at submission and never recalculated after demand or candidate changes.
- A confirmed recommendation leaves the roster only after the project owner confirms the release; a coordinator request alone does not change counts.
- Notification failures are recorded as `failed` and never roll back the business operation; reminders are idempotent per candidate and review cycle.

## Sources

- `openspec/changes/add-demand-and-roster/specs/demand-management/spec.md`
- `openspec/changes/add-demand-and-roster/specs/roster-and-gap/spec.md`
- `openspec/changes/add-candidate-pool-and-screening/specs/candidate-profile/spec.md`
- `openspec/changes/add-candidate-pool-and-screening/specs/candidate-screening/spec.md`
- `openspec/changes/add-recommendation-review-and-notification/specs/recommendation-review/spec.md`
- `openspec/changes/add-recommendation-review-and-notification/specs/notification/spec.md`
- `openspec/changes/add-role-scoring-and-threshold/specs/demand-management/spec.md`
- `requirement-workspace/requirements/REQ-001-demand-management.md`
- `requirement-workspace/requirements/REQ-002-candidate-profile.md`
- `requirement-workspace/requirements/REQ-003-candidate-screening.md`
- `requirement-workspace/requirements/REQ-005-recommendation-review.md`
- `requirement-workspace/requirements/REQ-006-roster-and-gap.md`
- `requirement-workspace/requirements/REQ-007-email-notification.md`
- `requirement-workspace/requirements/REQ-008-role-scoring-and-threshold.md`
