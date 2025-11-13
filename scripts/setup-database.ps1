# Database Setup Script for SoloSuccess AI (PowerShell)
# This script automates the database setup process

Write-Host "SoloSuccess AI - Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "SUCCESS: .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please update DATABASE_URL in .env with your PostgreSQL connection string" -ForegroundColor Yellow
    Write-Host "Example: postgresql://postgres:password@localhost:5432/solosuccess?schema=public" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter after updating .env to continue"
}

Write-Host ""
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Running database migrations..." -ForegroundColor Cyan
npm run prisma:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  - DATABASE_URL in .env is correct" -ForegroundColor Yellow
    Write-Host "  - Database exists" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 3: Verifying database setup..." -ForegroundColor Cyan
npm run prisma:verify

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database verification failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - Run 'npm run dev' to start the development server" -ForegroundColor Gray
Write-Host "  - Run 'npm run prisma:studio' to view your database" -ForegroundColor Gray
Write-Host "  - Run 'npm run prisma:seed' to add initial data (optional)" -ForegroundColor Gray
Write-Host ""
