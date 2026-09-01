import { Request, Response } from 'express';
import { resourceRepo } from '../db/resourceRepository.js';

export async function getAllResources(_req: Request, res: Response): Promise<void> {
  try {
    const teams = await resourceRepo.getAllTeams();
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAvailableResources(_req: Request, res: Response): Promise<void> {
  try {
    const teams = await resourceRepo.getAvailableTeams();
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getResourceById(req: Request, res: Response): Promise<void> {
  try {
    const team = await resourceRepo.getTeamById(req.params.id);
    if (!team) {
      res.status(404).json({ error: `Rescue team with ID "${req.params.id}" not found.` });
      return;
    }
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
