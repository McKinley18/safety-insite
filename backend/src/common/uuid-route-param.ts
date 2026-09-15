/**
 * §303 / SE-5 — THE ONE PLACE A UUID ROUTE PARAMETER IS VALIDATED.
 *
 * ==================== WHAT SE-5 WAS ====================
 *
 * An authenticated `GET /files/<malformed>` took the path parameter straight to a TypeORM lookup.
 * Postgres was asked to compare a non-UUID string against a `uuid` column, rejected it with
 * `invalid input syntax for type uuid`, and the unhandled driver error surfaced as HTTP 500.
 * Measured at §303 before the repair: EIGHT GET routes across FOUR controllers behaved this way,
 * and an authenticated caller could produce a genuine server error at will on any of them.
 *
 * ==================== WHY A SHARED CONSTANT AND NOT A REGEX PER CONTROLLER ====================
 *
 * §303 forbids scattering regex copies across controllers, and the reason is not tidiness: eight
 * copies of a shape rule drift, and the first one to drift is the one nobody tests. This is the
 * single primitive, it wraps the FRAMEWORK'S OWN `ParseUUIDPipe` rather than reimplementing UUID
 * syntax, and every affected parameter refers to this export.
 *
 * ==================== WHAT IT DELIBERATELY DOES NOT DO ====================
 *
 *   >>> IT DOES NOT CATCH DRIVER ERRORS. The repair is an INPUT BOUNDARY: malformed syntax is
 *   >>> rejected BEFORE any query runs. Turning `QueryFailedError` into a 400 after the fact would
 *   >>> convert genuine persistence failures — a dropped table, an exhausted pool, a broken
 *   >>> migration — into client errors, and the product would stop reporting its own outages.
 *   >>> §303 names this explicitly and the §303 suite drives a real database fault to prove a
 *   >>> genuine failure is still 5xx.
 *
 *   >>> IT IS NOT APPLIED TO EVERY `:id`. A parameter is not a UUID because it is called `id`.
 *   >>> `/auth/verify-invite/:token` carries an opaque token and `:version` is an integer; both
 *   >>> keep their own contracts. This is attached only to parameters that are genuinely compared
 *   >>> against a `uuid` column.
 *
 *   >>> IT DOES NOT MOVE THE SECURITY BOUNDARY. A pipe runs AFTER guards, so an unauthenticated
 *   >>> malformed request is still 401 and never 400 — an anonymous caller cannot use the shape of
 *   >>> the refusal to tell a real route from a fabricated one. The §303 suite asserts that
 *   >>> ordering directly.
 *
 * ==================== THE CONTRACT ====================
 *
 * Malformed syntax is a CLIENT error: 400, with the framework's generic
 * "Validation failed (uuid is expected)" — no SQL, no driver name, no database type detail, and no
 * echo of the caller's input. A syntactically VALID identifier that names nothing accessible keeps
 * whatever the route already returned, which is 404 on these routes; the repair changes when a
 * query runs, never what an existing answer means.
 *
 * Uppercase hexadecimal is valid UUID syntax and is accepted, because rejecting it would be a new
 * client-facing failure invented by the fix.
 */
import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';

/**
 * Attach to any route parameter that is compared against a `uuid` column.
 *
 *     @Param('id', UuidParam) id: string
 *
 * A single shared INSTANCE: the pipe is stateless, so one object serves every route and there is
 * no per-call allocation and no opportunity for two routes to be configured differently.
 */
export const UuidParam = new ParseUUIDPipe({
  /*
   * A PRODUCT-OWNED MESSAGE, replacing the framework default "Validation failed (uuid is
   * expected)".
   *
   * The default is not a leak in any practical sense — identifier format is a request-contract
   * fact, visible in every URL the client already builds. But §303 asks for no database type
   * detail in the response, and naming a Postgres column type in a client error is the kind of
   * thing that is only ever defended rather than needed. Saying nothing about the storage layer
   * costs the caller nothing: the 400 already tells them the identifier was the problem.
   *
   * It carries no SQL, no driver name, no stack, no schema, and — importantly — it does NOT echo
   * the caller's input, so a malformed value cannot be reflected back through this path.
   */
  exceptionFactory: () => new BadRequestException('The identifier in the request path is not valid.'),
});
