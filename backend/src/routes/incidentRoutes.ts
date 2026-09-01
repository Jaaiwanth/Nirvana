import { Router } from 'express';
import { listIncidents, getIncidentById, createAndDispatchIncident, createFromMediaIncident } from '../controllers/incidentController.js';

export const incidentRouter = Router();

incidentRouter.get('/', listIncidents);
incidentRouter.get('/:id', getIncidentById);
incidentRouter.post('/', createAndDispatchIncident);
incidentRouter.post('/media', createFromMediaIncident);
