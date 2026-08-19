# Offline architecture

The frontend contains localStorage-backed offline inspection, finding, photo, report-draft, and queued-operation helpers (`frontend-next/lib/offline*`). No service-worker or IndexedDB implementation was found in the inspected frontend tree. Durable reconnect, idempotency, retry, conflict, quota, and authentication recovery behavior are not proven.
