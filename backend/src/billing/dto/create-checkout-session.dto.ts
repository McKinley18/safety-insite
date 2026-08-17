import { IsIn } from "class-validator";

import { BillingTier } from "../plan-entitlements";

export class CreateCheckoutSessionDto {
  @IsIn(["pro"])
  tier!: Extract<BillingTier, "pro">;
}
