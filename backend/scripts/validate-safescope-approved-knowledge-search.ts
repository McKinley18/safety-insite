import { ApprovedKnowledgeSearchService } from '../src/safescope-v2/approved-knowledge-search/approved-knowledge-search.service';

async function validate() {
  const service = new ApprovedKnowledgeSearchService();
  
  const results = service.search('conveyor');
  
  console.log('Testing Conveyor search...');
  if (results.length === 0 || results[0].sourceUsability !== 'draft_review_required') {
    console.error('Expected draft candidate with draft_review_required');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
