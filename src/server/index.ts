import express, { Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Root route for health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'Agentic Cost Calculator API is running',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api', apiRouter);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
