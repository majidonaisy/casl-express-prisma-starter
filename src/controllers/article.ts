import { Request, Response } from "express";
import ArticleService from "../services/article";
import { subject } from "@casl/ability";

const articleService = new ArticleService();

export const articleController = {
  // Get all articles
  getAllArticles: async (req: Request, res: Response) => {
    try {
      // Check if user has permission to read articles
      if (!req.ability?.can("read", "Article")) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to read articles",
        });
      }

      const articles = await articleService.getAllArticles(req.ability);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  },

  // Get article by ID
  getArticleById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const article = await articleService.getArticleById(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check if user can read this specific article
      if (!req.ability?.can("read", subject("Article", article))) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to read this article",
        });
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  },

  // Create a new article
  createArticle: async (req: Request, res: Response) => {
    try {
      const authorId = req.user?.id;
      const { title, content } = req.body;

      // Validate input
      if (!title || !content || !authorId) {
        return res.status(400).json({
          message: "Title, content, and authorId are required",
        });
      }

      // Check if user can create articles
      if (!req.ability?.can("create", "Article")) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to create articles",
        });
      }

      const article = await articleService.createArticle({
        title,
        content,
        published: true,
        authorId: authorId,
      });

      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  },

  // Update article
  updateArticle: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      const { title, content, published } = req.body;

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      // Get the article to check permissions
      const existingArticle = await articleService.getArticleById(articleId);
      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check if user can update this specific article
      if (!req.ability?.can("update", subject("Article", existingArticle))) {
        return res.status(403).json({
          message:
            "Forbidden: You don't have permission to update this article",
        });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (published !== undefined) updateData.published = published;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message:
            "At least one field (title, content, published) must be provided",
        });
      }

      const article = await articleService.updateArticle(articleId, updateData);
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);

      if (error instanceof Error) {
        if (error.message.includes("Record to update not found")) {
          return res.status(404).json({ message: "Article not found" });
        }
      }

      res.status(500).json({ message: "Failed to update article" });
    }
  },

  // Delete article
  deleteArticle: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      // Get the article to check permissions
      const existingArticle = await articleService.getArticleById(articleId);
      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check if user can delete this specific article
      if (!req.ability?.can("delete", subject("Article", existingArticle))) {
        return res.status(403).json({
          message:
            "Forbidden: You don't have permission to delete this article",
        });
      }

      await articleService.deleteArticle(articleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting article:", error);

      if (error instanceof Error) {
        if (error.message.includes("Record to delete does not exist")) {
          return res.status(404).json({ message: "Article not found" });
        }
      }

      res.status(500).json({ message: "Failed to delete article" });
    }
  },

  // Get articles by author
  getArticlesByAuthor: async (req: Request, res: Response) => {
    try {
      const { authorId } = req.params;
      const authorIdInt = parseInt(authorId);

      if (isNaN(authorIdInt)) {
        return res.status(400).json({ message: "Invalid author ID" });
      }

      // Check if user has permission to read articles
      if (!req.ability?.can("read", "Article")) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to read articles",
        });
      }

      const articles = await articleService.getArticlesByAuthor(authorIdInt);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles by author:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  },

  // Get published articles
  getPublishedArticles: async (req: Request, res: Response) => {
    try {
      // Check if user has permission to read articles
      if (!req.ability?.can("read", "Article")) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to read articles",
        });
      }

      const articles = await articleService.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching published articles:", error);
      res.status(500).json({ message: "Failed to fetch published articles" });
    }
  },
};
