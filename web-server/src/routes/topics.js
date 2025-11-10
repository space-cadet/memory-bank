import express from 'express';
import { getIndexService } from '../services/serviceManager.js';

const router = express.Router();

/**
 * GET /api/topics
 * Get all topics with document counts
 */
router.get('/', async (req, res, next) => {
  try {
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const topics = indexService.getAllTopics();
    res.json({ topics, count: topics.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/topics/:name/documents
 * Get documents related to a specific topic
 */
router.get('/:name/documents', async (req, res, next) => {
  try {
    const { name } = req.params;
    // Decode the topic name in case it's URL encoded
    const decodedName = decodeURIComponent(name);
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const documents = indexService.getDocumentsByTopic(decodedName).map(stripContent);

    if (documents.length === 0) {
      return res.status(404).json({ error: `No documents found for topic "${decodedName}"` });
    }

    res.json({ topic: decodedName, documents, count: documents.length });
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
