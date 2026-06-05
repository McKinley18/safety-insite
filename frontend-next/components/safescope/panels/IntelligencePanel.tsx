import React, { useState } from 'react';
import { SafeScopeDisplayAdapter, DisplaySection } from '../../../lib/safescope/adapters/intelligence-display.adapter';
import { ReviewerFeedbackPanel } from './feedback/ReviewerFeedbackPanel';
import { AppButton } from '../../ui/AppButton';

// ... existing SafeScopeSection component ...
export const SafeScopeSection = ({ section }: { section: DisplaySection }) => {
  if (!section.isVisible) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 mb-2">{section.title}</h3>
      <div className="text-sm text-slate-600">
        {Array.isArray(section.content) ? (
          <ul className="list-disc pl-4">
            {section.content.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : (
          <p>{section.content}</p>
        )}
      </div>
    </div>
  );
};

export const SafeScopeIntelligencePanel = ({ adapter }: { adapter: SafeScopeDisplayAdapter }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="p-4 bg-slate-50 rounded-2xl">
      <SafeScopeSection section={adapter.summary} />
      <SafeScopeSection section={adapter.scenario} />
      <SafeScopeSection section={adapter.evidence} />
      <SafeScopeSection section={adapter.risk} />
      <SafeScopeSection section={adapter.correctiveActions} />
      <SafeScopeSection section={adapter.guardrails} />
      <SafeScopeSection section={adapter.auditTrace} />
      {adapter.narrative && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 mb-2">Narrative</h3>
          <p className="text-sm text-slate-600">{adapter.narrative.findingSummary}</p>
        </div>
      )}
      
      {!showFeedback && (
        <AppButton onClick={() => setShowFeedback(true)} variant="ghost" size="sm" className="w-full">
            Provide Reviewer Feedback
        </AppButton>
      )}
      
      {showFeedback && (
          <ReviewerFeedbackPanel 
            onCancel={() => setShowFeedback(false)} 
            onSubmit={(data) => {
                console.log('Feedback submitted:', data);
                setShowFeedback(false);
            }} 
          />
      )}
    </div>
  );
};
