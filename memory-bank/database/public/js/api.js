/**
 * API Client for Database Explorer
 */
const API = {
  /**
   * Fetch database statistics
   */
  async getStats() {
    const response = await fetch('/api/stats');
    return response.json();
  },

  /**
   * Fetch list of all tables
   */
  async getTables() {
    const response = await fetch('/api/tables');
    return response.json();
  },

  /**
   * Fetch table data with pagination
   */
  async getTableData(tableName, offset = 0, limit = 50, options = {}) {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    if (options.q) params.set('q', options.q);
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortDir) params.set('sortDir', options.sortDir);

    const response = await fetch(`/api/table/${tableName}?${params.toString()}`);
    return response.json();
  },

  /**
   * Fetch single record with relationships
   */
  async getRecord(tableName, id) {
    const response = await fetch(`/api/table/${tableName}/record/${id}`);
    return response.json();
  },

  /**
   * Search across all tables
   */
  async search(query) {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  /**
   * Fetch memory bank file categories and file list
   */
  async getMemoryBankFiles() {
    const response = await fetch('/api/memory-bank/files');
    return response.json();
  },

  /**
   * Fetch content of a specific memory bank file
   */
  async getMemoryBankFile(filePath) {
    const response = await fetch(`/api/memory-bank/file/${filePath}`);
    return response.json();
  }
};

// Export for module usage (if using modules) or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
} else {
  window.API = API;
}
