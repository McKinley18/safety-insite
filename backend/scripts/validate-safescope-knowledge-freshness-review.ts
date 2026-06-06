import { KnowledgeFreshnessReviewService } from '../src/safescope-v2/knowledge-freshness-review/knowledge-freshness-review.service';

async function validate() {
  const service = new KnowledgeFreshnessReviewService();
  
  const result = service.evaluateFreshness({});
  
  console.log('Testing unknown date freshness...');
  if (result.reviewStatus !== 'unknown_date') {
    console.error('Expected status unknown_date');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
