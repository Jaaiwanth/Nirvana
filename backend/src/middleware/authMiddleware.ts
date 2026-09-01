import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabaseClient.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Validates Supabase JWT access token passed in Authorization: Bearer <token>
 */
export async function requireSupabaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Supabase Bearer token.',
      code: 'AUTH_TOKEN_MISSING',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: 'Unauthorized: Invalid or expired Supabase session.',
        code: 'AUTH_TOKEN_INVALID',
        details: error?.message,
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized: Failed to authenticate session.',
      code: 'AUTH_FAILED',
      details: err.message,
    });
  }
}
