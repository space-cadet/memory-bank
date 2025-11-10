import express from 'express';
import { getIndexService } from '../services/serviceManager.js';

const router = express.Router();

/**
 * GET /api/search
 * Search documents by query string
 */
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const results = indexService.search(q).map(stripContent);

    res.json({ query: q, results, count: results.length });
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
