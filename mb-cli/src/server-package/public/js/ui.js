/**
 * UI Rendering Functions
 */
const UI = {
  escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  renderStats(stats) {
    return `
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${stats.tableCount}</div>
          <div class="stat-label">Tables</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalRows}</div>
          <div class="stat-label">Total Rows</div>
        </div>
      </div>
    `;
  },

  renderTasksImportPreview(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Preview failed')}</div>`;
    }

    const rows = (result.tasks || []).map(t => {
      return `<div class="field" style="margin-top: 6px;">
        <span class="field-name">${this.escapeHtml(t.id)} (${this.escapeHtml(t.status)}/${this.escapeHtml(t.priority)})</span>
        <span class="field-value">${this.escapeHtml(t.title)} (${this.escapeHtml(String(t.dependency_count || 0))} deps)</span>
      </div>`;
    }).join('');

    return `
      <div class="meta">Source: ${this.escapeHtml(result.source)} | Total: ${this.escapeHtml(String(result.totalTasks || 0))}</div>
      ${rows || '<div class="empty">No tasks</div>'}
    `;
  },

  renderTasksImportRunResult(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Import failed')}</div>`;
    }

    return `
      <div class="meta">Imported tasks from ${this.escapeHtml(result.source)} into ${this.escapeHtml(result.dbPath)}</div>
      <div class="schema-grid" style="margin-top: 10px;">
        <div class="schema-item"><strong>mode:</strong> <code>${this.escapeHtml(result.mode)}</code></div>
        <div class="schema-item"><strong>tasksParsed:</strong> <code>${this.escapeHtml(String(result.tasksParsed))}</code></div>
        <div class="schema-item"><strong>tasksInserted:</strong> <code>${this.escapeHtml(String(result.tasksInserted))}</code></div>
        <div class="schema-item"><strong>depsInserted:</strong> <code>${this.escapeHtml(String(result.depsInserted))}</code></div>
      </div>
    `;
  },

  renderSessionsImportPreview(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Preview failed')}</div>`;
    }

    const rows = (result.sessions || []).map(s => {
      return `<div class="field" style="margin-top: 6px;">
        <span class="field-name">${this.escapeHtml(s.session_date)} ${this.escapeHtml(s.session_period)}</span>
        <span class="field-value">${this.escapeHtml(String(s.focus_task || ''))}</span>
      </div>`;
    }).join('');

    return `
      <div class="meta">Dir: ${this.escapeHtml(result.dir)} | Files: ${this.escapeHtml(String(result.totalFiles || 0))}</div>
      ${rows || '<div class="empty">No sessions</div>'}
    `;
  },

  renderSessionsImportRunResult(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Import failed')}</div>`;
    }

    return `
      <div class="meta">Imported sessions from ${this.escapeHtml(result.dir)} into ${this.escapeHtml(result.dbPath)}</div>
      <div class="schema-grid" style="margin-top: 10px;">
        <div class="schema-item"><strong>mode:</strong> <code>${this.escapeHtml(result.mode)}</code></div>
        <div class="schema-item"><strong>filesFound:</strong> <code>${this.escapeHtml(String(result.filesFound))}</code></div>
        <div class="schema-item"><strong>sessionsInserted:</strong> <code>${this.escapeHtml(String(result.sessionsInserted))}</code></div>
      </div>
    `;
  },

  renderSessionCacheImportPreview(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Preview failed')}</div>`;
    }

    return `
      <div class="meta">Source: ${this.escapeHtml(result.source)}</div>
      <div class="schema-grid" style="margin-top: 10px;">
        <div class="schema-item"><strong>current_focus_task:</strong> <code>${this.escapeHtml(String(result.current_focus_task || ''))}</code></div>
        <div class="schema-item"><strong>active_count:</strong> <code>${this.escapeHtml(String(result.active_count))}</code></div>
        <div class="schema-item"><strong>paused_count:</strong> <code>${this.escapeHtml(String(result.paused_count))}</code></div>
        <div class="schema-item"><strong>completed_count:</strong> <code>${this.escapeHtml(String(result.completed_count))}</code></div>
      </div>
    `;
  },

  renderSessionCacheImportRunResult(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Import failed')}</div>`;
    }

    return `
      <div class="meta">Imported session_cache from ${this.escapeHtml(result.source)} into ${this.escapeHtml(result.dbPath)}</div>
      <div class="schema-grid" style="margin-top: 10px;">
        <div class="schema-item"><strong>mode:</strong> <code>${this.escapeHtml(result.mode)}</code></div>
        <div class="schema-item"><strong>current_focus_task:</strong> <code>${this.escapeHtml(String(result.current_focus_task || ''))}</code></div>
        <div class="schema-item"><strong>active_count:</strong> <code>${this.escapeHtml(String(result.active_count))}</code></div>
        <div class="schema-item"><strong>paused_count:</strong> <code>${this.escapeHtml(String(result.paused_count))}</code></div>
        <div class="schema-item"><strong>completed_count:</strong> <code>${this.escapeHtml(String(result.completed_count))}</code></div>
      </div>
    `;
  },

  renderTableList(tables, currentTable) {
    return tables.map(table => `
      <li class="table-item ${table.name === currentTable ? 'active' : ''}" onclick="App.selectTable('${table.name}', event)">
        <div class="table-name">📋 ${table.name}</div>
        <div class="table-meta">${table.rowCount} rows • ${table.columnCount} columns</div>
      </li>
    `).join('');
  },

  renderTableHeader(tableName, start, end, total, totalAll, columnCount) {
    let meta = `${start} - ${end} of ${total} • ${columnCount} columns`;
    if (typeof totalAll === 'number' && totalAll !== total) {
      meta = `${start} - ${end} of ${total} (filtered from ${totalAll}) • ${columnCount} columns`;
    }

    return `
      <h2>${tableName}</h2>
      <div class="table-header">
        <div>
          <div class="meta">${meta}</div>
        </div>
      </div>
    `;
  },

  renderViewControls(tableName, currentViewMode, currentFilter) {
    return `
      <div class="view-controls">
        <div class="view-toggle">
          <button class="view-btn ${currentViewMode === 'card' ? 'active' : ''}" onclick="App.switchViewMode('card', '${tableName}')">📇 Cards</button>
          <button class="view-btn ${currentViewMode === 'table' ? 'active' : ''}" onclick="App.switchViewMode('table', '${tableName}')">📊 Table</button>
        </div>
        <div class="table-filter">
          <input type="text" id="tableFilter" placeholder="Filter records..." onkeyup="App.applyTableFilter('${tableName}')" value="${this.escapeHtml(currentFilter || '')}" />
        </div>
      </div>
    `;
  },

  renderCardView(data, tableName) {
    if (data.length === 0) return '<div class="no-results">No records found</div>';
    
    let html = '<div class="records">';
    data.forEach(record => {
      const firstValue = Object.values(record)[0];
      html += `
        <div class="record-card" onclick="App.viewRecordDetails('${tableName}', '${firstValue}')">
          <div class="record-id">ID: ${firstValue}</div>
          <div class="record-fields">
            ${Object.entries(record).slice(0, 4).map(([k, v]) => `
              <div class="field">
                <span class="field-name">${k}:</span>
                <span class="field-value">${this.escapeHtml(String(v).substring(0, 50))}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  },

  renderEditorHome({ currentDbPath, defaultDbDir }) {
    const dbLabel = currentDbPath ? this.escapeHtml(currentDbPath) : '(none)';
    const suggested = `${String(defaultDbDir || 'memory-bank/database').replace(/\/$/, '')}/import_test.db`;

    return `
      <h2>Editor</h2>
      <div class="meta" style="margin-bottom: 16px;">Current DB: ${dbLabel}</div>

      <div class="record-card" style="cursor: default;">
        <h3 style="margin-top: 0;">Create Database</h3>
        <div class="field" style="margin-top: 10px;">
          <span class="field-name">dbPath (under project):</span>
          <input id="editorCreateDbPath" type="text" style="width: 100%; margin-top: 6px;" value="${this.escapeHtml(suggested)}" />
        </div>
        <div style="margin-top: 10px;">
          <button onclick="App.editorCreateDb()">Create (Phase A schema)</button>
        </div>
      </div>

      <div class="record-card" style="cursor: default; margin-top: 16px;">
        <h3 style="margin-top: 0;">Import edit_history</h3>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Target DB (optional):</span>
          <input id="importTargetDbPath" type="text" style="width: 100%; margin-top: 6px;" placeholder="(uses current DB if empty)" />
        </div>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Source file (under memory-bank/):</span>
          <input id="importSourcePath" type="text" style="width: 100%; margin-top: 6px;" value="edit_history.md" />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <div style="flex: 1;">
            <div class="field-name">From date (optional)</div>
            <input id="importFromDate" type="text" style="width: 100%; margin-top: 6px;" placeholder="YYYY-MM-DD" />
          </div>
          <div style="flex: 1;">
            <div class="field-name">To date (optional)</div>
            <input id="importToDate" type="text" style="width: 100%; margin-top: 6px;" placeholder="YYYY-MM-DD" />
          </div>
        </div>

        <div style="margin-top: 10px;">
          <label class="field-name">Mode</label>
          <select id="importMode" style="width: 100%; margin-top: 6px;">
            <option value="append">append</option>
            <option value="replace">replace</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button onclick="App.editorPreviewImportEditHistory()">Preview</button>
          <button onclick="App.editorRunImportEditHistory()">Run Import</button>
        </div>

        <div id="importPreview" style="margin-top: 12px;"></div>
        <div id="importRunResult" style="margin-top: 12px;"></div>
      </div>

      <div class="record-card" style="cursor: default; margin-top: 16px;">
        <h3 style="margin-top: 0;">Import tasks</h3>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Target DB (optional):</span>
          <input id="importTasksTargetDbPath" type="text" style="width: 100%; margin-top: 6px;" placeholder="(uses current DB if empty)" />
        </div>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Source file (under memory-bank/):</span>
          <input id="importTasksSourcePath" type="text" style="width: 100%; margin-top: 6px;" value="tasks.md" />
        </div>

        <div style="margin-top: 10px;">
          <label class="field-name">Mode</label>
          <select id="importTasksMode" style="width: 100%; margin-top: 6px;">
            <option value="append">append</option>
            <option value="replace">replace</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button onclick="App.editorPreviewImportTasks()">Preview</button>
          <button onclick="App.editorRunImportTasks()">Run Import</button>
        </div>

        <div id="importTasksPreview" style="margin-top: 12px;"></div>
        <div id="importTasksRunResult" style="margin-top: 12px;"></div>
      </div>

      <div class="record-card" style="cursor: default; margin-top: 16px;">
        <h3 style="margin-top: 0;">Import sessions</h3>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Target DB (optional):</span>
          <input id="importSessionsTargetDbPath" type="text" style="width: 100%; margin-top: 6px;" placeholder="(uses current DB if empty)" />
        </div>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Sessions folder (under memory-bank/):</span>
          <input id="importSessionsDir" type="text" style="width: 100%; margin-top: 6px;" value="sessions" />
        </div>

        <div style="margin-top: 10px;">
          <label class="field-name">Mode</label>
          <select id="importSessionsMode" style="width: 100%; margin-top: 6px;">
            <option value="append">append</option>
            <option value="replace">replace</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button onclick="App.editorPreviewImportSessions()">Preview</button>
          <button onclick="App.editorRunImportSessions()">Run Import</button>
        </div>

        <div id="importSessionsPreview" style="margin-top: 12px;"></div>
        <div id="importSessionsRunResult" style="margin-top: 12px;"></div>
      </div>

      <div class="record-card" style="cursor: default; margin-top: 16px;">
        <h3 style="margin-top: 0;">Import session_cache</h3>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Target DB (optional):</span>
          <input id="importSessionCacheTargetDbPath" type="text" style="width: 100%; margin-top: 6px;" placeholder="(uses current DB if empty)" />
        </div>

        <div class="field" style="margin-top: 10px;">
          <span class="field-name">Source file (under memory-bank/):</span>
          <input id="importSessionCacheSourcePath" type="text" style="width: 100%; margin-top: 6px;" value="session_cache.md" />
        </div>

        <div style="margin-top: 10px;">
          <label class="field-name">Mode</label>
          <select id="importSessionCacheMode" style="width: 100%; margin-top: 6px;">
            <option value="replace">replace</option>
            <option value="append">append</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button onclick="App.editorPreviewImportSessionCache()">Preview</button>
          <button onclick="App.editorRunImportSessionCache()">Run Import</button>
        </div>

        <div id="importSessionCachePreview" style="margin-top: 12px;"></div>
        <div id="importSessionCacheRunResult" style="margin-top: 12px;"></div>
      </div>
    `;
  },

  renderImportPreview(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Preview failed')}</div>`;
    }

    const rows = (result.entries || []).map(e => {
      const tz = e.timezone ? ` ${this.escapeHtml(e.timezone)}` : '';
      const task = e.task_id ? `${this.escapeHtml(e.task_id)}: ` : '';
      return `<div class="field" style="margin-top: 6px;">
        <span class="field-name">${this.escapeHtml(e.date)} ${this.escapeHtml(e.time)}${tz}</span>
        <span class="field-value">${task}${this.escapeHtml(e.task_description)} (${e.modification_count})</span>
      </div>`;
    }).join('');

    return `
      <div class="meta">Source: ${this.escapeHtml(result.source)} | Total: ${result.totalEntries}</div>
      ${rows || '<div class="empty">No entries</div>'}
    `;
  },

  renderImportRunResult(result) {
    if (!result || result.error) {
      return `<div class="error">${this.escapeHtml((result && result.error) || 'Import failed')}</div>`;
    }

    return `
      <div class="meta">Imported from ${this.escapeHtml(result.source)} into ${this.escapeHtml(result.dbPath)}</div>
      <div class="schema-grid" style="margin-top: 10px;">
        <div class="schema-item"><strong>mode:</strong> <code>${this.escapeHtml(result.mode)}</code></div>
        <div class="schema-item"><strong>filteredEntries:</strong> <code>${this.escapeHtml(String(result.filteredEntries))}</code></div>
        <div class="schema-item"><strong>entriesInserted:</strong> <code>${this.escapeHtml(String(result.entriesInserted))}</code></div>
        <div class="schema-item"><strong>modificationsInserted:</strong> <code>${this.escapeHtml(String(result.modificationsInserted))}</code></div>
      </div>
    `;
  },

  renderTableView(data, tableName, sortColumn, sortDirection) {
    if (data.length === 0) return '<div class="no-results">No records to display</div>';

    const columns = Object.keys(data[0]);
    let html = '<table class="table-view"><thead><tr>';

    columns.forEach(col => {
      const isSorted = sortColumn === col;
      const sortClass = isSorted ? (sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc') : '';
      html += `<th class="sortable ${sortClass}" onclick="App.sortTableColumn('${col}', '${tableName}')">${this.escapeHtml(col)}</th>`;
    });

    html += '</tr></thead><tbody>';

    data.forEach(record => {
      const firstValue = Object.values(record)[0];
      html += `<tr onclick="App.viewRecordDetails('${tableName}', '${firstValue}')">`;
      columns.forEach(col => {
        const value = record[col];
        html += `<td>${this.escapeHtml(String(value).substring(0, 100))}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  },

  renderPagination(pagination, tableName, pageSize) {
    const total = pagination.total || 0;
    const limit = pagination.limit || pageSize || 50;
    const offset = pagination.offset || 0;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(pages, Math.floor(offset / limit) + 1);

    const disabledFirstPrev = currentPage <= 1 ? 'disabled' : '';
    const disabledNextLast = currentPage >= pages ? 'disabled' : '';

    let html = '<div class="pagination-controls">';

    html += `<button class="pagination-btn" ${disabledFirstPrev} onclick="App.goToFirstPage('${tableName}')">&lt;&lt;</button>`;
    html += `<button class="pagination-btn" ${disabledFirstPrev} onclick="App.goToPrevPage('${tableName}')">&lt;</button>`;

    // Page dropdown
    html += `<select class="page-select" onchange="App.goToPage('${tableName}', this.value)">`;
    for (let p = 1; p <= pages; p++) {
      const selected = p === currentPage ? 'selected' : '';
      html += `<option value="${p}" ${selected}>${p}/${pages}</option>`;
    }
    html += `</select>`;

    html += `<button class="pagination-btn" ${disabledNextLast} onclick="App.goToNextPage('${tableName}')">&gt;</button>`;
    html += `<button class="pagination-btn" ${disabledNextLast} onclick="App.goToLastPage('${tableName}', ${total})">&gt;&gt;</button>`;

    // Page size dropdown
    const sizes = [10, 20, 50, 100];
    html += `<select class="page-size-select" onchange="App.changePageSize('${tableName}', this.value)">`;
    for (const s of sizes) {
      const selected = s === (pageSize || limit) ? 'selected' : '';
      html += `<option value="${s}" ${selected}>${s}/page</option>`;
    }
    html += `</select>`;

    html += '</div>';
    return html;
  },

  renderRecordDetails(record, tableName, relationships) {
    let html = `<h2>Record Details: ${tableName}</h2>`;
    html += '<div class="schema-grid">';

    Object.entries(record).forEach(([k, v]) => {
      html += `
        <div class="schema-item">
          <strong>${k}:</strong> <code>${this.escapeHtml(String(v))}</code>
        </div>
      `;
    });

    html += '</div>';

    if (Object.keys(relationships).length > 0) {
      html += `<h3 style="margin-top: 30px; color: var(--text-primary);">Related Records</h3>`;
      Object.entries(relationships).forEach(([rel, relInfo]) => {
        const records = relInfo.records || relInfo;
        const table = relInfo.table || rel.split(' (')[0];
        const pkColumn = relInfo.pkColumn || 'id';
        
        html += `<h4 style="color: var(--text-secondary); margin-top: 15px;">${rel} (${records.length})</h4>`;
        if (records.length > 0) {
          html += '<div class="records">';
          records.forEach(rec => {
            const recId = rec[pkColumn];
            html += `
              <div class="record-card" onclick="App.viewRecordDetails('${table}', '${recId}')" style="cursor: pointer;">
                <div class="record-fields">
                  ${Object.entries(rec).slice(0, 3).map(([k, v]) => `
                    <div class="field">
                      <span class="field-name">${k}:</span>
                      <span class="field-value">${this.escapeHtml(String(v).substring(0, 40))}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          });
          html += '</div>';
        }
      });
    }
    return html;
  },

  renderSearchResults(query, results, totalMatches) {
    let html = `<h2>Search Results for "${this.escapeHtml(query)}"</h2>`;
    html += `<p style="color: var(--text-secondary); margin-bottom: 20px;">${totalMatches} matches found</p>`;

    if (totalMatches === 0) {
      html += '<div class="empty">No results found</div>';
    } else {
      Object.entries(results).forEach(([table, records]) => {
        html += `<h3>${table} (${records.length})</h3>`;
        html += this.renderCardView(records, table);
      });
    }
    return html;
  },

  /**
   * Memory Bank File Browser UI
   */

  renderFileCategories(categories, currentCategory) {
    let html = '';
    Object.entries(categories).forEach(([key, category]) => {
      const isActive = key === currentCategory ? 'active' : '';
      const fileCount = category.files ? category.files.length : 0;
      html += `
        <li class="category-item ${isActive}" onclick="App.selectFileCategory('${key}', event)">
          <div class="category-name">${category.icon} ${category.name}</div>
          <div class="category-meta">${fileCount} files</div>
        </li>
      `;
    });
    return html;
  },

  renderFileList(category, files, currentFile) {
    if (!files || files.length === 0) {
      return '<div class="no-results">No files in this category</div>';
    }

    let html = '<div class="file-list">';
    files.forEach(file => {
      const isActive = currentFile === file.path ? 'active' : '';
      const sizeKB = (file.size / 1024).toFixed(1);
      const modifiedDate = new Date(file.modified).toLocaleDateString();

      html += `
        <div class="file-item ${isActive}" onclick="App.viewFile('${file.path}', event)">
          <div class="file-header">
            <span class="file-name">📄 ${this.escapeHtml(file.name)}</span>
          </div>
          <div class="file-meta">
            <span>${sizeKB} KB</span>
            <span>•</span>
            <span>${modifiedDate}</span>
          </div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  },

  renderFileViewer(file) {
    let html = `
      <div class="file-viewer">
        <div class="file-viewer-header">
          <h2>📄 ${this.escapeHtml(file.name)}</h2>
          <div class="file-info">
            <span>${(file.size / 1024).toFixed(1)} KB</span>
            <span>•</span>
            <span>${new Date(file.modified).toLocaleString()}</span>
            <span>•</span>
            <span class="file-path">${this.escapeHtml(file.path)}</span>
          </div>
        </div>
        <div class="file-viewer-content">
    `;

    // Check if file is markdown
    if (file.name.endsWith('.md')) {
      // Use marked.js to render markdown
      try {
        const rendered = marked.parse(file.content);
        html += `<div class="markdown-content">${rendered}</div>`;
      } catch (e) {
        // Fallback to plain text if markdown parsing fails
        html += `<pre class="code-content">${this.escapeHtml(file.content)}</pre>`;
      }
    } else if (file.name.endsWith('.js') || file.name.endsWith('.sql') || file.name.endsWith('.json')) {
      // Code files
      html += `<pre class="code-content">${this.escapeHtml(file.content)}</pre>`;
    } else {
      // Plain text
      html += `<pre class="text-content">${this.escapeHtml(file.content)}</pre>`;
    }

    html += `
        </div>
      </div>
    `;
    return html;
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

window.UI = UI;
