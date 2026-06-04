'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:4000';

export default function InspectionPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [hazard, setHazard] = useState('');
  const [ai, setAi] = useState<any>(null);
  const [severity, setSeverity] = useState<number | null>(null);
  const [likelihood, setLikelihood] = useState<number | null>(null);
  const [action, setAction] = useState('');
  const [findings, setFindings] = useState<any[]>([]);

  const analyze = async () => {
    const res = await fetch(`${API}/intelligence/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: hazard }),
    });

    const data = await res.json();
    setAi(data);
    setSeverity(data.classification?.severity || 3);
    setLikelihood(data.classification?.likelihood || 3);
    setStep(3);
  };

  const saveFinding = () => {
    setFindings([
      ...findings,
      { hazard, severity, likelihood, action }
    ]);

    setHazard('');
    setAi(null);
    setSeverity(null);
    setLikelihood(null);
    setAction('');
    setStep(1);
  };

  const submitReport = async () => {
    const res = await fetch(`${API}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: 'Sentinel Client',
        site: 'Default Site',
        inspector: 'Inspector',
        findings,
      }),
    });

    const data = await res.json();

    router.push(`/review/${data.id}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Inspection</h1>

      {step === 1 && (
        <div>
          <textarea
            placeholder="Describe hazard"
            value={hazard}
            onChange={(e) => setHazard(e.target.value)}
          />
          <button onClick={analyze}>Analyze</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>AI Results</h3>
          {ai?.standards?.map((s: any, i: number) => (
            <div key={i}>
              {s.citation} - {s.title}
            </div>
          ))}

          <div>
            Severity:
            <input
              type="number"
              value={severity || ''}
              onChange={(e) => setSeverity(Number(e.target.value))}
            />
          </div>

          <div>
            Likelihood:
            <input
              type="number"
              value={likelihood || ''}
              onChange={(e) => setLikelihood(Number(e.target.value))}
            />
          </div>

          <textarea
            placeholder="Corrective action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />

          <button onClick={saveFinding}>Save Finding</button>
        </div>
      )}

      {findings.length > 0 && (
        <div>
          <h2>Findings</h2>
          {findings.map((f, i) => (
            <div key={i}>
              {f.hazard} | Risk: {f.severity * f.likelihood}
            </div>
          ))}

          <button onClick={submitReport}>
            Finish Report
          </button>
        </div>
      )}
    </div>
  );
}
