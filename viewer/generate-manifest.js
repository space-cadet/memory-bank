#!/usr/bin/env node

/**
 * Approach 1: Scan Script for Static Manifest Generation
 *
 * This script recursively scans the memory-bank directory,
 * discovers all .md files, extracts metadata, and generates
 * a manifest.json file for the viewer to use.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MEMORY_BANK_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, 'manifest.json');
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.venv', '__pycache__'];

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
 * Generate and write manifest
 */
function generateManifest() {
  console.log(`Scanning memory bank directory: ${MEMORY_BANK_DIR}`);

  const files = scanDirectory(MEMORY_BANK_DIR);

  // Sort by path for consistency
  files.sort((a, b) => a.path.localeCompare(b.path));

  // Build manifest object
  const manifest = {
    generatedAt: new Date().toISOString(),
    generatedBy: 'generate-manifest.js',
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

  // Write manifest
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`✅ Manifest generated: ${OUTPUT_FILE}`);
    console.log(`📊 Summary:`);
    console.log(`   Total files: ${manifest.stats.totalFiles}`);
    console.log(`   By type: ${JSON.stringify(manifest.stats.byType)}`);
  } catch (err) {
    console.error(`❌ Error writing manifest: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest, scanDirectory };
