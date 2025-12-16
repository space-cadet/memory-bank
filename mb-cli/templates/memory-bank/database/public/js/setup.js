/**
 * Setup Wizard for Memory Bank Initialization
 * Guides users through the process of creating a new memory bank
 */

const SetupWizard = {
  currentStep: 1,
  selectedFolder: null,
  setupOptions: {
    includeDatabase: true,
    includeTemplates: true,
    importEditHistory: false
  },
  foldersList: [],
  existingData: {},

  /**
   * Initialize the setup wizard
   */
  async init() {
    try {
      const status = await API.getSetupStatus();

      if (status.isInitialized) {
        // Memory bank already initialized, show main app
        App.switchAppMode('viewer');
        await App.loadCurrentDb();
        await App.loadTables();
      } else {
        // Show setup wizard
        this.show();
      }
    } catch (err) {
      console.error('Setup init failed:', err);
      this.showError('Failed to check setup status: ' + err.message);
    }
  },

  /**
   * Display the setup wizard
   */
  async show() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Hide header navigation elements
    const header = document.querySelector('header');
    const appTabNav = document.getElementById('appTabNav');
    const modeTabNav = document.getElementById('modeTabNav');
    const dbPickerBar = document.getElementById('dbPickerBar');
    const searchBar = document.querySelector('.search-bar');
    const sidebar = document.getElementById('sidebar');

    if (appTabNav) appTabNav.style.display = 'none';
    if (modeTabNav) modeTabNav.style.display = 'none';
    if (dbPickerBar) dbPickerBar.style.display = 'none';
    if (searchBar) searchBar.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';

    // Load folders
    try {
      const result = await API.listFolders();
      this.foldersList = result.folders || [];
    } catch (err) {
      console.error('Failed to load folders:', err);
    }

    mainContent.innerHTML = this.renderWizard();
  },

  /**
   * Render the complete wizard UI
   */
  renderWizard() {
    return `
      <div class="setup-wizard">
        <div class="setup-container">
          <div class="setup-header">
            <h1>🏗️ Initialize Memory Bank</h1>
            <p>Set up your project's documentation and context management system</p>
          </div>

          <div class="setup-steps">
            ${this.renderStep1()}
            ${this.renderStep2()}
            ${this.renderStep3()}
            ${this.renderStep4()}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Step 1: Select folder
   */
  renderStep1() {
    const completed = this.currentStep > 1;
    const active = this.currentStep === 1;

    return `
      <div class="setup-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}">
        <div class="step-header">
          <div class="step-number">${completed ? '✓' : '1'}</div>
          <div class="step-title">Select Project Folder</div>
        </div>
        <div class="step-description">
          Choose which folder in your project should host the memory bank
        </div>

        ${active ? `
          <div class="step-content">
            <div class="info-box">
              <strong>💡 Tip:</strong> The memory bank will be created under
              <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">your-project/memory-bank/</code>
            </div>

            <div class="folder-selection">
              <div class="form-label">Available Folders</div>
              <div class="folder-list">
                ${this.foldersList.map(folder => `
                  <div class="folder-item ${this.selectedFolder === folder.name ? 'selected' : ''}"
                       onclick="SetupWizard.selectFolder('${folder.name}')">
                    📁 ${folder.name}
                  </div>
                `).join('')}
              </div>
              ${this.foldersList.length === 0 ? `
                <div class="info-box">No folders found. The memory bank will be created in the project root.</div>
              ` : ''}
            </div>

            <div class="button-group">
              <div></div>
              <button class="btn btn-primary" onclick="SetupWizard.nextStep()"
                      ${!this.selectedFolder && this.foldersList.length > 0 ? 'disabled' : ''}>
                Next: Check Existing Data →
              </button>
            </div>
          </div>
        ` : `
          <div style="color: var(--text-secondary); font-size: 14px;">
            Selected: <strong>${this.selectedFolder || 'project root'}</strong>
          </div>
        `}
      </div>
    `;
  },

  /**
   * Step 2: Check for existing data
   */
  renderStep2() {
    const completed = this.currentStep > 2;
    const active = this.currentStep === 2;

    return `
      <div class="setup-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}">
        <div class="step-header">
          <div class="step-number">${completed ? '✓' : '2'}</div>
          <div class="step-title">Check Existing Data</div>
        </div>
        <div class="step-description">
          We'll check if there's any existing memory bank data to preserve
        </div>

        ${active ? `
          <div class="step-content" id="step2Content">
            <div class="loading">🔍 Scanning for existing data...</div>
          </div>
        ` : (this.currentStep > 2 ? `
          <div style="color: var(--text-secondary); font-size: 14px;">
            ${this.existingData.memoryBankExists ? '✓ Memory bank files found' : '• No existing memory bank'}
            ${this.existingData.hasEditHistory ? '<br/>✓ edit_history.md detected' : ''}
          </div>
        ` : '')}
      </div>
    `;
  },

  /**
   * Step 3: Configure options
   */
  renderStep3() {
    const completed = this.currentStep > 3;
    const active = this.currentStep === 3;

    return `
      <div class="setup-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}">
        <div class="step-header">
          <div class="step-number">${completed ? '✓' : '3'}</div>
          <div class="step-title">Configure Setup</div>
        </div>
        <div class="step-description">
          Choose what components to include in your memory bank
        </div>

        ${active ? `
          <div class="step-content">
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" id="optTemplates" ${this.setupOptions.includeTemplates ? 'checked' : ''}
                       onchange="SetupWizard.setupOptions.includeTemplates = this.checked; SetupWizard.updateStep3();">
                <span style="flex: 1;">
                  <div class="checkbox-label">📄 Include Template Files</div>
                  <div class="checkbox-description">Core documentation templates (tasks.md, activeContext.md, etc.)</div>
                </span>
              </label>

              <label class="checkbox-item">
                <input type="checkbox" id="optDatabase" ${this.setupOptions.includeDatabase ? 'checked' : ''}
                       onchange="SetupWizard.setupOptions.includeDatabase = this.checked; SetupWizard.updateStep3();">
                <span style="flex: 1;">
                  <div class="checkbox-label">💾 Include Database Viewer</div>
                  <div class="checkbox-description">SQLite database schema and web viewer interface</div>
                </span>
              </label>

              ${this.existingData.hasEditHistory ? `
                <label class="checkbox-item">
                  <input type="checkbox" id="optImport" ${this.setupOptions.importEditHistory ? 'checked' : ''}
                         onchange="SetupWizard.setupOptions.importEditHistory = this.checked; SetupWizard.updateStep3();">
                  <span style="flex: 1;">
                    <div class="checkbox-label">📥 Import edit_history.md</div>
                    <div class="checkbox-description">Load existing edit history into the database</div>
                  </span>
                </label>
              ` : ''}
            </div>

            <div class="setup-summary">
              <div class="summary-title">Setup Summary</div>
              <div class="summary-item">
                <span class="summary-label">Templates:</span>
                <span class="summary-value">${this.setupOptions.includeTemplates ? '✓ Yes' : '○ No'}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Database:</span>
                <span class="summary-value">${this.setupOptions.includeDatabase ? '✓ Yes' : '○ No'}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Import History:</span>
                <span class="summary-value">${this.setupOptions.importEditHistory ? '✓ Yes' : '○ No'}</span>
              </div>
            </div>

            <div class="button-group">
              <button class="btn btn-secondary" onclick="SetupWizard.previousStep()">
                ← Back
              </button>
              <button class="btn btn-primary" onclick="SetupWizard.nextStep()">
                Next: Initialize →
              </button>
            </div>
          </div>
        ` : (this.currentStep > 3 ? `
          <div style="color: var(--text-secondary); font-size: 14px;">
            Templates: ${this.setupOptions.includeTemplates ? '✓' : '○'} •
            Database: ${this.setupOptions.includeDatabase ? '✓' : '○'} •
            Import: ${this.setupOptions.importEditHistory ? '✓' : '○'}
          </div>
        ` : '')}
      </div>
    `;
  },

  /**
   * Step 4: Initialize and show results
   */
  renderStep4() {
    const active = this.currentStep === 4;

    return `
      <div class="setup-step ${active ? 'active' : ''}">
        <div class="step-header">
          <div class="step-number">4</div>
          <div class="step-title">Initialize Memory Bank</div>
        </div>
        <div class="step-description">
          Setting up your memory bank with the selected options
        </div>

        ${active ? `
          <div class="step-content" id="step4Content">
            <div class="loading">⏳ Initializing your memory bank...</div>
            <div id="initProgress" style="margin-top: 20px;"></div>
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Handle folder selection
   */
  selectFolder(folderName) {
    this.selectedFolder = folderName;
    const items = document.querySelectorAll('.folder-item');
    items.forEach(item => {
      item.classList.toggle('selected', item.textContent.includes(folderName));
    });
  },

  /**
   * Move to next step
   */
  async nextStep() {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      // Re-render and then check existing data
      const mainContent = document.getElementById('mainContent');
      mainContent.innerHTML = this.renderWizard();
      await this.checkExistingData();
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
      const mainContent = document.getElementById('mainContent');
      mainContent.innerHTML = this.renderWizard();
    } else if (this.currentStep === 3) {
      this.currentStep = 4;
      const mainContent = document.getElementById('mainContent');
      mainContent.innerHTML = this.renderWizard();
      await this.initializeMemoryBank();
    }
  },

  /**
   * Move to previous step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      const mainContent = document.getElementById('mainContent');
      mainContent.innerHTML = this.renderWizard();
    }
  },

  /**
   * Check for existing data in the selected folder
   */
  async checkExistingData() {
    const step2Content = document.getElementById('step2Content');
    if (!step2Content) return;

    try {
      const folderPath = this.selectedFolder || '.';
      const result = await API.checkExistingData(folderPath);
      this.existingData = result;

      let html = '';
      if (result.hasEditHistory) {
        html += `
          <div class="success-message">
            ✓ Found edit_history.md with ${result.editHistorySummary?.dates || 0} date entries
          </div>
        `;
      }

      if (result.hasTasks) {
        html += `
          <div class="success-message">
            ✓ Found existing tasks.md file
          </div>
        `;
      }

      if (!result.hasEditHistory && !result.hasTasks) {
        html += `
          <div class="info-box">
            No existing memory bank data detected. A fresh memory bank will be created.
          </div>
        `;
      }

      html += `
        <div class="button-group" style="margin-top: 20px;">
          <button class="btn btn-secondary" onclick="SetupWizard.previousStep()">
            ← Back
          </button>
          <button class="btn btn-primary" onclick="SetupWizard.nextStep()">
            Next: Configure Options →
          </button>
        </div>
      `;

      step2Content.innerHTML = html;
    } catch (err) {
      console.error('Failed to check existing data:', err);
      step2Content.innerHTML = `
        <div class="error">Failed to check existing data: ${err.message}</div>
      `;
    }
  },

  /**
   * Update step 3 rendering
   */
  updateStep3() {
    const step3 = document.querySelector('.setup-step:nth-of-type(3)');
    if (step3) {
      const summarySection = step3.querySelector('.setup-summary');
      if (summarySection) {
        summarySection.innerHTML = `
          <div class="summary-title">Setup Summary</div>
          <div class="summary-item">
            <span class="summary-label">Templates:</span>
            <span class="summary-value">${this.setupOptions.includeTemplates ? '✓ Yes' : '○ No'}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Database:</span>
            <span class="summary-value">${this.setupOptions.includeDatabase ? '✓ Yes' : '○ No'}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Import History:</span>
            <span class="summary-value">${this.setupOptions.importEditHistory ? '✓ Yes' : '○ No'}</span>
          </div>
        `;
      }
    }
  },

  /**
   * Initialize the memory bank
   */
  async initializeMemoryBank() {
    const step4Content = document.getElementById('step4Content');
    if (!step4Content) return;

    try {
      const folderPath = this.selectedFolder || '.';
      const options = {
        folderPath,
        includeDatabase: this.setupOptions.includeDatabase,
        includeTemplates: this.setupOptions.includeTemplates,
        importEditHistory: this.setupOptions.importEditHistory
      };

      const result = await API.initializeMemoryBank(options);

      if (result.error) {
        throw new Error(result.error);
      }

      // Render success
      let html = `
        <div class="success-message" style="font-size: 16px; padding: 20px;">
          ✓ Memory Bank Initialized Successfully!
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: var(--text-primary); margin-bottom: 15px;">Created Components:</h3>
          <div id="progressList" style="max-height: 300px; overflow-y: auto;">
      `;

      // Show created directories
      if (result.results.dirsCreated.length > 0) {
        html += `<div style="margin-bottom: 10px; color: var(--text-secondary); font-size: 12px; font-weight: 500;">DIRECTORIES (${result.results.dirsCreated.length})</div>`;
        result.results.dirsCreated.forEach(dir => {
          html += `<div class="progress-item"><span class="progress-icon success">✓</span> ${dir}</div>`;
        });
      }

      // Show created files
      if (result.results.filesCreated.length > 0) {
        html += `<div style="margin-top: 15px; margin-bottom: 10px; color: var(--text-secondary); font-size: 12px; font-weight: 500;">FILES (${result.results.filesCreated.length})</div>`;
        result.results.filesCreated.forEach(file => {
          html += `<div class="progress-item"><span class="progress-icon success">✓</span> ${file}</div>`;
        });
      }

      // Show errors if any
      if (result.results.errors.length > 0) {
        html += `<div style="margin-top: 15px; margin-bottom: 10px; color: var(--text-secondary); font-size: 12px; font-weight: 500;">ISSUES (${result.results.errors.length})</div>`;
        result.results.errors.forEach(error => {
          html += `<div class="progress-item"><span class="progress-icon error">⚠</span> ${error}</div>`;
        });
      }

      html += `
          </div>
        </div>

        <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                    border: 2px solid var(--bg-gradient-1);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;">
          <h4 style="color: var(--text-primary); margin-bottom: 10px;">🎉 What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 14px;">
            <li>Access the <strong>Viewer</strong> tab to browse your memory bank files</li>
            <li>Use the <strong>Editor</strong> tab to manage the database</li>
            <li>Start documenting your project in the memory bank</li>
            <li>Import existing data if you have it</li>
          </ul>
        </div>

        <div class="button-group" style="margin-top: 30px;">
          <div></div>
          <button class="btn btn-primary" onclick="SetupWizard.complete()">
            ✓ Start Using Memory Bank
          </button>
        </div>
      `;

      step4Content.innerHTML = html;
    } catch (err) {
      console.error('Initialization failed:', err);
      step4Content.innerHTML = `
        <div class="error" style="margin-bottom: 20px;">
          <strong>Initialization Failed:</strong> ${err.message}
        </div>
        <div class="button-group">
          <button class="btn btn-secondary" onclick="SetupWizard.previousStep()">
            ← Try Again
          </button>
        </div>
      `;
    }
  },

  /**
   * Complete setup and transition to main app
   */
  async complete() {
    try {
      // Reload app status
      const status = await API.getSetupStatus();
      if (status.isInitialized) {
        // Show main app
        const mainContent = document.getElementById('mainContent');
        const appTabNav = document.getElementById('appTabNav');
        const modeTabNav = document.getElementById('modeTabNav');
        const dbPickerBar = document.getElementById('dbPickerBar');
        const searchBar = document.querySelector('.search-bar');
        const sidebar = document.getElementById('sidebar');

        if (appTabNav) appTabNav.style.display = '';
        if (modeTabNav) modeTabNav.style.display = '';
        if (dbPickerBar) dbPickerBar.style.display = '';
        if (searchBar) searchBar.style.display = '';
        if (sidebar) sidebar.style.display = '';

        App.state.appMode = 'viewer';
        App.state.mode = 'files';

        mainContent.innerHTML = '<div class="loading">Loading memory bank viewer...</div>';

        // Load the files view
        await App.loadMemoryBankFiles();
        App.switchTab('files');

        return;
      }
    } catch (err) {
      console.error('Failed to complete setup:', err);
    }

    // Fallback: reload page
    window.location.reload();
  },

  /**
   * Show error message
   */
  showError(message) {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="max-width: 600px; margin: 40px auto;">
          <div class="error" style="font-size: 16px; padding: 20px;">
            <strong>Setup Error:</strong> ${message}
          </div>
        </div>
      `;
    }
  }
};

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SetupWizard.init());
  } else {
    SetupWizard.init();
  }
});
