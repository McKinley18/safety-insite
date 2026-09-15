# §303 — live production proof of SE-5 closure

Backend `9242d157043cfab328c4d23cd3a7dcaf2804c635` on Render (`dep-daktbqjm8hqs73ekf2qg`), frontend
the same SHA on Vercel (`dpl_EDDwufhSwuJ6HG1Ji2WsKsAB4XDh`, production target, aliased to
`safety-insite.vercel.app`). `GET /health` read back the deployed commit **five consecutive times**
before anything was created — §297's rule, and §301's OPS-2 lesson, both applied. Synthetic account
credentials were written to disk **before** the account was created, not after.

Everything below went through the real authenticated production HTTP product path. **0 provider
calls, 0 Expert executions, 0 direct production DB writes, 0 charges, $0.**

## Boundary check, run before any account existed

```
unauthenticated GET /files/not-a-uuid -> 401  {"message":"No token provided", ...}
```

**401, not 400.** The pipe runs after the guard, so an anonymous caller still cannot use the shape
of the refusal to tell a real route from a fabricated one. The repair did not move the security
boundary.

## A — malformed identifiers are now bounded 400s, across the whole family

All authenticated. Every one previously produced, or belonged to a route that produced, a 500.

```
400  /files/not-a-uuid
400  /sites/not-a-uuid
400  /inspections/not-a-uuid
400  /inspection-reports/not-a-uuid
400  /inspections/not-a-uuid/report
400  /inspections/not-a-uuid/completion-readiness
400  /inspection-reports/not-a-uuid/download
400  /inspection-reports/not-a-uuid/revisions
400  /files/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx     (right shape, non-hex)
400  /files/d8a5808e-de40-4f9a-ae8e-d5a76067a5d      (one character short)
400  /files/<5000 characters>
400  /files/%2e%2e%2fnot-a-uuid                      (percent-encoded traversal)
400  /files/%20                                      (a space)
400  /files/%3Bdrop   /files/a%27b   /files/1--2     (SQL metacharacters)
```

All bodies identical: `{"message":"The identifier in the request path is not valid.","error":"Bad
Request","statusCode":400}` — no SQL, no driver name, no schema, no stack, and **no echo of the
caller's input**.

### One shape never reached the application, and that is worth stating rather than claiming

`/files/1%27%20OR%20%271%27%3D%271` returned **403 with an HTML body and `server: cloudflare`**. That
is the **edge WAF in front of Render** refusing the classic `1' OR '1'='1` pattern before the request
reaches the product. It is containment at a different layer and it is **not** evidence about the
§303 repair. The application-level claim for SQL metacharacters rests on `a%27b`, `%3Bdrop` and
`1--2`, which *do* reach the application and return the product's 400. The disposable-database suite
exercises the full `1' OR '1'='1` string with no edge in the path, and it returns 400 there.

## B — a syntactically valid identifier that names nothing is still 404

```
404  /files/bc13bfd2-…   {"message":"File not found."}
404  /sites/bc13bfd2-…   {"message":"Site not found."}
404  /inspections/…      {"message":"Inspection not found."}
404  /inspection-reports/… {"message":"Report not found."}
404  /files/<UPPERCASE uuid>  — valid syntax, accepted, NOT rejected as malformed
```

The 404 contract is intact and uppercase hexadecimal is not a new client-facing failure.

## C — the legitimate path is unchanged

```
POST /sites {"name":"S303 Proof Site"}      -> created, id 2f1a0faf-4258-4536-af89-d1544ad5a5e1
GET  /sites/2f1a0faf-4258-4536-af89-d1544ad5a5e1 -> 200, the real record
GET  /sites                                  -> 200 {"data":[…],"meta":{…}}
```

A real UUID on a repaired route returns the resource. The repair changes *when a query runs*, not
what an existing answer means.

## D — monitoring did not move

`GET /health/ready` `monitoring.serverErrorsInWindow` read **0 before, 0 after, and 0 at the end**,
with `lastDelivery: null` throughout. **No `service.error_rate_exceeded` alert was raised, because
no server error was produced.**

This is the measurement that closes the loop on §297B. Six genuine 500s were observed on this path in
production, and five of them inside five minutes were what drove monitoring to the product owner's
phone. The same probes now produce none. §303 manufactured **no** new 500s to prove monitoring still
works — that would have been the wrong kind of evidence, and §303 forbade it.

## Cleanup, via the product path, after all proofs

```
DELETE /sites/2f1a0faf-…  -> 200
DELETE /auth/me           -> 200  {"message":"Account deleted successfully"}
login with the same credentials -> 401  {"message":"Invalid credentials"}
```

No direct database access was used, at any point, for creation, proof or removal.

## What this proof does NOT establish

* `SE-6` is untouched and still returns 500 in production for every invite token. It was registered,
  not repaired.
* The 403 above is the Cloudflare edge, not the product. Nothing here should be read as the product
  having a WAF of its own.
* The proof exercised GET routes. The repair is attached to the 25 parameters compared against a
  `uuid` column across four controllers; the 24 GET routes are what the suite enumerates and drives.
