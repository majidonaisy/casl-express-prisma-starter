import { Request, Response, NextFunction } from 'express';
import { defineAbilitiesForUser } from '../services/ability';

export async function defineAbilities(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id; // assuming you've already populated req.user via auth middleware

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.ability = await defineAbilitiesForUser(userId);
    next();
  } catch (err) {
    next(err);
  }
}