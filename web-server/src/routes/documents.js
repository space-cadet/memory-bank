import express from 'express';
import { getIndexService } from '../services/serviceManager.js';

const router = express.Router();

/**
 * GET /api/documents
 * Get all documents with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const documents = indexService.documents.map(stripContent);
    res.json({ documents, count: documents.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/chronological
 * Get documents in chronological order (newest first)
 */
router.get('/chronological', async (req, res, next) => {
  try {
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const documents = indexService.getChronologicalView().map(stripContent);
    res.json({ documents, count: documents.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/chronological-grouped
 * Get documents grouped by date ranges
 */
router.get('/chronological-grouped', async (req, res, next) => {
  try {
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const grouped = indexService.getChronologicalGrouped();

    // Strip content from all groups
    const result = {};
    for (const [key, docs] of Object.entries(grouped)) {
      result[key] = docs.map(stripContent);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/:id
 * Get a single document by ID with full content
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const document = indexService.getDocumentById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    next(error);
  }
});

/**
 * Utility function to strip content from document for list views
 */
function stripContent(doc) {
  const { content, ...docWithoutContent } = doc;
  return docWithoutContent;
}

export default router;
