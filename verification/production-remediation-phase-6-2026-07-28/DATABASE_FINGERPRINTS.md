# Database Fingerprints

- Original inventory schema: `5c63114074834349c7cdbc0a206d23ad8e4e75acea7aaa85fda07ec0bc382bf2`
- Adoption source schema contract: `30c58d2c64af80416371de01431b04af230f4012385844dce45b726d543482be`
- Adoption source content: `df08afb03fa16cfc8a8f65be145ae028d1292b63d50e180a33e81c53e355e2f9`
- Adopted normalized schema: `96e024e691686754bac4ad9b197f71e7b2d192da7e17cd4da6f2ab4bd3414ba0`
- Adopted canonical content: `e34b3286658d0dcbb16c992486ec16c90bf8b109ce36837755acee9e6609e67d`

Adopt A, Adopt B, and the adopted restore matched. Expected differences from an empty canonical database are the 47 preserved source rows, 5 explicit memberships, and adoption provenance.

The clean database finished at 26 migrations and five `safescope_knowledge_*` tables.

