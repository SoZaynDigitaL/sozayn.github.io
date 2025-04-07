# Heroku Deployment Guide for SoZayn

This guide will help you deploy the SoZayn application to Heroku.

## Prerequisites

1. A Heroku account
2. Heroku CLI installed on your development machine
3. Git repository setup for your project

## Setup Steps

### 1. Create a Heroku Application

```bash
# Login to Heroku CLI
heroku login

# Create a new Heroku app
heroku create sozayn-app

# Or if you want a specific region
heroku create sozayn-app --region eu
```

### 2. Add PostgreSQL Database

```bash
# Add Heroku Postgres add-on to your application
heroku addons:create heroku-postgresql:mini
```

### 3. Configure Environment Variables

```bash
# Set required environment variables
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
heroku config:set VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
heroku config:set NODE_ENV=production
```

### 4. Push to Heroku

```bash
# Push your code to Heroku
git push heroku main
```

### 5. Run Database Migrations

```bash
# Run database migrations
heroku run npm run db:push
```

### 6. Open the Application

```bash
heroku open
```

## Troubleshooting

### Checking Logs

If you encounter issues, check the Heroku logs:

```bash
heroku logs --tail
```

### Database Inspection

To access your PostgreSQL database directly:

```bash
heroku pg:psql
```

### Restarting the Application

If needed, restart the application:

```bash
heroku restart
```

## Scaling

To scale your application, you can adjust the number of dynos:

```bash
# Scale web dynos
heroku ps:scale web=2

# Scale to zero (to stop the app)
heroku ps:scale web=0
```

## Custom Domains

To add a custom domain:

```bash
# Add domain
heroku domains:add www.yourdomain.com

# Get DNS target
heroku domains

# Add the provided DNS target as a CNAME record at your domain registrar
```

## Automatic Deployments

To set up automatic deployments from GitHub:

1. Go to your app in the Heroku Dashboard
2. Navigate to the "Deploy" tab
3. Connect your GitHub repository
4. Enable "Automatic Deploys" from your desired branch
