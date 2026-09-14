# D-043 — photo annotation: the design worth keeping, preserved before the cluster is retired

**§285. Preservation only.** Nothing was migrated, implemented or deleted. The product owner
accepted **B — MIGRATE_PHOTO_ANNOTATION_ONLY**, directed that the migration NOT happen in §285, and
directed that the useful design be preserved and scheduled in the Pre-Production Capability
Register. This is that preservation record: it exists so the orphan cluster can eventually be
retired without the thinking in it being lost with the files.

Source of record while it remains in the tree:
`components/evidence/AnnotationEditor.tsx` (800 lines), `AnnotationPreview.tsx` (150),
`AnnotationShapeRenderer.tsx` (200), `AnnotationToolbar.tsx` (63), `AnnotationEditorFooter.tsx` (28).

---

## 1. The one design decision that must survive: normalised geometry

Every shape is stored in **0–1 coordinates against a `4:3` viewBox**, not in pixels:

```ts
export type AnnotationShape = {
  type: "rect" | "circle" | "arrow" | "draw" | "text";
  x: number; y: number;              // 0..1, fraction of the image
  width?: number; height?: number;   // 0..1
  radius?: number;                   // 0..1
  x2?: number; y2?: number;          // 0..1, arrow terminus
  color: string; text?: string; fontSize?: number;  // fontSize also 0..1-relative
};
// freehand adds: points: { x: number; y: number }[]   // each 0..1
```

**Why it matters and why it is not incidental.** The same shape data renders correctly in the
editor at phone width, in a card at thumbnail size, and in a report at print resolution, with no
re-projection and no stored image dimensions. `AnnotationPreview` is 150 lines precisely because
it does not have to know how big anything is:

```tsx
<img src={photoUrl} className="h-full w-full object-contain" />
<svg className="absolute inset-0 h-full w-full" viewBox="0 0 4 3" preserveAspectRatio="none">
```

A pixel-coordinate design would have needed the capture dimensions persisted beside every shape,
would drift on any re-encode or resize, and would make the report renderer responsible for scaling
geometry it did not create. **Keep this.** It is the difference between annotation being a data
type and annotation being a picture.

*(Note the one thing to re-examine on migration: `preserveAspectRatio="none"` against a fixed `4:3`
viewBox assumes the image is displayed at 4:3. A non-4:3 photo displayed with `object-contain` will
letterbox, and the overlay will not letterbox with it. This is a known edge to resolve, not a
reason to abandon the normalised model.)*

## 2. The capability, as built

| | |
|---|---|
| Shapes | rectangle, circle, arrow, freehand draw, text |
| Editing | select, move, resize; arrow endpoints draggable independently |
| History | undo **and** redo (`redoStack`) |
| View | zoom and pan, plus an `expanded` mode |
| Colour | eight-swatch palette, separate swatch state for text |
| Type size | adjustable, stored relative (`selectedFontSize` default `0.045`) |
| Input | built for touch as well as pointer |

`AnnotationEditor` is a **controlled component**: `{ photoUrl, annotations, onSave, onCancel,
expanded }`. It owns no persistence, fetches nothing, and hands the caller an array on save. That
shape is exactly right for migration — the component does not need to change to acquire a server.

## 3. The architecture the product owner specified, against what exists

> ORIGINAL PHOTO + ANNOTATION GEOMETRY + ANNOTATION AUTHOR + TIMESTAMP + PROVENANCE → ANNOTATED VIEW

| element | exists today | gap |
|---|---|---|
| Original photo | **yes** — `uploadInspectionEvidence` stores it; the editor never rewrites the image | none |
| Annotation geometry | **yes** — the type above | not persisted anywhere |
| Annotation author | **no** | needs `annotatedByUserId` |
| Timestamp | **no** | needs `annotatedAt`, and a revision if annotations may be edited |
| Provenance | **no** | needs to state that the annotation is a HUMAN mark, never HazLenz output |
| Annotated view | **yes** — `AnnotationPreview` | has no data to render |

**Non-destructive is already how it is built, and that is the second thing to keep.** The editor
returns shapes; it never composites onto the image and never re-encodes it. The original evidence
byte stream is untouched by design. The eventual persistence must not quietly undo that by storing
a flattened JPEG "for the report" — a composited image is a new artifact whose provenance is
neither the camera's nor the annotator's, and an inspector must always be able to see what the
lens saw.

## 4. What the migration still needs (from the §284 review, unchanged)

1. A persistence contract for shapes — DTO, validation, migration. **The server has no annotation
   concept at all today**: no column, no route, no field.
2. Binding to stored evidence that survives re-upload.
3. Report rendering — the generated PDF is server-composed, so an annotated photo has to reach it.
   `AnnotationPreview` is a React/SVG renderer and the PDF path is PDFKit; the shared asset is the
   **geometry**, not the component.
4. Offline capture and sync — `fieldCaptureStore` / `fieldCaptureSync` would have to carry shapes,
   and the interrupted-sync semantics for them are **undefined until D-042 is**.
5. Authority — may an annotation be edited after the finding is reviewed, and does editing one
   change the finding? A product decision, not an implementation detail.

**Sequence it after D-042.** Item 4 has no answer before then.

## 5. What is NOT accepted as v1 architecture

Recorded per the product-owner decision, so the retirement is not mistaken for a loss:

- **`localVault`** — its `encryptedStorageEnabled` is `!!window.crypto?.subtle`, a browser
  capability probe that reads as a claim that the product encrypts local storage. It does not.
- **`offlineQueue`** — a single **device-global** `localStorage` key (`sentinel_offline_queue_v1`)
  with no account namespace: the exact cross-account leak class `V1-OFFLINE-ISO-01` closed. No
  retry policy, no conflict handling, no idempotency, no ordering, no partial-failure model.
- **Device-global `localStorage` authority** in general. The v1 store (`lib/offline/`) is per-user
  IndexedDB namespaced by a derived account identity and is strictly better.

**One thing must survive their retirement:** `clearAuthSession()` still sweeps
`insite_offline_inspections_v1` and the other device-global keys. Devices that ran earlier builds
still hold what those writers wrote, and that content does not expire because the code did.
`lib/auth.ts` already records this; deleting the sweep with the writer would reopen the leak on
every device that has ever used the product.

## 6. Retirement order, when it is authorised

1. **`localVault`, `offlineQueue`, `ReportCard`** — retire. Nothing is lost; keep the sign-out sweep.
2. **The five annotation modules** — retain unmodified until the capability is scheduled. This
   document is the fallback if they are retired first.

**Neither step is authorised by §285, and neither was performed.**
