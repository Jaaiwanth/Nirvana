import { Router, Request, Response } from 'express';
import { sseHub } from '../services/sseHub.js';

export const eventRouter = Router();

eventRouter.get('/', (req: Request, res: Response) => {
  sseHub.registerClient(res);
});
