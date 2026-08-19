# Data-flow trace

`SafescopeV2Service` composes observation-wide understanding and finding/scenario intelligence, then invokes corrective-action reasoning. Before this fix, the brain's optional observation-understanding branch could win over the finding's `hazardDomain`. The corrected order is:

`finding hazardDomain/category/candidate family` → explicit corrective-action family context → only then optional observation understanding → narrative projection.

No array-index association, persistence, report, authorization, or frontend finding identity code was changed.
