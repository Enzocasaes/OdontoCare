# Fly.io deployment script for OdontoCare backend

# Step 1: Login to Fly.io
Write-Host "Logging in to Fly.io..." -ForegroundColor Green
flyctl auth login

# Step 2: Create app (change name if needed)
$appName = "odontocare-api"
Write-Host "Creating Fly.io app: $appName" -ForegroundColor Green
flyctl apps create --name $appName

# Step 3: Set environment secrets
Write-Host "Setting environment secrets..." -ForegroundColor Green

# Replace these values with your actual values
$databaseUrl = "postgresql://postgres.ekqkyhxvfraojjftrnky:jghoD5yRTgXoujcK@aws-1-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true"
$jwtSecret = "change-me-to-a-strong-secret-key-use-openssl-rand-hex-32"
$corsOrigin = "https://your-frontend-domain.com"

# Convert to single-line command for PowerShell
flyctl secrets set DATABASE_URL=$databaseUrl JWT_SECRET=$jwtSecret CORS_ORIGIN=$corsOrigin

# Step 4: Deploy
Write-Host "Deploying to Fly.io..." -ForegroundColor Green
flyctl deploy

# Step 5: Get app info
Write-Host "Deployment complete! App info:" -ForegroundColor Green
flyctl info

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run migrations (if needed): flyctl ssh console"
Write-Host "2. Inside console: npm run prisma:migrate:deploy"
Write-Host "3. Exit console: exit"
Write-Host "4. Test: curl https://$appName.fly.dev/api"
Write-Host "5. Update frontend VITE_API_URL to: https://$appName.fly.dev/api"
