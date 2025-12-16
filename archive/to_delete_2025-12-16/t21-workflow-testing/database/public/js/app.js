/**
 * Main Application Controller
 */
const App = {
  allTables: [],
  currentTable: null,
  currentData: [],

  // File browser state
  fileCategories: {},
  currentCategory: null,
  currentFile: null,

  // View State
  state: {
    mode: 'database', // 'database' or 'files'
    viewMode: localStorage.getItem('viewMode') || 'card',
    filter: '',
    sortColumn: null,
    sortDirection: 'asc'
  },

  async init() {
    // Initialize router
    Router.init();

    // Initialize dark mode
    this.initTheme();

    // Check URL hash for initial mode
    const hash = window.location.hash;
    if (hash.includes('files')) {
      this.state.mode = 'files';
      this.switchTab('files');
    } else {
      // Load database tables by default
      await this.loadTables();
      await this.loadStats();
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    this.updateDarkModeIcon();
  },

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateDarkModeIcon();
  },

  updateDarkModeIcon() {
    const btn = document.querySelector('.dark-mode-toggle');
    if (btn) {
      btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
  },

  async loadTables() {
    try {
      this.allTables = await API.getTables();
      const navList = document.getElementById('navList');
      navList.innerHTML = UI.renderTableList(this.allTables, this.currentTable);

      // Select first table by default if none selected
      if (this.allTables.length > 0 && !this.currentTable) {
        this.selectTable(this.allTables[0].name);
      }
    } catch (err) {
      console.error("Failed to load tables", err);
      document.getElementById('mainContent').innerHTML = `<div class="error">Error loading tables: ${err.message}</div>`;
    }
  },

  async loadStats() {
    try {
      const stats = await API.getStats();
      // Prepend stats to main content if needed, or update a specific container
      // For now, we log it as the UI handles it inside loadTableData usually
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  },

  async selectTable(tableName, event) {
    this.currentTable = tableName;
    
    // Reset transient state for new table
    this.state.filter = '';
    this.state.sortColumn = null;
    this.state.sortDirection = 'asc';
    
    this.selectSidebarItem(tableName);

    // Push initial history if this is a user action
    if (!event) {
      // Programmatic load (initial) - fix for the bug!
      Router.push(Router.buildState('table', { table: tableName }));
    } else if (!Router.isNavigatingHistory) {
      Router.push(Router.buildState('table', { table: tableName }));
    }
    
    await this.loadTableData(tableName);
  },

  selectSidebarItem(tableName) {
    document.querySelectorAll('.table-item').forEach(el => el.classList.remove('active'));
    // Find the item text content that matches
    const items = document.querySelectorAll('.table-item');
    for(let item of items) {
      if(item.textContent.includes(tableName)) {
        item.classList.add('active');
        break;
      }
    }
  },

  async loadTableData(tableName, offset = 0, restoring = false) {
    try {
      document.getElementById('mainContent').innerHTML = '<div class="loading">Loading table data...</div>';
      
      const result = await API.getTableData(tableName, offset);
      
      if (result.error) {
        document.getElementById('mainContent').innerHTML = `<div class="error">${result.error}</div>`;
        return;
      }

      this.currentData = result.data;
      const tableInfo = this.allTables.find(t => t.name === tableName);
      
      // Apply local sorting/filtering if we have data
      let displayData = [...this.currentData];
      if (this.state.filter) {
        displayData = this.filterData(displayData, this.state.filter);
      }
      if (this.state.sortColumn) {
        displayData = this.sortData(displayData, this.state.sortColumn, this.state.sortDirection);
      }

      // Render Full View
      let html = UI.renderTableHeader(tableName, result.pagination.total, tableInfo.columnCount, displayData.length);
      html += UI.renderViewControls(tableName, this.state.viewMode, this.state.filter);
      
      if (this.state.viewMode === 'card') {
        html += UI.renderCardView(displayData, tableName);
      } else {
        html += UI.renderTableView(displayData, tableName, this.state.sortColumn, this.state.sortDirection);
      }
      
      html += UI.renderPagination(result.pagination.total, result.pagination.limit, result.pagination.offset, tableName);
      
      document.getElementById('mainContent').innerHTML = html;
      
      // Restore focus to filter input if typing
      if (this.state.filter) {
        const input = document.getElementById('tableFilter');
        if (input) {
          input.focus();
          input.value = this.state.filter; // Ensure value is set
        }
      }

    } catch (err) {
      document.getElementById('mainContent').innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
  },
  
  applyTableFilter(tableName) {
    const input = document.getElementById('tableFilter');
    if (!input) return;
    
    this.state.filter = input.value.toLowerCase();
    
    if (!Router.isNavigatingHistory) {
      Router.push(Router.buildState('table', { table: tableName }));
    }
    
    // Refresh view without reloading network data if possible
    // But here we just call loadTableData to keep it simple (or re-render locally)
    this.renderCurrentData(tableName);
  },
  
  renderCurrentData(tableName) {
    let displayData = [...this.currentData];
    
    if (this.state.filter) {
      displayData = this.filterData(displayData, this.state.filter);
    }
    if (this.state.sortColumn) {
      displayData = this.sortData(displayData, this.state.sortColumn, this.state.sortDirection);
    }
    
    const tableInfo = this.allTables.find(t => t.name === tableName);
    
    // Re-render content area (skipping header refresh to avoid flicker?)
    // For simplicity, just re-render the whole mainContent
    let html = UI.renderTableHeader(tableName, this.currentData.length, tableInfo.columnCount, displayData.length); // using currentData.length as total approximation for this page
    html += UI.renderViewControls(tableName, this.state.viewMode, this.state.filter);
    
    if (this.state.viewMode === 'card') {
      html += UI.renderCardView(displayData, tableName);
    } else {
      html += UI.renderTableView(displayData, tableName, this.state.sortColumn, this.state.sortDirection);
    }
     // Pagination missing in local render, better to call loadTableData usually, but this is fast
    document.getElementById('mainContent').innerHTML = html;
    
    const input = document.getElementById('tableFilter');
    if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
    }
  },

  filterData(data, filterText) {
    if (!filterText) return data;
    return data.filter(record => {
      return Object.values(record).some(value =>
        String(value).toLowerCase().includes(filterText)
      );
    });
  },

  sortData(data, column, direction) {
    return data.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // 1. Task ID Sort (T1, T2, T10)
      const taskRegex = /^T(\d+)$/;
      const aTaskMatch = String(aVal).match(taskRegex);
      const bTaskMatch = String(bVal).match(taskRegex);

      if (aTaskMatch && bTaskMatch) {
        const aNum = parseInt(aTaskMatch[1]);
        const bNum = parseInt(bTaskMatch[1]);
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // 2. Numeric Sort
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      // Only sort numerically if BOTH are purely numeric (not just starting with a number)
      // And ensure we don't treat date strings (2025-11...) as pure numbers (2025) unless they really are just numbers
      // Actually, parseFloat("2025-11-22") is 2025. We want to avoid that for dates.
      // Check if it looks like a date first
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      const isDate = dateRegex.test(String(aVal)) && dateRegex.test(String(bVal));

      if (!isDate && !isNaN(aNum) && !isNaN(bNum) && String(aNum) === String(aVal) && String(bNum) === String(bVal)) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // 3. String Sort (Default, handles Dates too)
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      if (direction === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  },

  switchViewMode(mode, tableName) {
    this.state.viewMode = mode;
    localStorage.setItem('viewMode', mode);
    
    if (!Router.isNavigatingHistory) {
      Router.push(Router.buildState('table', { table: tableName }));
    }
    this.renderCurrentData(tableName);
  },

  sortTableColumn(column, tableName) {
    if (this.state.sortColumn === column) {
      this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortColumn = column;
      this.state.sortDirection = 'asc';
    }

    if (!Router.isNavigatingHistory) {
      Router.push(Router.buildState('table', { table: tableName }));
    }
    this.renderCurrentData(tableName);
  },

  async viewRecordDetails(tableName, recordId, restoring = false) {
    try {
      const result = await API.getRecord(tableName, recordId);
      
      if (!Router.isNavigatingHistory && !restoring) {
        Router.push(Router.buildState('record', { table: tableName, id: recordId }));
      }
      
      document.getElementById('mainContent').innerHTML = UI.renderRecordDetails(result.record, tableName, result.relationships);
    } catch (err) {
      document.getElementById('mainContent').innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
  },
  
  async performSearch() {
    const query = document.getElementById('searchInput').value;
    this.performSearchWithQuery(query);
  },

  async performSearchWithQuery(query, restoring = false) {
    if (!query || query.length < 2) {
      alert('Search term too short');
      return;
    }

    try {
      document.getElementById('mainContent').innerHTML = '<div class="loading">Searching...</div>';
      const result = await API.search(query);

      if (!Router.isNavigatingHistory && !restoring) {
        Router.push(Router.buildState('search', { query: query }));
      }

      document.getElementById('mainContent').innerHTML = UI.renderSearchResults(query, result.results, result.totalMatches);
    } catch (err) {
      document.getElementById('mainContent').innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
  },

  /**
   * Tab Switching between Database and Files
   */
  async switchTab(mode) {
    this.state.mode = mode;

    // Update tab button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === mode) {
        btn.classList.add('active');
      }
    });

    // Update search placeholder
    const searchInput = document.getElementById('searchInput');
    if (mode === 'database') {
      searchInput.placeholder = 'Search across all tables...';
      document.getElementById('sidebarTitle').textContent = 'Tables';
      await this.loadTables();
    } else {
      searchInput.placeholder = 'Search files...';
      document.getElementById('sidebarTitle').textContent = 'Categories';
      await this.loadFileCategories();
    }

    // Push state for navigation
    if (!Router.isNavigatingHistory) {
      Router.push(Router.buildState('tab', { mode: mode }));
    }
  },

  /**
   * File Browser Methods
   */
  async loadFileCategories() {
    try {
      this.fileCategories = await API.getMemoryBankFiles();
      const navList = document.getElementById('navList');
      navList.innerHTML = UI.renderFileCategories(this.fileCategories, this.currentCategory);

      // Select first category by default if none selected
      if (!this.currentCategory) {
        const firstCategory = Object.keys(this.fileCategories)[0];
        if (firstCategory) {
          this.selectFileCategory(firstCategory);
        }
      }
    } catch (err) {
      console.error("Failed to load file categories", err);
      document.getElementById('mainContent').innerHTML = `<div class="error">Error loading files: ${err.message}</div>`;
    }
  },

  async selectFileCategory(categoryKey, event) {
    this.currentCategory = categoryKey;
    this.currentFile = null;

    // Update sidebar selection
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active');
    } else {
      // Programmatic selection
      const items = document.querySelectorAll('.category-item');
      for (let item of items) {
        if (item.textContent.includes(this.fileCategories[categoryKey].name)) {
          item.classList.add('active');
          break;
        }
      }
    }

    // Push state for navigation
    if (!Router.isNavigatingHistory && event) {
      Router.push(Router.buildState('fileCategory', { category: categoryKey }));
    }

    // Display file list
    const category = this.fileCategories[categoryKey];
    const files = category.files || [];

    let html = `
      <h2>${category.icon} ${category.name}</h2>
      <div class="file-category-info">
        <span>${files.length} files</span>
      </div>
    `;
    html += UI.renderFileList(category, files, this.currentFile);

    document.getElementById('mainContent').innerHTML = html;
  },

  async viewFile(filePath, event) {
    try {
      this.currentFile = filePath;

      // Update file list selection
      document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
      if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
      }

      // Push state for navigation
      if (!Router.isNavigatingHistory && event) {
        Router.push(Router.buildState('file', { category: this.currentCategory, file: filePath }));
      }

      document.getElementById('mainContent').innerHTML = '<div class="loading">Loading file...</div>';

      const file = await API.getMemoryBankFile(filePath);
      document.getElementById('mainContent').innerHTML = UI.renderFileViewer(file);
    } catch (err) {
      console.error("Failed to load file", err);
      document.getElementById('mainContent').innerHTML = `<div class="error">Error loading file: ${err.message}</div>`;
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Expose App globally
window.App = App;
