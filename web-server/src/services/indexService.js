import FileService from './fileService.js';

/**
 * IndexService - Builds and manages different indexes for browsing
 */
export class IndexService {
  constructor(memoryBankPath) {
    this.fileService = new FileService(memoryBankPath);
    this.documents = [];
    this.chronologicalIndex = [];
    this.taskIndex = {};
    this.topicIndex = {};
    this.isInitialized = false;
  }

  /**
   * Initialize all indexes - should be called once on startup
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    console.log('Building memory bank indexes...');
    const startTime = Date.now();

    try {
      // Get all markdown files
      const filePaths = await this.fileService.getAllMarkdownFiles();
      console.log(`Found ${filePaths.length} markdown files`);

      // Process each file
      for (const filePath of filePaths) {
        await this.processDocument(filePath);
      }

      // Build specialized indexes
      this.buildChronologicalIndex();
      this.buildTaskIndex();
      this.buildTopicIndex();

      this.isInitialized = true;
      const elapsed = Date.now() - startTime;
      console.log(`Indexes built in ${elapsed}ms`);
    } catch (error) {
      console.error('Error initializing indexes:', error);
      throw error;
    }
  }

  /**
   * Process a single document and extract metadata
   */
  async processDocument(filePath) {
    try {
      const fileData = await this.fileService.readMarkdownFile(filePath);
      const title = this.fileService.extractTitle(fileData.content, fileData.filename);
      const headings = this.fileService.extractHeadings(fileData.content);
      const taskReferences = this.fileService.extractTaskReferences(fileData.content);
      const topics = this.fileService.extractTopics(headings);
      const docType = this.fileService.determineDocumentType(fileData.relativePath, fileData.filename);
      const wordCount = this.fileService.countWords(fileData.content);

      const document = {
        id: this.generateId(fileData.relativePath),
        filename: fileData.filename,
        relativePath: fileData.relativePath,
        title,
        type: docType,
        dateCreated: fileData.dateCreated,
        dateModified: fileData.dateModified,
        size: fileData.size,
        wordCount,
        headings,
        relatedTasks: taskReferences,
        topics,
        content: fileData.content
      };

      this.documents.push(document);
    } catch (error) {
      console.error(`Error processing document ${filePath}:`, error);
    }
  }

  /**
   * Build chronological index sorted by modification date (newest first)
   */
  buildChronologicalIndex() {
    this.chronologicalIndex = [...this.documents].sort((a, b) => {
      return new Date(b.dateModified) - new Date(a.dateModified);
    });
  }

  /**
   * Build task-wise index grouping documents by task
   */
  buildTaskIndex() {
    this.taskIndex = {};

    // Initialize all task entries
    for (const doc of this.documents) {
      for (const task of doc.relatedTasks) {
        if (!this.taskIndex[task]) {
          this.taskIndex[task] = [];
        }
        this.taskIndex[task].push(doc);
      }
    }

    // Sort documents within each task by date
    for (const task in this.taskIndex) {
      this.taskIndex[task].sort((a, b) => {
        return new Date(b.dateModified) - new Date(a.dateModified);
      });
    }
  }

  /**
   * Build topic-wise index grouping documents by topics
   */
  buildTopicIndex() {
    this.topicIndex = {};

    for (const doc of this.documents) {
      for (const topic of doc.topics) {
        if (!this.topicIndex[topic]) {
          this.topicIndex[topic] = [];
        }
        // Avoid duplicates
        if (!this.topicIndex[topic].find(d => d.id === doc.id)) {
          this.topicIndex[topic].push(doc);
        }
      }
    }

    // Sort documents within each topic by date
    for (const topic in this.topicIndex) {
      this.topicIndex[topic].sort((a, b) => {
        return new Date(b.dateModified) - new Date(a.dateModified);
      });
    }
  }

  /**
   * Get all documents in chronological order
   */
  getChronologicalView() {
    return this.chronologicalIndex;
  }

  /**
   * Get documents grouped by date ranges
   */
  getChronologicalGrouped() {
    const grouped = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      thisYear: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    for (const doc of this.chronologicalIndex) {
      const docDate = new Date(doc.dateModified);

      if (docDate >= today) {
        grouped.today.push(doc);
      } else if (docDate >= weekAgo) {
        grouped.thisWeek.push(doc);
      } else if (docDate >= monthAgo) {
        grouped.thisMonth.push(doc);
      } else if (docDate >= yearAgo) {
        grouped.thisYear.push(doc);
      } else {
        grouped.older.push(doc);
      }
    }

    return grouped;
  }

  /**
   * Get all tasks with document counts
   */
  getAllTasks() {
    return Object.entries(this.taskIndex).map(([taskId, docs]) => ({
      id: taskId,
      documentCount: docs.length
    })).sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get documents for a specific task
   */
  getDocumentsByTask(taskId) {
    return this.taskIndex[taskId] || [];
  }

  /**
   * Get all topics with document counts
   */
  getAllTopics() {
    return Object.entries(this.topicIndex).map(([topic, docs]) => ({
      name: topic,
      documentCount: docs.length
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get documents for a specific topic
   */
  getDocumentsByTopic(topic) {
    return this.topicIndex[topic] || [];
  }

  /**
   * Get a single document by ID
   */
  getDocumentById(id) {
    return this.documents.find(doc => doc.id === id);
  }

  /**
   * Search documents by full-text and metadata
   */
  search(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return this.documents.filter(doc => {
      return (
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.filename.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery) ||
        doc.relatedTasks.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }).sort((a, b) => {
      // Rank by title match first, then content
      const aTitle = a.title.toLowerCase().includes(lowerQuery) ? 2 : 1;
      const bTitle = b.title.toLowerCase().includes(lowerQuery) ? 2 : 1;
      if (aTitle !== bTitle) return bTitle - aTitle;

      // Then by modification date
      return new Date(b.dateModified) - new Date(a.dateModified);
    });
  }

  /**
   * Generate a unique ID from relative path
   */
  generateId(relativePath) {
    return relativePath.replace(/[\/\\]/g, '_').replace(/\.md$/, '');
  }

  /**
   * Get document statistics
   */
  getStatistics() {
    return {
      totalDocuments: this.documents.length,
      totalTasks: Object.keys(this.taskIndex).length,
      totalTopics: Object.keys(this.topicIndex).length,
      totalWords: this.documents.reduce((sum, doc) => sum + doc.wordCount, 0),
      totalSize: this.documents.reduce((sum, doc) => sum + doc.size, 0)
    };
  }
}

export default IndexService;
