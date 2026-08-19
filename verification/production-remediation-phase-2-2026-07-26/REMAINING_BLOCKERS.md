# Remaining blockers

1. Development schema is incompatible with canonical reference (436 differences); baseline adoption correctly refuses it. Blocks pilot/public.
2. Complete authorization semantics and A/B route coverage are unresolved, especially review/knowledge/admin/files. Blocks pilot/public.
3. Production reset provider configuration is implemented but no target account/configuration delivery was verified. Blocks pilot.
4. Durable authenticated inspection → HazLenz → report → action/calendar workflow is not executable against the canonical schema. Blocks pilot/public.
5. Release gate is not green/reproducible. Blocks pilot.
6. Static uploads lack tenant-authorized retrieval. Blocks pilot for sensitive evidence.
7. Remaining high dependencies, memory, report transactions and operational controls block public production.
