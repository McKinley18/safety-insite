# Published legal documents

**This directory is the publication source. `project-docs/legal/` is not.**

That separation is the whole point, and it is the property §308 needed most: the drafts in
`project-docs/legal/` carry `LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`, and no code path
anywhere reads them. A document becomes publishable only by being placed here **and** enumerated in
`backend/src/legal/legal-document-registry.ts` with an exact version, effective date, publication
state and content digest. There is no directory scan, no "latest file", and no way for a file
appearing on disk to become customer-facing on its own.

## What is here today

`test-fixtures/` — synthetic fixtures whose bodies begin `TEST TERMS — NOT A LEGAL DOCUMENT` and
`TEST PRIVACY — NOT A LEGAL DOCUMENT`. They exist to exercise the ACTIVE path in tests and they
cannot load in production: `legalTestFixturesEnabled()` returns false whenever `NODE_ENV` is
`production`, regardless of any environment variable, and `validateProductionEnvironment()` refuses
to boot if the fixture flag is set there at all.

**No counsel-approved document exists yet**, so the production registry is empty and `/terms` and
`/privacy` render the bounded pre-publication state. That is the correct state, not a gap.

## Publishing an approved document

1. Counsel approves an exact document body.
2. Place that exact body here as `<type>-<version>.md`.
3. Add a registry entry naming the type, version, title, effective date, state, source file,
   approval record and the sha256 of the body.
4. `npm run check:legal-documents` recomputes the digest from the file and refuses if it differs.

Step 4 is what makes step 3 honest: an edit to a published body without a new version fails the
gate and refuses to boot, so an accepted version can never be mutated underneath the people who
accepted it.
