import { Router } from 'express';
import { triggerSimulationTick, resetSimulation, getActiveMissions } from '../controllers/simulationController.js';

export const simulationRouter = Router();

simulationRouter.post('/tick', triggerSimulationTick);
simulationRouter.post('/reset', resetSimulation);
simulationRouter.get('/missions', getActiveMissions);
