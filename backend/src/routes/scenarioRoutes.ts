import { Router } from 'express';
import { listScenarios, getScenarioById, triggerScenario } from '../controllers/scenarioController.js';
import { requireSupabaseAuth } from '../middleware/authMiddleware.js';

export const scenarioRouter = Router();

scenarioRouter.get('/', listScenarios);
scenarioRouter.get('/:id', getScenarioById);
scenarioRouter.post('/:id/trigger', requireSupabaseAuth, triggerScenario);
