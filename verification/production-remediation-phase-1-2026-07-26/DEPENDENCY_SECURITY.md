# Dependency security

Backend before: 14 total (4 high, 10 moderate). After patching Axios to 1.18 and TypeORM to 0.3.31: 12 total (3 high, 9 moderate). Remaining high issues are in Nest 10’s platform-express/transitive Multer chain and require a planned Nest 11 major upgrade.

Frontend before: 4 production findings (3 high, 1 low). Next and eslint-config-next were patch-upgraded 16.2.6 → 16.2.12. After: 4 production findings (3 high, 1 low); unresolved advisories are Next’s bundled PostCSS/Sharp and jsPDF’s DOMPurify. No safe current patch clears them.

No force upgrade was used. Major framework migration is deferred with upload size/rate/type controls as temporary risk reduction.
