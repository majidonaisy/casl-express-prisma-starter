import { Ability } from "@casl/ability";
import prisma from "../lib/prisma";
import { accessibleBy } from '@casl/prisma';
import { AppAbility } from "./ability";


export default class ArticleService {
  constructor() {
    // Initialize any dependencies or properties here
  }

  async getArticleById(articleId: number) {
    try {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return article;
    } catch (error) {
      console.error(`Error fetching article with ID ${articleId}:`, error);
      throw new Error("Failed to fetch article");
    }
  }

  async getAllArticles(ability:any) {
    try {
      const articles = await prisma.article.findMany({
        where:accessibleBy(ability).Article,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return articles;
    } catch (error) {
      console.error("Error fetching all articles:", error);
      throw new Error("Failed to fetch articles");
    }
  }

  async createArticle(data: {
    title: string;
    content: string;
    published?: boolean;
    authorId: number;
  }) {
    try {
      const article = await prisma.article.create({
        data: {
          title: data.title,
          content: data.content,
          published: data.published ?? false,
          authorId: data.authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return article;
    } catch (error) {
      console.error("Error creating article:", error);
      throw new Error("Failed to create article");
    }
  }

  async updateArticle(
    articleId: number,
    data: {
      title?: string;
      content?: string;
      published?: boolean;
    }
  ) {
    try {
      const article = await prisma.article.update({
        where: { id: articleId },
        data,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return article;
    } catch (error) {
      console.error(`Error updating article with ID ${articleId}:`, error);
      throw new Error("Failed to update article");
    }
  }

  async deleteArticle(articleId: number) {
    try {
      const article = await prisma.article.delete({
        where: { id: articleId },
      });
      return article;
    } catch (error) {
      console.error(`Error deleting article with ID ${articleId}:`, error);
      throw new Error("Failed to delete article");
    }
  }

  async getArticlesByAuthor(authorId: number) {
    try {
      const articles = await prisma.article.findMany({
        where: { authorId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return articles;
    } catch (error) {
      console.error(`Error fetching articles for author ${authorId}:`, error);
      throw new Error("Failed to fetch articles");
    }
  }

  async getPublishedArticles() {
    try {
      const articles = await prisma.article.findMany({
        where: { published: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return articles;
    } catch (error) {
      console.error("Error fetching published articles:", error);
      throw new Error("Failed to fetch published articles");
    }
  }
}
