# Adoption Refusal Cases

Verified refusal:

- Conflicting non-null credential fields for one source user.
- Non-empty canonical target.
- Source and target identity equality.
- Missing canonical migration/provenance contract.
- Unsupported source-table contract.
- Missing required parent relationships and orphan checks are implemented in preflight.

The first ambiguous-credential fixture accidentally nulled one credential and was correctly considered unambiguous. The fixture was corrected to provide two different non-null credentials; the command then refused it. This failed fixture setup is retained as test evidence, not reported as a product failure.

