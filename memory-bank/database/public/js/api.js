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
  },

  async getCurrentDb() {
    const response = await fetch('/api/db/current');
    return response.json();
  },

  async listDbFiles(dir) {
    const params = new URLSearchParams();
    if (dir) params.set('dir', String(dir));
    const response = await fetch(`/api/db/list?${params.toString()}`);
    return response.json();
  },

  async openDb(dbPath) {
    const response = await fetch('/api/db/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbPath })
    });
    return response.json();
  },

  async createDb(dbPath, schema = 'phase_a') {
    const response = await fetch('/api/db/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbPath, schema })
    });
    return response.json();
  },

  async previewImportEditHistory(options = {}) {
    const params = new URLSearchParams();
    if (options.source) params.set('source', String(options.source));
    if (options.from) params.set('from', String(options.from));
    if (options.to) params.set('to', String(options.to));
    if (options.limit != null) params.set('limit', String(options.limit));
    if (options.offset != null) params.set('offset', String(options.offset));
    const response = await fetch(`/api/import/edit-history/preview?${params.toString()}`);
    return response.json();
  },

  async runImportEditHistory(body) {
    const response = await fetch('/api/import/edit-history/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    return response.json();
  },

  // Setup Wizard API Methods
  async getSetupStatus() {
    const response = await fetch('/api/setup/status');
    return response.json();
  },

  async listFolders() {
    const response = await fetch('/api/setup/folders');
    return response.json();
  },

  async scanFolder(folderPath) {
    const response = await fetch('/api/setup/scan-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath })
    });
    return response.json();
  },

  async checkExistingData(folderPath) {
    const params = new URLSearchParams();
    params.set('folderPath', folderPath);
    const response = await fetch(`/api/setup/check-existing-data?${params.toString()}`);
    return response.json();
  },

  async initializeMemoryBank(options = {}) {
    const response = await fetch('/api/setup/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return response.json();
  }
};

// Export for module usage (if using modules) or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
} else {
  window.API = API;
}
