# Dependency Reachability

## Backend

After compatible updates: 0 critical, 0 high, 4 moderate.

Resolved compatible chains include Multer, Express/body-parser/qs, and file-type. Installed examples: Multer 2.2.0, Express 4.22.2, body-parser 1.20.6, qs 6.15.3, file-type 21.3.2.

Remaining:

- `@nestjs/core` 10.4.22: moderate injection advisory.
- `@nestjs/platform-express` 10.4.22: affected through Nest core.
- `@nestjs/typeorm` 10.0.2: affected through Nest core and bundled `uuid` 9.
- transitive `uuid` 9.0.1: buffer-bound advisory affects v3/v5/v6 calls with a supplied buffer.

The application does not intentionally call the affected transitive UUID buffer APIs. The Nest core advisory is runtime-reachable framework code and cannot be dismissed. npm offers Nest 11 fixes as semver-major, which was explicitly out of scope. Required next action: isolated NestJS 11 compatibility branch or documented security acceptance with compensating input/output controls.

## Frontend

Production-only npm audit: 0 vulnerabilities. Compatible PostCSS, Sharp, and DOMPurify overrides were installed and the production build passed.

No `npm audit fix --force` or broad framework migration was used.

