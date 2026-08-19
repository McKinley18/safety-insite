# Authorization

An owner authenticated request could retrieve all three inspections and download the owner report (HTTP 200, PDF bytes 3687 for report `e7d8aa32-bdb5-4c2a-95ab-b44c5d5093e2`). A separately registered foreign user received HTTP 404 `Inspection not found.` for the protected inspection and HTTP 404 for the report download and attempted transition. No foreign data was disclosed and no mutation occurred.
