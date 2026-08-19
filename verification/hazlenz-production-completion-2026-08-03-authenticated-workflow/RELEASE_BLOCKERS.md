# Release blockers

1. **Critical — authenticated workflow incomplete:** clarification/reanalysis, risk override, corrective actions, finalization, reports, and authorization are not proven end-to-end.
2. **High — offline synchronization unverified:** localStorage helpers exist, but durable reconnect, exactly-once behavior, conflicts, and auth recovery are not established.
3. **High — frontend lint debt:** 500 errors and 115 warnings remain; production-reachable errors are unresolved.
4. **High — accessibility/mobile/theme gates incomplete:** keyboard, automated accessibility, contrast, zoom, and dark-mode workflow evidence is missing.
5. **High — live object storage unavailable:** no valid non-local credentials for real provider operations.
6. **Medium — performance thresholds incomplete:** no complete bounded production-path study.
7. **Regulatory review dependency:** 129 imported records remain pending review; definitive release remains limited to 19 governed standards.
