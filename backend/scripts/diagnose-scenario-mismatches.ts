import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const triageResultsPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json');
const calibrationResultsPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json');

type JsonRecord = Record<string, any>;

function readJson(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function normalizeScenarioId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return 'unknown';
  return value.trim().toLowerCase().replace(/-/g, '_');
}

function getCaseId(record: JsonRecord): string {
  return String(record.id ?? record.caseId ?? record.fieldId ?? record.input?.id ?? record.case?.id ?? 'unknown');
}

function getRecordList(results: any): JsonRecord[] {
  if (Array.isArray(results)) return results;
  if (Array.isArray(results.details)) return results.details;
  if (Array.isArray(results.results)) return results.results;
  if (Array.isArray(results.cases)) return results.cases;
  if (Array.isArray(results.records)) return results.records;
  return [];
}

function getField(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return 'unknown';
}

function deepFindScenarioFamily(record: any): string {
  const candidates = [
    record?.scoring?.scenarioFamily?.actual,
    record?.actualScenarioFamily,
    record?.actual?.scenarioFamily,
    record?.actual?.scenarioFamilyId,
    record?.calibrationMeta?.scenarioFamily,
    record?.output?.calibrationMeta?.scenarioFamily,
    record?.result?.calibrationMeta?.scenarioFamily,
    record?.safeScopeResult?.calibrationMeta?.scenarioFamily,
    record?.scenarioIntelligence?.scenarioFamilyId,
    record?.output?.scenarioIntelligence?.scenarioFamilyId,
    record?.result?.scenarioIntelligence?.scenarioFamilyId,
    record?.safeScopeResult?.scenarioIntelligence?.scenarioFamilyId,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeScenarioId(candidate);
    if (normalized !== 'unknown') return normalized;
  }

  return 'unknown';
}

function collectById(records: JsonRecord[]): Map<string, JsonRecord> {
  const byId = new Map<string, JsonRecord>();
  for (const record of records) {
    byId.set(getCaseId(record), record);
  }
  return byId;
}

const dataset = getRecordList(readJson(datasetPath));
const triage = readJson(triageResultsPath);
const calibration = readJson(calibrationResultsPath);

const triageRecords = getRecordList(triage);
const calibrationRecords = getRecordList(calibration);

const datasetById = collectById(dataset);
const triageById = collectById(triageRecords);
const calibrationById = collectById(calibrationRecords);

const allIds = Array.from(new Set([
  ...dataset.map(getCaseId),
  ...triageRecords.map(getCaseId),
  ...calibrationRecords.map(getCaseId),
])).filter(id => id !== 'unknown').sort();

const pairCounts = new Map<string, number>();
const expectedCounts = new Map<string, number>();
const actualCounts = new Map<string, number>();
const examples = new Map<string, JsonRecord[]>();

let total = 0;
let exact = 0;
let normalizedOnlyMatches = 0;
let mismatch = 0;
let unknownActual = 0;

for (const id of allIds) {
  const datasetRecord = datasetById.get(id) ?? {};
  const triageRecord = triageById.get(id) ?? {};
  const calibrationRecord = calibrationById.get(id) ?? {};

  const expectedRaw =
    triageRecord.scoring?.scenarioFamily?.expected ??
    datasetRecord.expectedScenarioFamily ??
    datasetRecord.expected?.scenarioFamily ??
    datasetRecord.expected?.scenarioFamilyId ??
    triageRecord.expectedScenarioFamily ??
    triageRecord.expected?.scenarioFamily ??
    triageRecord.expected?.scenarioFamilyId ??
    calibrationRecord.expectedScenarioFamily ??
    calibrationRecord.expected?.scenarioFamily ??
    calibrationRecord.expected?.scenarioFamilyId;

  const expected = normalizeScenarioId(expectedRaw);

  const actual =
    deepFindScenarioFamily(triageRecord) !== 'unknown'
      ? deepFindScenarioFamily(triageRecord)
      : deepFindScenarioFamily(calibrationRecord);

  total += 1;

  if (expected === actual && expected !== 'unknown') {
    exact += 1;
    if (typeof expectedRaw === 'string' && expectedRaw !== actual) {
      normalizedOnlyMatches += 1;
    }
    continue;
  }

  mismatch += 1;
  if (actual === 'unknown') unknownActual += 1;

  expectedCounts.set(expected, (expectedCounts.get(expected) ?? 0) + 1);
  actualCounts.set(actual, (actualCounts.get(actual) ?? 0) + 1);

  const pair = `${expected} -> ${actual}`;
  pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1);

  const list = examples.get(pair) ?? [];
  if (list.length < 8) {
    list.push({
      id,
      expected,
      actual,
      matchStatus:
        triageRecord.scoring?.scenarioFamily?.status ??
        triageRecord.matches?.scenarioFamily ??
        calibrationRecord.matches?.scenarioFamily ??
        'unknown',
      equipment: getField(datasetRecord, ['equipment', 'equipmentInvolved', 'expectedEquipment']),
      task: getField(datasetRecord, ['task', 'taskContext', 'expectedTask']),
      controlFailure: getField(datasetRecord, ['controlFailure', 'failedControl', 'missingControl']),
      exposurePattern: getField(datasetRecord, ['exposurePattern', 'exposure']),
      locationContext: getField(datasetRecord, ['locationContext', 'location']),
      observation: getField(datasetRecord, ['observation', 'observationText', 'hazardObservation', 'description', 'narrative'])
    });
  }
  examples.set(pair, list);
}

function sortedEntries(map: Map<string, number>): Array<[string, number]> {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const report = {
  summary: {
    total,
    exactAfterNormalization: exact,
    normalizedOnlyMatches,
    mismatches: mismatch,
    unknownActual,
    exactRate: total ? Number((exact / total).toFixed(4)) : 0
  },
  topMismatchPairs: sortedEntries(pairCounts).slice(0, 25).map(([pair, count]) => ({
    pair,
    count,
    examples: examples.get(pair) ?? []
  })),
  topExpectedMisses: sortedEntries(expectedCounts).slice(0, 20).map(([scenarioFamily, count]) => ({ scenarioFamily, count })),
  topActualWrongRoutes: sortedEntries(actualCounts).slice(0, 20).map(([scenarioFamily, count]) => ({ scenarioFamily, count }))
};

console.log('Analyzing scenarioFamily mismatches...');
console.log(JSON.stringify(report, null, 2));
