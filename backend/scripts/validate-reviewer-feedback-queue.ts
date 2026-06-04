import { ReviewerFeedbackQueueService } from '../src/safescope-v2/brain/reviewer-feedback-queue/reviewer-feedback.service';
import { ObservationContextService } from '../src/safescope-v2/brain/observation-context/observation-context.service';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const queueService = new ReviewerFeedbackQueueService();
const contextService = new ObservationContextService();

console.log("Running ReviewerFeedbackQueueService validation...");

// Test: Create feedback
const context = contextService.normalize("test raw observation");
const feedback = queueService.createFeedback(
    "obs-123",
    "test raw observation",
    context,
    "safety_manager",
    "unsafe_or_misleading",
    "This is misleading"
);

assert(feedback.feedbackSeverity === 'critical', "Failed to classify severity as critical");
assert(queueService.getPendingFeedback().length === 1, "Failed to add to pending queue");
console.log("Test 1 Passed: Feedback created and classified.");

console.log("ReviewerFeedbackQueueService validation passed.");
