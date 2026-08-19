# Open decisions

No fundamental domain, ownership, collaboration, persistence, or authorization question remains open.

The following require external information:

| Decision | Needed from | Deadline/blocking effect |
|---|---|---|
| S3-compatible provider, region, bucket, encryption/key policy | hosting/business/security | blocks private-file production verification and pilot |
| Final legal retention/deletion schedule for inspections, reports, evidence, audit logs | legal/privacy | blocks automated purge and public production; pilot may archive without purge under written interim policy |
| Production email provider account/domain credentials and monitored sender | operations | blocks pilot password-reset delivery |
| Render/hosting memory and CPU tier validated against HazLenz/PDF measurements | operations | blocks pilot if current envelope is insufficient |
| Commercial price IDs, pricing, taxes, refunds, grandfathering | business/billing | blocks public paid launch, not explicit pilot grants |
| Malware-scanning provider/process | security/operations | required before public production; restricted pilot requires quarantine/manual response plan |
| Public registration policy after pilot | product/legal | deferred; pilot is invite-only |

Default until decided: private bucket, US region if contractually acceptable, provider-managed encryption, no automated safety-record purge, invite-only pilot, and no public billing launch. These defaults do not authorize launch without owner approval.
