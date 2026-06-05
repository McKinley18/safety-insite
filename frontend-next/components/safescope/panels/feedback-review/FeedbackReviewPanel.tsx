import React from 'react';

export const FeedbackReviewPanel = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
      <h3 className="text-lg font-black text-slate-900 mb-4">Reviewer Feedback Queue</h3>
      <p className="text-xs text-slate-500 mb-4">
        This is a placeholder for the administrative feedback review workflow. 
        Feedback is currently being captured and queued for safety professional review.
      </p>
      <div className="text-xs font-semibold text-slate-600 italic">
        (No feedback items currently approved for direct knowledge promotion.)
      </div>
    </div>
  );
};
