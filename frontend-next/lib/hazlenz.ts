import {
  getSafeScopeReasoningSnapshot,
  runSafeScopeV2Classify,
  runSafeScopeV2Offline,
  sendSafeScopeFeedback,
} from "./safescope";

/**
 * HazLenz AI public frontend client.
 *
 * These wrappers provide customer-facing/service-facing HazLenz names while
 * preserving the existing HazLenz AI implementation, route, and imports during
 * the InSite transition.
 */

export type HazLenzClassifyInput = Parameters<typeof runSafeScopeV2Classify>[0];
export type HazLenzOfflineInput = Parameters<typeof runSafeScopeV2Offline>[0];
export type HazLenzFeedbackInput = Parameters<typeof sendSafeScopeFeedback>[0];

export function runHazLenzClassify(input: HazLenzClassifyInput) {
  return runSafeScopeV2Classify(input);
}

export function runHazLenzOffline(input: HazLenzOfflineInput) {
  return runSafeScopeV2Offline(input);
}

export function sendHazLenzFeedback(input: HazLenzFeedbackInput) {
  return sendSafeScopeFeedback(input);
}

export function getHazLenzReasoningSnapshot(snapshotId: string) {
  return getSafeScopeReasoningSnapshot(snapshotId);
}
