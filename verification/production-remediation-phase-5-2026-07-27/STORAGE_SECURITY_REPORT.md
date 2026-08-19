# Storage security report

- Backend-generated UUID keys; client filenames never become keys.
- Metadata `objectKey` is `select:false`.
- Evidence allowlist: JPEG, PNG, WEBP; report allowlist: PDF.
- Limits: branding 2 MiB, evidence 10 MiB, reports 25 MiB.
- Existing signature validation rejects spoofed MIME, SVG/HTML active content, empty files, traversal names, and unsupported formats.
- Retrieval uses authenticated backend streaming with `Content-Disposition: attachment`, `nosniff`, and restrictive CSP.
- Parent inspection/observation or canonical tenant scope is re-authorized on each read.
- Cross-user report download returned 404.
- Local provider traversal and production-mode activation were rejected.
- `/uploads` is no longer served statically.

Audit actions include upload completion, retrieval, authorization failure, deletion, and report generation. Upload initiation is represented by the durable `uploading` record; completion/failure changes state.

Residual: antivirus scanning is not implemented; raster signature validation and active-content denial are the current control.
