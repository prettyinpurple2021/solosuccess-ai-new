# SoloSuccess AI

An AI-powered platform that provides solo founders with a virtual executive team of specialized AI agents.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: Automated Setup (Recommended)**
```bash
npm run setup:db
```

**Option B: Manual Setup**
1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` with your PostgreSQL connection
3. Run migrations: `npm run prisma:migrate`
4. Verify setup: `npm run prisma:verify`

For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
solosuccess-ai/
├── app/                    # Next.js app directory
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Database models
│   ├── seed.ts            # Database seeding
│   └── README.md          # Database documentation
├── lib/                    # Shared utilities and helpers
├── components/             # React components
├── public/                 # Static assets
└── scripts/                # Setup and utility scripts
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database
- `npm run setup:db` - Automated database setup
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:verify` - Verify database setup

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 / Anthropic Claude

## Documentation

- [Database Setup Guide](./DATABASE_SETUP.md) - Quick start for database configuration
- [Database Schema Documentation](./prisma/README.md) - Detailed schema information
- [Migration Summary](./MIGRATION_SUMMARY.md) - Overview of database implementation

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/solosuccess?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
