# OdontoCare Backend - Deployment Guide (Fly.io)

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Flyctl CLI**: Install from [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl)
3. **Docker**: Installed locally (for building images)
4. **GitHub**: Repository with latest code pushed

## Step 1: Authenticate with Fly.io

```bash
flyctl auth login
```

Follow the prompts to authenticate.

## Step 2: Create Fly.io App

```bash
flyctl apps create --name odontocare-api
```

**Note**: Change `odontocare-api` to a unique name if it's already taken. Update `app = "odontocare-api"` in [fly.toml](../../fly.toml) with your chosen name.

## Step 3: Set Environment Variables

Set all required secrets in Fly.io (these won't be committed to git):

```bash
flyctl secrets set \
  DATABASE_URL="postgresql://postgres.ekqkyhxvfraojjftrnky:jghoD5yRTgXoujcK@aws-1-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true" \
  JWT_SECRET="your-super-secret-jwt-key-change-this" \
  CORS_ORIGIN="https://your-frontend-domain.com"
```

**Important**: 
- Use your actual Supabase pooler URL for `DATABASE_URL`
- Generate a strong `JWT_SECRET` (e.g., `openssl rand -hex 32`)
- Set `CORS_ORIGIN` to your frontend URL after deployment

## Step 4: Deploy

```bash
flyctl deploy
```

Fly.io will:
1. Build the Docker image
2. Push it to Fly's registry
3. Deploy to the specified region (default: `gru` — São Paulo)
4. Run migrations automatically (if hook configured)
5. Start the application

## Step 5: Run Migrations (if not automatic)

After the first deployment, manually run migrations:

```bash
flyctl ssh console
# Inside the console:
npm run prisma:migrate:deploy
exit
```

## Step 6: Verify Deployment

```bash
# Get app URL
flyctl info

# Test the API
curl -X GET https://odontocare-api.fly.dev/api
# Expected: {"message":"Não autenticado","details":null}
```

## Step 7: Update Frontend Configuration

Update `frontend/.env.production` with the new API URL:

```env
VITE_API_URL=https://odontocare-api.fly.dev/api
```

Build and deploy the frontend to your chosen platform.

## Monitoring & Logs

```bash
# View real-time logs
flyctl logs

# SSH into the app
flyctl ssh console

# Monitor app metrics
flyctl status
```

## Scaling

Increase memory or CPU:

```bash
flyctl scale vm --memory 1024 --cpus 2
```

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is set correctly and Supabase pooler is accessible
- Check that your Fly.io app is in a region with outbound access to Supabase

### Build Failures
- Review `flyctl logs` for error messages
- Ensure `Dockerfile` path is correct in `fly.toml`

### High Latency
- Choose a region closer to your Supabase database (edit `primary_region` in [fly.toml](../../fly.toml))
