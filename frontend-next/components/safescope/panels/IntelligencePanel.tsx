import React, { useState } from 'react';
import { SafeScopeDisplayAdapter, DisplaySection } from '../../../lib/safescope/adapters/intelligence-display.adapter';
import { ReviewerFeedbackPanel } from './feedback/ReviewerFeedbackPanel';
import { AppButton } from '../../ui/AppButton';

function renderSafeScopeValue(value: any): React.ReactNode {
  if (value === undefined || value === null || value === "") return null;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => renderSafeScopeValue(item))
      .filter(Boolean);

    if (!items.length) return null;

    return (
      <ul className="list-disc space-y-1 pl-4">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => {
        const rendered = renderSafeScopeValue(item);
        if (!rendered) return null;

        return (
          <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <div className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {rendered}
            </div>
          </div>
        );
      })
      .filter(Boolean);

    if (!entries.length) return null;

    return <div className="space-y-2">{entries}</div>;
  }

  return String(value);
}

export const SafeScopeSection = ({ section }: { section: DisplaySection }) => {
  if (!section.isVisible) return null;

  const rendered = renderSafeScopeValue(section.content);
  if (!rendered) return null;

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
        {section.title}
      </h3>
      <div className="text-sm text-slate-600 dark:text-slate-300">
        {rendered}
      </div>
    </div>
  );
};

export const SafeScopeIntelligencePanel = ({ adapter }: { adapter: SafeScopeDisplayAdapter }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
      <SafeScopeSection section={adapter.summary} />
      <SafeScopeSection section={adapter.scenario} />
      <SafeScopeSection section={adapter.evidence} />
      <SafeScopeSection section={adapter.standards} />
      <SafeScopeSection section={adapter.risk} />
      <SafeScopeSection section={adapter.correctiveActions} />
      <SafeScopeSection section={adapter.guardrails} />

      {adapter.narrative && (
        <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">
            Narrative
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {adapter.narrative.findingSummary}
          </p>
        </div>
      )}

      {!showFeedback && (
        <AppButton
          onClick={() => setShowFeedback(true)}
          variant="ghost"
          size="sm"
          className="w-full"
        >
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
