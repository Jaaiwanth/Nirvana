import { Router, Request, Response } from 'express';
import { sseHub } from '../services/sseHub.js';
import { agentTelemetry } from '../services/agentTelemetry.js';

export const eventRouter = Router();

eventRouter.get('/', (req: Request, res: Response) => {
  sseHub.registerClient(res);
});

eventRouter.get('/telemetry', (req: Request, res: Response) => {
  const incidentId = req.query.incidentId as string | undefined;
  res.json({
    totalRecords: agentTelemetry.getHistory(incidentId).length,
    telemetry: agentTelemetry.getHistory(incidentId),
  });
});
