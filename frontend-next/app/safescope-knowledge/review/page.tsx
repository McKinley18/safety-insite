import React from 'react';

export default function ReviewConsole() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SafeScope Knowledge Review</h1>
      <p className="mb-4">This is a qualified-review workflow.</p>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="border p-2">Draft Packs: 7</div>
        <div className="border p-2">Candidates: 96</div>
        <div className="border p-2">Review Required: 96</div>
        <div className="border p-2">Promotion Eligible: 0</div>
      </div>
      
      <div className="bg-yellow-100 p-2 mb-4">
        Warning: No records are auto-promoted.
      </div>
      
      <table className="border w-full">
        <thead>
          <tr>
            <th>Pack ID</th>
            <th>Review Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Machine Guarding/LOTO</td>
            <td><span className="bg-yellow-200">Review Required</span></td>
            <td>
                <button className="border px-2 mr-2" disabled>Review</button>
                <button className="border px-2" disabled>Hold</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
