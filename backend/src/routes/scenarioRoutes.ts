import { Router } from 'express';
import { listScenarios, getScenarioById, triggerScenario } from '../controllers/scenarioController.js';

export const scenarioRouter = Router();

scenarioRouter.get('/', listScenarios);
scenarioRouter.get('/:id', getScenarioById);
scenarioRouter.post('/:id/trigger', triggerScenario);
