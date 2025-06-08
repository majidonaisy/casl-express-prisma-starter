# CASL Express Prisma Starter

A production-ready Express.js backend implementing CASL (Code Access Security Layer) authorization with Prisma ORM, TypeScript, and JWT authentication.

## 🚀 Features

- 🔐 **JWT Authentication & Authorization**
- 🎭 **Role-based Permission System**
- 📋 **CASL Integration with Prisma**
- 🔍 **Field-level Access Control**
- 📚 **Article & User Management**
- 🚀 **TypeScript Support**
- 📖 **Swagger API Documentation**
- 🗃️ **PostgreSQL Database**

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/casl-express-prisma-starter.git
cd casl-express-prisma-starter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your database in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/casl_db"
JWT_SECRET="your-super-secret-jwt-key"
```

5. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Seed the database:
```bash
npx tsx prisma/seed.ts
```

7. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Auth & CASL middleware
├── routes/         # API routes
├── services/       # Business logic & CASL abilities
├── utils/          # Utilities & error handling
└── lib/            # Prisma client
```

## 🔐 Authorization Examples

### Basic Permission Check
```typescript
if (ability.can('read', 'Article')) {
  // User can read articles
}
```

### Conditional Permissions
```typescript
if (ability.can('update', 'Article', { authorId: userId })) {
  // User can update their own articles
}
```

### Prisma Integration
```typescript
const articles = await prisma.article.findMany({
  where: accessibleBy(ability).Article
});
```

## 📚 API Documentation

Once running, visit `http://localhost:3000/api-docs` for Swagger documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.