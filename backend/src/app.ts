import express, { Request, Response } from 'express';
import cors from 'cors';
import { resourceRouter } from './routes/resourceRoutes.js';
import { incidentRouter } from './routes/incidentRoutes.js';
import { simulationRouter } from './routes/simulationRoutes.js';
import { eventRouter } from './routes/eventRoutes.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'NIRVANA Emergency Dispatch Coordinator',
    timestamp: new Date().toISOString(),
  });
});

// Modular REST & Event Routes
app.use('/api/resources', resourceRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/simulate', simulationRouter);
app.use('/api/events', eventRouter);
