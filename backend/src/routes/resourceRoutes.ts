import { Router } from 'express';
import { getAllResources, getAvailableResources, getResourceById } from '../controllers/resourceController.js';

export const resourceRouter = Router();

resourceRouter.get('/', getAllResources);
resourceRouter.get('/available', getAvailableResources);
resourceRouter.get('/:id', getResourceById);
