#!/bin/bash

# Database Setup Script for SoloSuccess AI
# This script automates the database setup process

echo "🚀 SoloSuccess AI - Database Setup"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please update DATABASE_URL in .env with your PostgreSQL connection string"
    echo "   Example: postgresql://postgres:password@localhost:5432/solosuccess?schema=public"
    echo ""
    read -p "Press Enter after updating .env to continue..."
fi

echo ""
echo "1️⃣  Generating Prisma Client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    echo "   Please check your DATABASE_URL in .env"
    exit 1
fi

echo ""
echo "2️⃣  Running database migrations..."
npm run prisma:migrate

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    echo "   Please ensure:"
    echo "   - PostgreSQL is running"
    echo "   - DATABASE_URL in .env is correct"
    echo "   - Database exists"
    exit 1
fi

echo ""
echo "3️⃣  Verifying database setup..."
npm run prisma:verify

if [ $? -ne 0 ]; then
    echo "❌ Database verification failed"
    exit 1
fi

echo ""
echo "✨ Database setup complete!"
echo ""
echo "Next steps:"
echo "  - Run 'npm run dev' to start the development server"
echo "  - Run 'npm run prisma:studio' to view your database"
echo "  - Run 'npm run prisma:seed' to add initial data (optional)"
echo ""
