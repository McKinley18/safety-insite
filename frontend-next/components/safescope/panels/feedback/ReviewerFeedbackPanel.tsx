import React, { useState } from 'react';
import { AppButton } from '../../../ui/AppButton';
import { AppInput } from '../../../ui/AppInput';

type FeedbackType = 'correct' | 'incorrect' | 'partially_correct' | 'too_generic' | 'unsafe_or_misleading' | 'missing' | 'unnecessary' | 'helpful' | 'unclear';

interface FeedbackProps {
  onCancel: () => void;
  onSubmit: (data: { type: FeedbackType, notes: string }) => void;
}

export const ReviewerFeedbackPanel: React.FC<FeedbackProps> = ({ onCancel, onSubmit }) => {
  const [type, setType] = useState<FeedbackType>('helpful');
  const [notes, setNotes] = useState('');

  const types: FeedbackType[] = [
    'correct', 'incorrect', 'partially_correct', 'too_generic', 'unsafe_or_misleading',
    'missing', 'unnecessary', 'helpful', 'unclear'
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
      <h3 className="text-lg font-black text-slate-900 mb-4">Provide Reviewer Feedback</h3>
      <p className="text-xs text-slate-500 mb-4">Your feedback is queued for review by safety professionals and does not automatically modify SafeScope intelligence.</p>
      
      <div className="mb-4">
        <label className="text-xs font-black text-slate-800 uppercase mb-2 block">Feedback Type</label>
        <select 
            value={type} 
            onChange={(e) => setType(e.target.value as FeedbackType)}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        >
          {types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <AppInput 
        label="Notes (Optional)" 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        placeholder="Add reviewer notes..."
        className="mb-4"
      />

      <div className="flex gap-2">
        <AppButton onClick={onCancel} variant="ghost" size="sm">Cancel</AppButton>
        <AppButton onClick={() => onSubmit({ type, notes })} size="sm">Submit Feedback</AppButton>
      </div>
    </div>
  );
};
