import { z } from 'zod';
import { severityLevelSchema } from './incidentSchema.js';

export const agentDecisionSchema = z.object({
  primaryTeamId: z.string().min(1),
  secondaryTeamIds: z.array(z.string()).default([]),
  reasoning: z.string().min(1),
  priority: severityLevelSchema.default('HIGH'),
});

export type AgentDecisionValidated = z.infer<typeof agentDecisionSchema>;
