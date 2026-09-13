import { Controller, Get, Header } from '@nestjs/common';
import { getReleaseContract } from '../common/release-identity';

/**
 * §279 — `GET /version`. THE ENDPOINT A CLIENT ASKS BEFORE IT TRUSTS ITSELF.
 *
 * It is separate from `/health/version` on purpose, and neither replaces the other:
 *
 *   /health/version  is an OPERATOR surface. `release:verify-sha` reads it during a deployment to
 *                    establish what is actually running, and its shape is part of that runbook
 *                    step. It is not changed here.
 *   /version         is a PRODUCT surface. It is what a browser, and later an iOS or Android
 *                    client, polls at a low frequency to learn whether it is still supported.
 *
 * UNAUTHENTICATED, DELIBERATELY. A client has to be able to discover that it is obsolete before it
 * can sign in -- an obsolete client may not be able to sign in at all. Everything returned is a
 * public fact about a build, so there is nothing here to protect.
 *
 * `no-store` matters more than it looks. The whole point of this endpoint is to be the one request
 * in the product that is guaranteed not to be answered from a stale cache; an intermediary that
 * cached it for an hour would reintroduce exactly the staleness it exists to detect.
 */
@Controller()
export class VersionController {
  @Get('version')
  @Header('Cache-Control', 'no-store, max-age=0')
  version() {
    return getReleaseContract();
  }
}
