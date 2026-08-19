# Authorization

Reviewer-candidate mutations (approve, reject, request information, block, archive) now require `SUPER_ADMIN` or `PLATFORM_ADMIN` at the route. Actor identity and administrator role are derived from the JWT; caller-supplied reviewer identity is ignored. Read-only review access retains its existing scoped policy.

Canonical workflow cross-user denials: 4/4. Mass-assignment rejection passed. Further explicit regression coverage for the newly tightened reviewer routes is still required.

