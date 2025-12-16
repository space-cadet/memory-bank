/**
 * History and Navigation Router
 * Uses native browser History API
 */
const Router = {
  isNavigatingHistory: false,

  init() {
    window.addEventListener('popstate', (event) => {
      if (event.state) {
        this.restoreState(event.state);
      }
    });
  },

  push(state) {
    if (this.isNavigatingHistory) return;
    
    // Add timestamp for uniqueness
    state.timestamp = Date.now();
    
    window.history.pushState(state, '', '#');
  },

  restoreState(state) {
    this.isNavigatingHistory = true;
    console.log('Restoring state:', state);

    if (state.type === 'tab') {
      // Restore tab mode
      App.switchTab(state.mode);

    } else if (state.type === 'table') {
      // Ensure we're in database mode
      if (App.state.mode !== 'database') {
        App.switchTab('database');
      }

      // Restore view preferences
      if (App.state) {
        App.state.viewMode = state.viewMode || 'card';
        App.state.filter = state.filter || '';
        App.state.sortColumn = state.sortColumn || null;
        App.state.sortDirection = state.sortDirection || 'asc';
      }

      // Update UI selection
      App.selectSidebarItem(state.table);

      // Load data
      App.loadTableData(state.table, 0, true);

    } else if (state.type === 'search') {
      document.getElementById('searchInput').value = state.query;
      App.performSearchWithQuery(state.query, true);

    } else if (state.type === 'record') {
      // Ensure we're in database mode
      if (App.state.mode !== 'database') {
        App.switchTab('database');
      }
      App.viewRecordDetails(state.table, state.id, true);

    } else if (state.type === 'fileCategory') {
      // Ensure we're in files mode
      if (App.state.mode !== 'files') {
        App.switchTab('files');
      }
      App.selectFileCategory(state.category);

    } else if (state.type === 'file') {
      // Ensure we're in files mode
      if (App.state.mode !== 'files') {
        App.switchTab('files');
      }
      // First select the category, then load the file
      App.currentCategory = state.category;
      App.viewFile(state.file);
    }

    this.isNavigatingHistory = false;
  },

  buildState(type, data) {
    const state = {
      type: type,
      ...data
    };

    // Capture current UI state if relevant
    if (type === 'table' && App.state) {
      state.viewMode = App.state.viewMode;
      state.filter = App.state.filter;
      state.sortColumn = App.state.sortColumn;
      state.sortDirection = App.state.sortDirection;
    }

    return state;
  }
};

window.Router = Router;
