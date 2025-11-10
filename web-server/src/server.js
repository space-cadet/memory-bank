import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import documentRoutes from './routes/documents.js';
import taskRoutes from './routes/tasks.js';
import topicRoutes from './routes/topics.js';
import searchRoutes from './routes/search.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const MEMORY_BANK_PATH = process.env.MEMORY_BANK_PATH || path.join(__dirname, '../../memory-bank');

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Store memory bank path in app locals for access in routes
app.locals.memoryBankPath = MEMORY_BANK_PATH;

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', memoryBankPath: MEMORY_BANK_PATH });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Memory Bank Web Server running on port ${PORT}`);
  console.log(`Memory Bank Path: ${MEMORY_BANK_PATH}`);
});
