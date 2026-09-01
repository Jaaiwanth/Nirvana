import { Request, Response } from 'express';
import { z } from 'zod';
import { resourceRepo } from '../db/resourceRepository.js';
import { Coordinates } from '../types/index.js';
import { runEmergencyDispatchGraph } from '../agents/dispatchGraph.js';

export const incidentInputSchema = z.object({
  reportText: z.string().min(3, 'Incident report must be at least 3 characters'),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const mediaIncidentInputSchema = z.object({
  mediaBase64: z.string().min(10, 'Valid base64 encoded media required'),
  mimeType: z.string().min(3),
  callerNote: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export async function listIncidents(_req: Request, res: Response): Promise<void> {
  try {
    const incidents = await resourceRepo.listIncidents();
    res.json(incidents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getIncidentById(req: Request, res: Response): Promise<void> {
  try {
    const incident = await resourceRepo.getIncidentById(req.params.id);
    if (!incident) {
      res.status(404).json({ error: `Incident with ID "${req.params.id}" not found.` });
      return;
    }
    res.json(incident);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Executes autonomous emergency dispatch via compiled LangGraph StateGraph.
 */
export async function createAndDispatchIncident(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  try {
    const parsed = incidentInputSchema.parse(req.body);

    const incidentLocation: Coordinates = parsed.coordinates || {
      lat: 12.9716,
      lng: 77.5946,
    };

    // Execute through compiled LangGraph StateGraph
    const finalState = await runEmergencyDispatchGraph({
      rawReport: parsed.reportText,
      coordinates: incidentLocation,
    });

    const executionLatencyMs = Date.now() - startTime;

    res.status(201).json({
      incidentId: finalState.incidentId,
      executionLatencyMs,
      triage: finalState.triage,
      dispatchPlan: finalState.dispatchPlan,
      executionLogs: finalState.executionLogs,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error('[Incident Controller LangGraph Error]', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Ingests photo or audio emergency reports, runs multimodal analysis and dispatch
 * through the compiled LangGraph StateGraph workflow.
 */
export async function createFromMediaIncident(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  try {
    const parsed = mediaIncidentInputSchema.parse(req.body);

    const incidentLocation: Coordinates = parsed.coordinates || {
      lat: 12.9716,
      lng: 77.5946,
    };

    // Execute through compiled LangGraph StateGraph with mediaInput
    const finalState = await runEmergencyDispatchGraph({
      rawReport: parsed.callerNote || `[Multimodal Media] ${parsed.mimeType}`,
      coordinates: incidentLocation,
      mediaInput: {
        mediaBase64: parsed.mediaBase64,
        mimeType: parsed.mimeType,
        callerNote: parsed.callerNote,
      },
    });

    const executionLatencyMs = Date.now() - startTime;

    res.status(201).json({
      incidentId: finalState.incidentId,
      executionLatencyMs,
      triage: finalState.triage,
      dispatchPlan: finalState.dispatchPlan,
      executionLogs: finalState.executionLogs,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error('[Media Incident LangGraph Error]', err);
    res.status(500).json({ error: err.message });
  }
}
