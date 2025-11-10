import express from 'express';
import { getIndexService } from '../services/serviceManager.js';

const router = express.Router();

/**
 * GET /api/tasks
 * Get all tasks with document counts
 */
router.get('/', async (req, res, next) => {
  try {
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const tasks = indexService.getAllTasks();
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/:taskId/documents
 * Get documents related to a specific task
 */
router.get('/:taskId/documents', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const indexService = getIndexService(req.app.locals.memoryBankPath);
    const documents = indexService.getDocumentsByTask(taskId).map(stripContent);

    if (documents.length === 0) {
      return res.status(404).json({ error: `No documents found for task ${taskId}` });
    }

    res.json({ taskId, documents, count: documents.length });
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
