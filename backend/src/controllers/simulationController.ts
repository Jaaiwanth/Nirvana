import { Request, Response } from 'express';
import { resourceRepo } from '../db/resourceRepository.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { sseHub } from '../services/sseHub.js';

export async function triggerSimulationTick(_req: Request, res: Response): Promise<void> {
  try {
    const result = await simulationEngine.tick();
    res.json({
      message: 'Simulation tick executed successfully.',
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function resetSimulation(_req: Request, res: Response): Promise<void> {
  try {
    await resourceRepo.resetToSeed();
    simulationEngine.reset();
    sseHub.broadcast('simulation:reset', {
      message: 'Fleet and simulation state reset to base station seed values.',
    });
    res.json({
      message: 'Fleet and incidents successfully reset to initial seed data.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export function getActiveMissions(_req: Request, res: Response): void {
  const missions = simulationEngine.getActiveMissions();
  res.json(missions);
}
