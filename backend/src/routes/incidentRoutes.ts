import { Router } from 'express';
import { listIncidents, getIncidentById, createAndDispatchIncident, createFromMediaIncident } from '../controllers/incidentController.js';

export const incidentRouter = Router();

incidentRouter.post('/media', createFromMediaIncident); // Must be before /:id param routes
incidentRouter.get('/', listIncidents);
incidentRouter.get('/:id', getIncidentById);
incidentRouter.post('/', createAndDispatchIncident);
