# Upload security remediation

P-002 root cause was trust in client MIME/extension plus same-origin static serving, including SVG.

Both logo and report evidence paths now accept only JPEG, PNG, and WebP; hold data in memory until signature validation; enforce 2 MiB/10 MiB limits; generate UUID filenames; and never persist the original path/name. SVG, HTML, GIF, empty, mismatched and renamed active content are rejected. Static upload responses use `Content-Disposition: attachment`, `nosniff`, and a sandbox CSP.

`test:upload-security` passed valid JPEG/PNG and rejected spoofed MIME, renamed scripted SVG, HTML-as-JPEG, traversal-style SVG name, unsupported GIF, and empty input. Multer enforces oversized-file rejection.

Residual: the Nest 10 transitive Multer version remains vulnerable to upload DoS and requires the planned Nest 11 upgrade. Uploaded-file lifecycle cleanup and external object storage remain unresolved.
