#!/usr/bin/env node

/**
 * Approach 2: Dynamic Server with Live File Listing
 *
 * This minimal Node.js HTTP server serves the memory bank viewer
 * and provides a /api/files endpoint that returns a fresh list
 * of all .md files on each request (no caching).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 8000;
const VIEWER_DIR = __dirname;
const MEMORY_BANK_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.venv', '__pycache__'];

// MIME types for common extensions
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

/**
 * Recursively scan directory for markdown files
 */
function scanDirectory(dir, baseDir = MEMORY_BANK_DIR, results = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip excluded directories
      if (entry.isDirectory() && EXCLUDE_DIRS.includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        scanDirectory(fullPath, baseDir, results);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const stat = fs.statSync(fullPath);
          const content = fs.readFileSync(fullPath, 'utf-8');

          // Determine file type
          let type = 'other';
          let metadata = {};

          if (relPath.startsWith('tasks/') && relPath.match(/tasks\/T\d+\.md$/)) {
            type = 'task';
            const taskMatch = relPath.match(/T(\d+)/);
            if (taskMatch) {
              metadata.taskId = 'T' + taskMatch[1];
            }
          } else if (relPath.startsWith('sessions/') || relPath.match(/session.*\.md$/i)) {
            type = 'session';
            metadata.sessionId = extractSessionId(relPath, content);
          } else if (relPath === 'tasks.md') {
            type = 'registry';
          }

          // Extract frontmatter metadata
          const frontmatter = extractFrontmatter(content);
          const title = frontmatter.title || extractTitle(relPath, content);
          const created = frontmatter.created || null;
          const updated = frontmatter.updated || null;
          const status = frontmatter.status || null;

          results.push({
            path: relPath,
            type: type,
            size: stat.size,
            modified: stat.mtime.toISOString(),
            created: created,
            updated: updated,
            title: title,
            status: status,
            ...metadata
          });
        } catch (err) {
          console.error(`Error processing file ${fullPath}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }

  return results;
}

/**
 * Extract YAML frontmatter from markdown content
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {};
  }

  const frontmatterStr = match[1];
  const result = {};

  // Simple YAML parsing (for common fields)
  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z_]+):\s*(.+)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      // Remove quotes if present
      result[key] = value.replace(/^["']|["']$/g, '').trim();
    }
  }

  return result;
}

/**
 * Extract title from filename or first heading
 */
function extractTitle(relPath, content) {
  // Try to find first H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fall back to filename
  const filename = path.basename(relPath, '.md');
  return filename.replace(/[-_]/g, ' ');
}

/**
 * Extract session ID from path or content
 */
function extractSessionId(relPath, content) {
  // Look for session ID in frontmatter or filename
  const match = relPath.match(/session[_-]?(\d+)/i) || relPath.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : path.basename(relPath, '.md');
}

/**
 * Serve static file with proper MIME type
 */
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
}

/**
 * Handle API request for file listing
 */
function handleFilesAPI(res) {
  try {
    const files = scanDirectory(MEMORY_BANK_DIR);
    files.sort((a, b) => a.path.localeCompare(b.path));

    const manifest = {
      generatedAt: new Date().toISOString(),
      generatedBy: 'server.js (dynamic)',
      stats: {
        totalFiles: files.length,
        byType: {}
      },
      files: files
    };

    // Count by type
    for (const file of files) {
      manifest.stats.byType[file.type] = (manifest.stats.byType[file.type] || 0) + 1;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(manifest));
  } catch (err) {
    console.error('Error generating file list:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

/**
 * Create HTTP server
 */
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle API endpoint
  if (pathname === '/api/files') {
    handleFilesAPI(res);
    return;
  }

  // Handle root redirect
  if (pathname === '/') {
    pathname = '/viewer.html';
  }

  // Serve files from viewer directory first, then memory-bank directory
  let filePath = path.join(VIEWER_DIR, pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(MEMORY_BANK_DIR, pathname);
  }

  // Security: Prevent directory traversal
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(VIEWER_DIR) && !resolvedPath.startsWith(MEMORY_BANK_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if path is a directory
  fs.stat(filePath, (err, stats) => {
    if (err) {
      serveFile(filePath, res);
      return;
    }

    if (stats.isDirectory()) {
      // Try to serve index.html or list directory
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        serveFile(indexPath, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    } else {
      serveFile(filePath, res);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Memory Bank Viewer server running at http://localhost:${PORT}`);
  console.log(`📖 Open http://localhost:${PORT}/viewer.html in your browser`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/files`);
  console.log(`🛑 Press Ctrl+C to stop`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
