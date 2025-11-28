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

  renderTableList(tables, currentTable) {
    return tables.map(table => `
      <li class="table-item ${table.name === currentTable ? 'active' : ''}" onclick="App.selectTable('${table.name}', event)">
        <div class="table-name">📋 ${table.name}</div>
        <div class="table-meta">${table.rowCount} rows • ${table.columnCount} columns</div>
      </li>
    `).join('');
  },

  renderTableHeader(tableName, total, columnCount, filteredCount = null) {
    let meta = `${total} total records • ${columnCount} columns`;
    if (filteredCount !== null) {
      meta = `${filteredCount} of ${total} records • ${columnCount} columns`;
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

  renderPagination(total, limit, offset, tableName) {
    const pages = Math.ceil(total / limit);
    if (pages <= 1) return '';

    let html = '<div class="pagination">';
    // Simple pagination: show up to 10 pages
    for (let i = 0; i < pages && i < 10; i++) {
      const pageOffset = i * limit;
      const isActive = pageOffset === offset ? 'active' : '';
      html += `<button class="${isActive}" onclick="App.loadTableData('${tableName}', ${pageOffset})">Page ${i + 1}</button>`;
    }
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
