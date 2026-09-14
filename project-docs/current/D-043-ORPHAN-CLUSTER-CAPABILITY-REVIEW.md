# D-043 — ReportCard / localVault / photo annotation: bounded capability review

**§284. A review only.** Nothing in this cluster was deleted, migrated, reconnected or modified.
The decision at the end is a recommendation for the product owner, not an action taken.

---

## 1. The exact orphan cluster

Computed the same way §281's D-038 fixpoint was: a module belongs to the cluster when every file
that imports it also belongs to the cluster. **Eight files, 1,599 lines.**

| file | lines | inbound edges | from |
|---|---|---|---|
| `components/reports/ReportCard.tsx` | 261 | **0** | — |
| `lib/localVault.ts` | 47 | **0** | — |
| `lib/offlineQueue.ts` | 50 | 1 | `lib/localVault.ts` (itself an orphan) |
| `components/evidence/AnnotationEditor.tsx` | 800 | 1 | `AnnotationShapeRenderer.tsx` — **a type-only back-import of `DragMode`, from a module `AnnotationEditor` itself imports.** A cycle inside the cluster, not a consumer |
| `components/evidence/AnnotationShapeRenderer.tsx` | 200 | 1 | `AnnotationEditor.tsx` |
| `components/evidence/AnnotationToolbar.tsx` | 63 | 1 | `AnnotationEditor.tsx` |
| `components/evidence/AnnotationEditorFooter.tsx` | 28 | 1 | `AnnotationEditor.tsx` |
| `components/evidence/AnnotationPreview.tsx` | 150 | 2 | `AnnotationEditor.tsx` and `ReportCard.tsx` — both orphans |

**The cluster is larger than D-043 described it.** §281 recorded two zero-importer modules keeping
five annotation modules alive *through `ReportCard`*. In fact `AnnotationEditor` — the 800-line
editor, the largest single file here — has **no real consumer at all**: its only inbound edge is a
type import from a module it itself imports. Nothing outside this set reaches any of it. The
annotation subtree is not merely held up by `ReportCard`; it is independently unreachable.

## 2. What `ReportCard` provides

A presentational card for one report: title, site, date, status, a finding count, a severity
badge, and — the part that matters — it renders each finding's evidence photo through
`AnnotationPreview`, so the annotated version is what appears on the card.

It is **the only module in the tree that renders an annotated photo.** That is capability **C-6**
in the D-038 proof and it remains true.

## 3. What `localVault` provides

47 lines returning a `LocalVaultStatus`: `encryptedStorageEnabled` (which is only
`!!window.crypto?.subtle` — a *capability* probe, not a statement that anything is encrypted),
`localReportCount`, `pendingSyncCount`, `failedSyncCount`, `storageMode` and `lastLocalSave`. It
composes `lib/reportStorage` and `lib/offlineQueue`.

It is a **status reporter with no UI**. Nothing renders it. It is the same class of module as the
device-local stores §281 found the dashboard reading from — the read side of a write path the
active workflow does not use.

## 4. The photo-annotation capability, exactly

`AnnotationEditor` (800 lines) is a genuinely complete, touch-capable image annotation tool:

- five shape types — `rect`, `circle`, `arrow`, freehand `draw`, and `text`
- an eight-colour palette, adjustable text size
- select / move / resize existing shapes, arrow endpoints draggable independently
- undo **and** redo
- zoom and pan, with an expanded mode
- coordinates stored **normalised to 0–1** against a `4:3` viewBox, so a shape survives being
  rendered at any size — which is a genuinely good design decision and the reason
  `AnnotationPreview` can re-render the same shapes in a card at a different scale

`AnnotationPreview` (150 lines) is the read-only renderer: an `<img>` with an SVG overlay.

## 5. Does any active workflow provide equivalent annotation?

**No. There is none, anywhere.**

The active workflow's evidence path is `evidenceFile: File → uploadInspectionEvidence()` — a plain
photo attachment. `lib/offline/fieldCaptureStore.ts` and `fieldCaptureSync.ts` carry photos
offline and sync them; neither mentions annotation.

**And the server has no annotation concept at all.** Every occurrence of "annotation" in
`backend/src` is standards-authority annotation (`finding-standards-authority-annotation.ts`) or
prose — unrelated. There is no column, no DTO, no storage field, and no route that accepts or
returns annotation shapes.

That is the decisive fact for question 7. Annotations in this cluster were **never persisted through
the API**. `ReportCard` rendered them from a client-side report object held in device-local storage —
the same store family the active workflow abandoned.

## 6. Is the capability useful for v1 field inspections?

**Yes, genuinely — and it is the strongest argument in this cluster.** "Circle the missing guard"
is how safety professionals actually communicate a hazard in a photograph, and an arrow on the
nip point carries more than a paragraph. For a report a client reads, an annotated photo is
materially better evidence than a bare one.

This is not a nostalgic capability. It is a real gap in the active product.

## 7. Cost of migrating ONLY photo annotation

**It is not a component move. It is a feature.** The client half already exists and is good; the
half that does not exist is everything that makes an annotation durable:

