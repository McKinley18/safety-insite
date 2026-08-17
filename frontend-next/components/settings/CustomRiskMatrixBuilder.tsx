"use client";

import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import {
  buildMatrixForSize,
  nextRiskLevel,
  readCustomRiskMatrix,
  riskLevelCellClasses,
  riskLevelLabels,
  visualColOrder,
  visualRowOrder,
  writeCustomRiskMatrix,
  type CustomRiskMatrix,
  type LikelihoodOrigin,
  type SeverityOrigin,
} from "@/lib/customRiskMatrix";

const GRID_SIZE_OPTIONS = [3, 4, 5, 6];

const LIKELIHOOD_ORIGIN_OPTIONS: [LikelihoodOrigin, string][] = [
  ["bottom", "Lowest to Highest"],
  ["top", "Highest to Lowest"],
];

const SEVERITY_ORIGIN_OPTIONS: [SeverityOrigin, string][] = [
  ["left", "Lowest to Highest"],
  ["right", "Highest to Lowest"],
];

export function CustomRiskMatrixBuilder({
  onSaved,
}: {
  onSaved?: (matrix: CustomRiskMatrix) => void;
}) {
  const [matrix, setMatrix] = useState<CustomRiskMatrix>(() => buildMatrixForSize(5, 5));
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const stored = readCustomRiskMatrix(window.localStorage);
    if (stored) setMatrix(stored);
  }, []);

  function resizeMatrix(rows: number, cols: number) {
    setMatrix((current) => buildMatrixForSize(rows, cols, current));
    setSaveMessage("");
  }

  function updateName(name: string) {
    setMatrix((current) => ({ ...current, name }));
    setSaveMessage("");
  }

  function updateLikelihoodLabel(index: number, value: string) {
    setMatrix((current) => {
      const likelihoodLabels = [...current.likelihoodLabels];
      likelihoodLabels[index] = value;
      return { ...current, likelihoodLabels };
    });
    setSaveMessage("");
  }

  function updateSeverityLabel(index: number, value: string) {
    setMatrix((current) => {
      const severityLabels = [...current.severityLabels];
      severityLabels[index] = value;
      return { ...current, severityLabels };
    });
    setSaveMessage("");
  }

  function updateLikelihoodOrigin(likelihoodOrigin: LikelihoodOrigin) {
    setMatrix((current) => ({ ...current, likelihoodOrigin }));
    setSaveMessage("");
  }

  function updateSeverityOrigin(severityOrigin: SeverityOrigin) {
    setMatrix((current) => ({ ...current, severityOrigin }));
    setSaveMessage("");
  }

  function cycleCell(rowIndex: number, colIndex: number) {
    setMatrix((current) => {
      const cellLevels = current.cellLevels.map((row) => [...row]);
      cellLevels[rowIndex][colIndex] = nextRiskLevel(cellLevels[rowIndex][colIndex]);
      return { ...current, cellLevels };
    });
    setSaveMessage("");
  }

  function saveMatrix() {
    const trimmedName = matrix.name.trim() || "My Custom Matrix";
    const saved: CustomRiskMatrix = {
      ...matrix,
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };
    writeCustomRiskMatrix(window.localStorage, saved);
    setMatrix(saved);
    setSaveMessage("Custom risk matrix saved.");
    onSaved?.(saved);
  }

  const rows = matrix.likelihoodLabels.length;
  const cols = matrix.severityLabels.length;
  const rowOrder = visualRowOrder(rows, matrix.likelihoodOrigin);
  const colOrder = visualColOrder(cols, matrix.severityOrigin);

  return (
    <div className="space-y-5">
      <AppInput
        value={matrix.name}
        onChange={(event) => updateName(event.target.value)}
        placeholder="Matrix name"
        fieldSize="sm"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-xs font-black uppercase tracking-wide text-app-text-muted">
              Likelihood levels
            </p>

            <AppSelect
              value={String(rows)}
              onChange={(event) => resizeMatrix(Number(event.target.value), cols)}
              fieldSize="sm"
              className="!w-16 !px-2 !py-1"
              aria-label="Number of likelihood levels"
            >
              {GRID_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={matrix.likelihoodOrigin}
              onChange={(event) => updateLikelihoodOrigin(event.target.value as LikelihoodOrigin)}
              fieldSize="sm"
              className="!w-auto !px-2 !py-1"
              aria-label="Likelihood level order"
            >
              {LIKELIHOOD_ORIGIN_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </AppSelect>
          </div>

          {matrix.likelihoodLabels.map((label, index) => (
            <AppInput
              key={`likelihood-input-${index}`}
              value={label}
              onChange={(event) => updateLikelihoodLabel(index, event.target.value)}
              placeholder={`Level ${index + 1}`}
              fieldSize="sm"
            />
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-xs font-black uppercase tracking-wide text-app-text-muted">
              Severity levels
            </p>

            <AppSelect
              value={String(cols)}
              onChange={(event) => resizeMatrix(rows, Number(event.target.value))}
              fieldSize="sm"
              className="!w-16 !px-2 !py-1"
              aria-label="Number of severity levels"
            >
              {GRID_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={matrix.severityOrigin}
              onChange={(event) => updateSeverityOrigin(event.target.value as SeverityOrigin)}
              fieldSize="sm"
              className="!w-auto !px-2 !py-1"
              aria-label="Severity level order"
            >
              {SEVERITY_ORIGIN_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </AppSelect>
          </div>

          {matrix.severityLabels.map((label, index) => (
            <AppInput
              key={`severity-input-${index}`}
              value={label}
              onChange={(event) => updateSeverityLabel(index, event.target.value)}
              placeholder={`Level ${index + 1}`}
              fieldSize="sm"
            />
          ))}
        </div>
      </div>

      <p className="text-xs font-semibold leading-5 text-app-text-muted">
        Click a cell to cycle its risk level (Low → Medium → High → Critical). The grid below fills in
        automatically from the levels and orientation above.
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `minmax(88px, auto) repeat(${cols}, minmax(72px, 1fr))` }}
          >
            <div />
            {colOrder.map((colIndex) => (
              <div
                key={`severity-header-${colIndex}`}
                className="flex items-center justify-center rounded-lg bg-app-surface-muted px-1 py-1.5 text-center text-[10px] font-black uppercase leading-tight text-app-text break-words"
              >
                {matrix.severityLabels[colIndex]}
              </div>
            ))}

            {rowOrder.map((rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                <div className="flex items-center rounded-lg bg-app-surface-muted px-2 py-1.5 text-[11px] font-black leading-tight text-app-text break-words">
                  {matrix.likelihoodLabels[rowIndex]}
                </div>
                {colOrder.map((colIndex) => {
                  const level = matrix.cellLevels[rowIndex][colIndex];
                  return (
                    <button
                      key={`cell-${rowIndex}-${colIndex}`}
                      type="button"
                      onClick={() => cycleCell(rowIndex, colIndex)}
                      title={`${matrix.likelihoodLabels[rowIndex]} × ${matrix.severityLabels[colIndex]}: ${riskLevelLabels[level]}`}
                      className={`aspect-square min-h-9 rounded-lg text-[10px] font-black uppercase tracking-wide text-white shadow-none transition ${riskLevelCellClasses[level]}`}
                    >
                      {riskLevelLabels[level]}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AppButton type="button" size="sm" onClick={saveMatrix}>
          Save Custom Matrix
        </AppButton>
        {saveMessage && (
          <p className="rounded-lg bg-app-surface-muted px-2.5 py-1.5 text-[11px] font-black text-app-text">
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  );
}
