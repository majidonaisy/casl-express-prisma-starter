import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { defineAbilities } from '../middleware/defineAbilities';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { userController } from '../controllers/user';
import expressAsyncHandler from 'express-async-handler';
import { ApiError } from '../utils/api-error';
import { createAbility } from '../services/ability';

export const userRouter = express.Router(); 


/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile and abilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 User:
 *                   $ref: '#/components/schemas/User'
 *                 Abilities:
 *                   type: object
 */
userRouter.get('/me', authenticateJWT, defineAbilities, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		res.json({ User: req.user, Abilities: req.ability });
	} catch (error) {
		next(error);
	}
}); 



/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */

userRouter.post('/login', async (req: Request, res: Response,next:NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.password === password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;  
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.post('/create',authenticateJWT,defineAbilities,expressAsyncHandler( async(req:Request, res:Response,next:NextFunction) => {
  if(req.ability?.can('create','User')){
    await userController.createUser(req, res);
  }else{
    throw new ApiError(401,'Forbidden: You do not have permission to create a user');
  }
}));