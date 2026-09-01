import { z } from 'zod';

export const incidentTypeSchema = z.enum([
  'structural_collapse',
  'fire',
  'medical_trauma',
  'flood',
  'hazmat',
  'traffic_collision',
  'other',
]);

export const severityLevelSchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

export const incidentTriageSchema = z.object({
  incidentType: incidentTypeSchema,
  severity: severityLevelSchema,
  requiredCapabilities: z.array(z.string()).default([]),
  estimatedVictims: z.number().int().nonnegative().default(1),
  trappedVictims: z.boolean().default(false),
  summary: z.string().min(1),
});

export type IncidentTriageValidated = z.infer<typeof incidentTriageSchema>;
