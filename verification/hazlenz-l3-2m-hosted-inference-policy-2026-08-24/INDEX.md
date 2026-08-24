# L3-2m — evidence index

`HOSTED_INFERENCE_AUTHORIZED_IN_PRINCIPLE` · `L3_FINAL_ACCEPTANCE_BLOCKED — STABLE_PROVIDER_MODEL_IDENTITY_REQUIRED`
blueprint **§45** · decisions **`D-66`**, **`D-67`** · HEAD `1feda622` · **zero inference, zero production change**

| file | what it is |
|---|---|
| `STATUS.md` | the programme decision, why the acceptance run is still blocked, the model-identity dilemma, the data-handling gap, and the terminal state |
| `NEXT_ACTION.md` | what is settled so it is not re-derived, and the exact next action — provider qualification, not engineering |
| `provider/GEMINI_MODEL_CATALOGUE.json` | **the deliverable.** The provider's own `GET /v1beta/models` response reduced to identity metadata: 50 models, 37 supporting `generateContent`, the three that assert stability, every 3.x Pro text model with its preview version string, the unpinnable rolling aliases, and the full name/version/method catalogue so no future phase need re-probe |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, 23 tag objects, 4 untouched stashes, all 19 module digests, `backend/src` proven free of any hosted reference, sealed corpus hash-verified and unopened, presence-and-length-class-only credential audit, and a **1-request / 0-inference** egress account |

**Nothing implemented. Zero inference calls — one metadata request carrying the credential header and
no content. No production file, prompt, schema, binder, scorer or harness touched. No new holdout. No
sealed corpus opened. No provider or model selected. `GEMINI_MODEL` not substituted.**
