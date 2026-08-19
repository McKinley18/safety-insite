# Schema fingerprint report

Canonical reference fingerprint: `fba77f2a0b69e14b1e294e1107c980a6a74d93bfc8ce74c8fa6070be0c2ae393`.

Compatible cloned legacy fingerprint matched exactly and adopted 22/22 records.

Development fingerprint: `66534abf3c2a0268f367e70e448c2a185dea5018235b2c747bb9dff1457aca9e`. Result: REJECTED with 436 catalog differences. It lacks 18 canonical tables including reports, inspections, actions and audit records; it has five extra SafeScope knowledge tables; and it contains extensive column/index/constraint drift.

No development migration history or business data was modified. Forward reconciliation cannot safely be designed until the canonical inclusion and ownership model for the extra knowledge tables is decided.
