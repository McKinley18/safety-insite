# Canonical Adoption Contract

| Legacy family | Canonical disposition | Required invariant |
|---|---|---|
| `organization` | Direct copy | UUID identity preserved |
| `user` | Normalize and copy | unique lowercase email, exactly one usable credential, valid explicit organization |
| `standards_master` | Normalize and copy | unique agency/citation identity; legacy `allowed_use` normalized to documented `reference` |
| knowledge documents | Copy with type normalization | provenance and IDs preserved |
| knowledge chunks | Copy after parent | every document parent exists |
| knowledge source/run/log | Copy if present | parent references valid |
| subscriptions | Copy if present | referenced user exists |
| membership | Derived only from explicit legacy `user.organizationId` | no inferred organization |
| reports/files | Canonical tables remain empty unless a deterministic source record exists | ambiguous paths quarantine; never grant access |
| sites/inspections/findings/actions/tasks | Canonical tables remain empty when absent from source | no fabricated business records |
| unknown tables | Refuse adoption | explicit contract extension required |

Source rows are untouched. Every adopted row receives a source hash and mapping record. Ambiguous rows are quarantined only where the contract defines a safe quarantine; required ownership ambiguity is a hard refusal.

The target must be an empty, fully migrated canonical database with migration `1800000003000` recorded legitimately. Migration rows are never copied or inserted by the adoption command.

