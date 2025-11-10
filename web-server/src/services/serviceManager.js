import IndexService from './indexService.js';

let indexServiceInstance = null;

/**
 * Get or create the IndexService singleton
 */
export async function getIndexService(memoryBankPath) {
  if (!indexServiceInstance) {
    indexServiceInstance = new IndexService(memoryBankPath);
    await indexServiceInstance.initialize();
  }
  return indexServiceInstance;
}

/**
 * Reset service (useful for testing)
 */
export function resetServiceManager() {
  indexServiceInstance = null;
}
