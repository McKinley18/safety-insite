import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { BillingSubscriptionStatus, BillingTier } from "./plan-entitlements";

@Entity({ name: "user_subscription" })
@Index("idx_user_subscription_user_id", ["userId"], { unique: true })
@Index("idx_user_subscription_stripe_subscription_id", ["stripeSubscriptionId"], {
  unique: true,
})
export class UserSubscription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 64 })
  userId!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeCustomerId!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeSubscriptionId!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  stripePriceId!: string | null;

  @Column({ type: "varchar", length: 32, default: "free" })
  tier!: BillingTier;

  @Column({ type: "varchar", length: 32, default: "none" })
  status!: BillingSubscriptionStatus;

  @Column({ type: "timestamptz", nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ type: "boolean", default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  lastStripeEventId!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
