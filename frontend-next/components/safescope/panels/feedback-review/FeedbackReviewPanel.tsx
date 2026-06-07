import React from 'react';

export const FeedbackReviewPanel = () => {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-4 opacity-75">
      <h3 className="text-lg font-black text-slate-400 mb-4 uppercase tracking-tighter">Reviewer Feedback Queue</h3>
      <p className="text-xs font-bold text-slate-400 mb-4">
        The feedback review workflow is currently in governance lockdown. 
        All reviewer corrections are being captured and archived for the next synchronization cycle.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-400">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        Connection Pending
      </div>
    </div>
  );
};
