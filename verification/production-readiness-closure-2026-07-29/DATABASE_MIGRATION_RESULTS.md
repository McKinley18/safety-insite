# Database and Migration Results

- Disposable clean database: `closure_20260729_clean`.
- Fresh canonical migration execution: 26/26.
- Original `safescope` database: not modified.
- Fresh logical legacy clones: `phase6_legacy_closure_a`, `phase6_legacy_closure_b`.
- Fresh canonical adoption targets: `phase6_adopt_closure_a`, `phase6_adopt_closure_b`.
- Source: 47 conserved rows, zero migration records.
- Each target: 26 legitimate migration records, 47 adopted rows, five memberships, zero quarantines and zero checked orphans.
- Both targets have schema fingerprint `96e024e691686754bac4ad9b197f71e7b2d192da7e17cd4da6f2ab4bd3414ba0`.
- Both targets have canonical content fingerprint `e34b3286658d0dcbb16c992486ec16c90bf8b109ce36837755acee9e6609e67d`.
- Source schema fingerprint: `30c58d2c64af80416371de01431b04af230f4012385844dce45b726d543482be`.
- Source content fingerprint: `df08afb03fa16cfc8a8f65be145ae028d1292b63d50e180a33e81c53e355e2f9`.

An earlier verification against previously reused adoption databases correctly failed because later tests had polluted them. Fresh clones passed deterministically, demonstrating why adoption targets must be immutable during proof.
