'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = 'http://localhost:4000';

export default function ReviewPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/reports/${id}`)
      .then((res) => res.json())
      .then(setReport);
  }, [id]);

  if (!report) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Final Review</h1>

      <h3>{report.site}</h3>
      <p>{report.inspector}</p>

      <h2>Findings</h2>

      {report.findings.map((f: any, i: number) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <strong>{f.hazard}</strong>
          <div>Risk: {f.severity * f.likelihood}</div>
          <div>{f.action}</div>
        </div>
      ))}

      <a href={`${API}/pdf/${report.id}`} target="_blank">
        <button>Download PDF</button>
      </a>
    </div>
  );
}
