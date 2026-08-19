# Network/API evidence

The canonical UI issued, for each scenario, `GET /inspections/:id` (200), `POST /inspections/:id/observations` (201), `POST /safescope-v2/classify` (201), `POST /inspections/observations/:id/analyses` (201), finding-review POSTs, transition POSTs, action/task POSTs, and `POST /inspections/:id/reports`. The browser-visible result was loaded from the subsequent persisted inspection response, not a client-only fixture.
