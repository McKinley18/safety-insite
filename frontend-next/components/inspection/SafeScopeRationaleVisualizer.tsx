"use client";

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type Props = {
  safeScopeResult: any;
};

export default function SafeScopeRationaleVisualizer({ safeScopeResult }: Props) {
  if (!safeScopeResult) return null;

  // Extract variables
  const fusedText = safeScopeResult.fusedText || "No text available";
  const normalizedText = safeScopeResult.observationContext?.normalizedText || fusedText;
  
  // Decomposition
  const hazards = safeScopeResult.multiHazardDecomposition?.hazards || [];
  const hazardList = hazards.length > 0
    ? hazards.map((h: any) => h.domainId.replaceAll('_', ' ')).join(', ')
    : safeScopeResult.classification || "General Safety";

  // Energy & Barrier
  const energyType = safeScopeResult.energyTransferIntelligence?.energyTransferType || "Mechanical/Kinetic";
  const failureMode = safeScopeResult.barrierIntelligence?.primaryFailureMode || "Absent or failed physical barrier";

  // Standards
  const standards = safeScopeResult.suggestedStandards || [];
  const standardsList = standards.length > 0
    ? standards.slice(0, 3).map((s: any) => s.citation).join(', ')
    : "General Safety Standards";

  // Corrective Actions
  const recommendations = safeScopeResult.correctiveActionReasoning?.recommendations || [];
  const actionsList = recommendations.length > 0
    ? recommendations.slice(0, 3).map((r: any) => r.action).join('; ')
    : "Conduct general safety inspection";

  // Build nodes and edges
  const { nodes, edges } = useMemo(() => {
    const rawNodes = [
      {
        id: 'node-1',
        type: 'input',
        data: {
          label: (
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wide">1. Field Observation</span>
              <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-2">{normalizedText}</p>
            </div>
          ),
        },
        position: { x: 20, y: 50 },
        style: {
          background: '#FFFFFF',
          border: '2px solid #0F172A',
          borderRadius: '12px',
          padding: '10px',
          width: '240px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
      {
        id: 'node-2',
        data: {
          label: (
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wide">2. AI Hazard Parsing</span>
              <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1 capitalize">{hazardList}</p>
            </div>
          ),
        },
        position: { x: 20, y: 150 },
        style: {
          background: '#FFFFFF',
          border: '2px solid #0284C7',
          borderRadius: '12px',
          padding: '10px',
          width: '240px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
      {
        id: 'node-3',
        data: {
          label: (
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#1D72B8] uppercase tracking-wide">3. Energy & Barrier Mode</span>
              <p className="mt-1 text-[11px] font-semibold text-slate-800 line-clamp-1">{energyType}</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">{failureMode}</p>
            </div>
          ),
        },
        position: { x: 280, y: 50 },
        style: {
          background: '#FFFFFF',
          border: '2px solid #1D72B8',
          borderRadius: '12px',
          padding: '10px',
          width: '240px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
      {
        id: 'node-4',
        data: {
          label: (
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#102B43] uppercase tracking-wide">4. Matched CFR Standards</span>
              <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1">{standardsList}</p>
            </div>
          ),
        },
        position: { x: 280, y: 150 },
        style: {
          background: '#FFFFFF',
          border: '2px solid #102B43',
          borderRadius: '12px',
          padding: '10px',
          width: '240px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
      {
        id: 'node-5',
        type: 'output',
        data: {
          label: (
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wide">5. Recommended Abatement</span>
              <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-2">{actionsList}</p>
            </div>
          ),
        },
        position: { x: 540, y: 100 },
        style: {
          background: '#FFFFFF',
          border: '2px solid #F97316',
          borderRadius: '12px',
          padding: '10px',
          width: '240px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
    ];

    const rawEdges = [
      {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        animated: true,
        style: { stroke: '#0284C7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#0284C7' },
      },
      {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
        animated: true,
        style: { stroke: '#1D72B8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1D72B8' },
      },
      {
        id: 'e3-4',
        source: 'node-3',
        target: 'node-4',
        animated: true,
        style: { stroke: '#102B43', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#102B43' },
      },
      {
        id: 'e4-5',
        source: 'node-4',
        target: 'node-5',
        animated: true,
        style: { stroke: '#F97316', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F97316' },
      },
    ];

    return { nodes: rawNodes, edges: rawEdges };
  }, [normalizedText, hazardList, energyType, failureMode, standardsList, actionsList]);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-slate-900">
            Interactive AI Decision Path Trace
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize how ReviewCore processed your input step-by-step
          </p>
        </div>
        <span className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
          Deterministic Execution
        </span>
      </div>

      <div className="h-[280px] w-full" style={{ minHeight: '280px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          nodesConnectable={false}
          nodesDraggable={true}
          panOnDrag={false}
          zoomOnScroll={false}
          preventScrolling={false}
        >
          <Background color="#CBD5E1" gap={12} size={1} />
          <Controls showInteractive={false} className="bg-white border-slate-200 rounded-lg shadow-sm" />
        </ReactFlow>
      </div>
    </div>
  );
}
