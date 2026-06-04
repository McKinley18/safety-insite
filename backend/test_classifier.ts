import { DeterministicClassifier } from './src/safescope-v2/engine/deterministic-classifier';
const c = new DeterministicClassifier();
console.log(c.classify("machine guard missing"));
