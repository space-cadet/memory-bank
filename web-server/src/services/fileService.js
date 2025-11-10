import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

/**
 * FileService - Handles reading and processing memory bank markdown files
 */
export class FileService {
  constructor(memoryBankPath) {
    this.memoryBankPath = memoryBankPath;
  }

  /**
   * Recursively read all markdown files from a directory
   */
  async getAllMarkdownFiles(dirPath = null) {
    const searchPath = dirPath || this.memoryBankPath;
    const files = [];

    try {
      const entries = await fsPromises.readdir(searchPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden directories and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = path.join(searchPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories, but limit depth for large directories
          if (!this.shouldSkipDirectory(entry.name)) {
            const subFiles = await this.getAllMarkdownFiles(fullPath);
            files.push(...subFiles);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${searchPath}:`, error);
    }

    return files.sort();
  }

  /**
   * Determine if a directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = ['.git', 'node_modules', '.roo', 'backups', 'old_prompts'];
    return skipDirs.includes(dirName);
  }

  /**
   * Read a markdown file and extract metadata
   */
  async readMarkdownFile(filePath) {
    try {
      const content = await fsPromises.readFile(filePath, 'utf-8');
      const stats = await fsPromises.stat(filePath);

      return {
        path: filePath,
        relativePath: path.relative(this.memoryBankPath, filePath),
        filename: path.basename(filePath),
        content,
        size: stats.size,
        dateModified: stats.mtime,
        dateCreated: stats.birthtime || stats.mtime
      };
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Extract title from markdown file (first H1 or filename)
   */
  extractTitle(content, filename) {
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    return filename.replace(/\.md$/, '');
  }

  /**
   * Extract headings from markdown content
   */
  extractHeadings(content) {
    const headings = [];
    const headingRegex = /^(#{1,6}) (.+)$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ level, text });
    }

    return headings;
  }

  /**
   * Extract task references (T1, T2, etc) from markdown content
   */
  extractTaskReferences(content) {
    const taskRegex = /\bT(\d+)\b/g;
    const tasks = new Set();
    let match;

    while ((match = taskRegex.exec(content)) !== null) {
      tasks.add(`T${match[1]}`);
    }

    return Array.from(tasks).sort();
  }

  /**
   * Determine document type based on filename and path
   */
  determineDocumentType(relativePath, filename) {
    if (relativePath.startsWith('tasks/')) return 'task';
    if (relativePath.startsWith('sessions/')) return 'session';
    if (relativePath.startsWith('implementation-details/')) return 'implementation';
    if (relativePath.startsWith('database/')) return 'database';
    if (filename.startsWith('activeContext')) return 'context';
    if (filename.startsWith('progress')) return 'progress';
    if (filename.startsWith('session_cache')) return 'cache';
    if (filename.startsWith('edit_history')) return 'history';
    if (filename.startsWith('errorLog')) return 'errors';
    return 'document';
  }

  /**
   * Extract topics/categories from headings
   */
  extractTopics(headings) {
    return headings
      .filter(h => h.level <= 2)
      .map(h => h.text);
  }

  /**
   * Count words in content
   */
  countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }
}

export default FileService;
