import { NextFunction, Request, Response } from 'express';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { articleController } from '../controllers/article';
import { authenticateJWT } from '../middleware/auth';
import { defineAbilities } from '../middleware/defineAbilities';



export const articleRouter = express.Router();


articleRouter.post('/',  authenticateJWT, defineAbilities, expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await articleController.createArticle(req, res);
}));

articleRouter.get('/:id', expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await articleController.getArticleById(req, res);
}));

articleRouter.get('/', authenticateJWT, defineAbilities ,expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.ability)
  await articleController.getAllArticles(req, res);
}));

