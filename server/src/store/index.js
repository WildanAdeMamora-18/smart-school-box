import { config } from '../config.js';
import { memoryStore } from './memoryStore.js';

export const store = config.useFirebase
  ? (await import('./firebaseStore.js')).firebaseStore
  : memoryStore;
