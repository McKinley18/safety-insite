import { SafeScopeTaskType, SafeScopeUnderstandingTask } from './safescope-understanding.types';

export class TaskUnderstandingService {
  evaluate(normalizedText: string): SafeScopeUnderstandingTask {
    const reasons: string[] = [];
    let taskType: SafeScopeTaskType = 'unknown';
    let activity = 'unknown';
    let workerRole = 'unknown';

    const taskMap: Array<{ type: SafeScopeTaskType; activity: string; terms: string[] }> = [
      { type: 'cleanup', activity: 'cleanup', terms: ['cleanup', 'cleaning', 'shoveling', 'shovel', 'shovels', 'clearing', 'clear', 'scraper', 'scraping', 'scrape', 'spillage', 'spilled', 'spill', 'muck', 'housekeeping', 'build-up', 'build up'] },
      { type: 'maintenance', activity: 'maintenance', terms: ['maintenance', 'repair', 'servicing', 'adjusting', 'clearing jam', 'jammed'] },
      { type: 'inspection', activity: 'inspection', terms: ['inspection', 'inspecting', 'examining', 'walkaround'] },
      { type: 'operation', activity: 'operation', terms: ['operation', 'operating', 'operator', 'running equipment'] },
      { type: 'maintenance', activity: 'elevated work', terms: ['working from ladder', 'working from', 'climbing', 'standing on ladder', 'near unprotected edge'] },
      { type: 'travel', activity: 'travel', terms: ['walking', 'travelway', 'walkway', 'pedestrian path'] },
      { type: 'transport', activity: 'transport', terms: ['transport', 'hauling', 'forklift travel', 'mobile equipment travel'] },
      { type: 'emergency_response', activity: 'emergency response', terms: ['emergency access', 'fire response', 'extinguisher access'] }
    ];

    for (const candidate of taskMap) {
      if (candidate.terms.some((term) => normalizedText.includes(term))) {
        taskType = candidate.type;
        activity = candidate.activity;
        reasons.push(`Task signal detected: ${candidate.activity}.`);
        break;
      }
    }

    if (normalizedText.includes('employee')) workerRole = 'employee';
    else if (normalizedText.includes('worker')) workerRole = 'worker';
    else if (normalizedText.includes('miner')) workerRole = 'miner';
    else if (normalizedText.includes('operator')) workerRole = 'operator';

    if (workerRole !== 'unknown') {
      reasons.push(`Worker role signal detected: ${workerRole}.`);
    }

    return {
      activity,
      taskType,
      workerRole,
      confidence: {
        score: reasons.length ? Math.min(0.9, 0.35 + reasons.length * 0.2) : 0.2,
        reasons: reasons.length ? reasons : ['No strong task signal detected.']
      }
    };
  }
}
