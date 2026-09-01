import { Router } from 'express';
import { listIncidents, getIncidentById, createAndDispatchIncident, createFromMediaIncident } from '../controllers/incidentController.js';
import { requireSupabaseAuth } from '../middleware/authMiddleware.js';

export const incidentRouter = Router();

incidentRouter.post('/media', requireSupabaseAuth, createFromMediaIncident);
incidentRouter.get('/', listIncidents);
incidentRouter.get('/:id', getIncidentById);
incidentRouter.post('/', requireSupabaseAuth, createAndDispatchIncident);