| work | why it is needed | rough size |
|---|---|---|
| A persistence contract for shapes | the server has no concept of them today | new DTO + validation + a migration |
| Attaching shapes to stored evidence | `uploadInspectionEvidence` returns a stored object; shapes must bind to it and survive re-upload | server + client |
| Report rendering | the generated report is server-composed; an annotated photo has to reach it, which is an image-composition or SVG-overlay decision in the report pipeline | the largest unknown |
| Offline capture | `fieldCaptureStore` would have to carry shapes and `fieldCaptureSync` reconcile them — and D-042 is open, so the interrupted-sync semantics for them are undefined | blocked by D-042 |
| Authority | who may edit an annotation after a finding is reviewed, and does editing one change the finding | a product decision, not an implementation |

The 1,241 lines of editor and renderer are perhaps a third of the work, and the cheapest third.
**A migration that moved only the components would produce annotations that exist on one device and
appear in no report** — which is precisely the class of defect §276 (D-007) and §281 (D-041)
were about: a write path and a read path that never meet.

## 8. Does `localVault` contain useful offline architecture for D-037?

**Almost nothing, and what it does contain is the wrong shape.**

- `offlineQueue` is a single **device-global** `localStorage` key (`sentinel_offline_queue_v1`) with
  no account namespace. That is the exact cross-account leak class `V1-OFFLINE-ISO-01` closed, and
  it is why `clearAuthSession()` still sweeps those keys even though the writer is gone.
- It has no retry policy, no conflict handling, no idempotency key, no ordering guarantee and no
  partial-failure model — so it answers none of the questions D-042 actually asks.
- The v1 offline store (`lib/offline/`) is already strictly better: per-user IndexedDB, namespaced
  by a derived account identity, unreachable without the signed-in account.

The one idea worth keeping is conceptual and already understood: a status surface that
distinguishes *pending* from *failed*. §281's five-state `dataState` vocabulary expresses it better.

## 9. Does retaining the cluster create debt or duplicate authority?

**Yes, on both counts, and one of them is the dangerous kind.**

- **Duplicate authority.** `localVault` + `offlineQueue` are a second offline model sitting beside
  `lib/offline/`. Two offline stores with different isolation guarantees is exactly the shape that
  produced the device-global leak in the first place, and the weaker one is the one a future
  contributor will find first because it is simpler.
- **Dead-code debt.** 1,599 lines that typecheck, lint, build and are audited on every gate run
  while being unreachable — already registered as `TRACKED_DEAD_CODE` (P2).
- **A false signal.** `encryptedStorageEnabled` returns whether the browser *has* WebCrypto. Read
  by anyone at face value it says the product encrypts local storage. It does not.

---

## Recommendation

# B. MIGRATE_PHOTO_ANNOTATION_ONLY

...with an explicit and load-bearing condition, because on the evidence the two halves of this
cluster deserve opposite answers:

**Retire `localVault` and `offlineQueue` outright.** They are duplicate authority over offline
state, weaker than the store that replaced them, carry a device-global key with no account
namespace, and one of their fields reads as a security claim the product cannot make. Nothing is
lost. (`clearAuthSession()`'s sweep of their keys must **stay** — devices that ran earlier builds
still hold what they wrote, as `lib/auth.ts` already records.)

**Retain photo annotation — but as a scheduled feature with server support, not as a component
move.** The capability is real, it is well built, it is the only one of its kind in the tree, and
an annotated photo is materially better inspection evidence. It is also, today, unreachable and
unpersistable, and moving the components alone would ship annotations that reach no report.

**Retire `ReportCard` itself.** It is a card for a report model the active workflow does not
produce. Its annotation-rendering role is `AnnotationPreview`'s, which survives on its own.

So the bounded shape, if the product owner accepts it:

1. **Now:** nothing. This section deletes nothing.
2. **Next:** retire `ReportCard`, `localVault`, `offlineQueue` (3 files, 358 lines) under the
   D-038 fixpoint method, keeping the sign-out key sweep.
3. **Scheduled:** photo annotation as a feature — persistence contract, report rendering, offline
   capture — sequenced **after D-042**, because its offline half is undefined until D-042 is.
   `AnnotationEditor`, `AnnotationPreview`, `AnnotationToolbar`, `AnnotationEditorFooter` and
   `AnnotationShapeRenderer` (5 files, 1,241 lines) are **retained unmodified** until then, as the
   starting point.

If the product owner does not intend to schedule photo annotation in a foreseeable release, then
the honest answer is **A. RETIRE_ALL** — retaining 1,241 lines of unreachable UI against a feature
nobody has committed to is the debt this recommendation is trying to avoid, not create. The choice
between B and A is a roadmap decision and it is the product owner's.

**Not recommended: C or D.** C (migrate bounded capabilities) has no second capability worth
migrating — `localVault` is the only other thing here and it should be retired. D (retain for v1)
keeps the duplicate offline authority alive through a release, which is the one outcome with a
concrete downside and no upside.
