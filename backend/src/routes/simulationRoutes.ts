import { Router } from 'express';
import { triggerSimulationTick, resetSimulation, getActiveMissions } from '../controllers/simulationController.js';
import { requireSupabaseAuth } from '../middleware/authMiddleware.js';

export const simulationRouter = Router();

simulationRouter.post('/tick', requireSupabaseAuth, triggerSimulationTick);
simulationRouter.post('/reset', requireSupabaseAuth, resetSimulation);
simulationRouter.get('/missions', getActiveMissions);
