import { Request, Response } from 'express';
import { runEmergencyDispatchGraph } from '../agents/dispatchGraph.js';
import { presetScenarios } from '../data/scenarioData.js';

export function listScenarios(_req: Request, res: Response): void {
  res.json(presetScenarios);
}

export function getScenarioById(req: Request, res: Response): void {
  const scenario = presetScenarios.find((s) => s.id === req.params.id);
  if (!scenario) {
    res.status(404).json({ error: `Disaster scenario "${req.params.id}" not found.` });
    return;
  }
  res.json(scenario);
}

/**
 * Triggers a pre-defined disaster scenario through the compiled LangGraph StateGraph.
 */
export async function triggerScenario(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const scenario = presetScenarios.find((s) => s.id === req.params.id);

  if (!scenario) {
    res.status(404).json({ error: `Disaster scenario "${req.params.id}" not found.` });
    return;
  }

  try {
    const finalState = await runEmergencyDispatchGraph({
      rawReport: scenario.description,
      coordinates: scenario.location,
    });

    const executionLatencyMs = Date.now() - startTime;

    res.status(201).json({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      incidentId: finalState.incidentId,
      executionLatencyMs,
      triage: finalState.triage,
      dispatchPlan: finalState.dispatchPlan,
      executionLogs: finalState.executionLogs,
    });
  } catch (err: any) {
    console.error('[Scenario LangGraph Trigger Error]', err);
    res.status(500).json({ error: err.message });
  }
}
