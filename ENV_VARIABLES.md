# Environment Variables for SoZayn

Below is a list of all environment variables required for the SoZayn application to run properly:

## Database Variables
- `DATABASE_URL`: PostgreSQL connection string (automatically set by Heroku PostgreSQL add-on)
- `PGHOST`: PostgreSQL host (part of DATABASE_URL)
- `PGUSER`: PostgreSQL user (part of DATABASE_URL)
- `PGPASSWORD`: PostgreSQL password (part of DATABASE_URL)
- `PGDATABASE`: PostgreSQL database name (part of DATABASE_URL)
- `PGPORT`: PostgreSQL port (part of DATABASE_URL)

## Stripe Integration
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with sk_)
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key (starts with pk_)

## Session Security
- `SESSION_SECRET`: A secret string used to sign session cookies (required for production)

## Server Configuration
- `PORT`: The port the server will listen on (automatically set by Heroku)
- `NODE_ENV`: Environment setting ('development' or 'production')

## Optional External Services
If you decide to integrate with these services, you'll need their respective environment variables:

### Firebase
- `FIREBASE_API_KEY`: Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase authentication domain
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase application ID

### Google Cloud
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: JSON string containing Google Cloud service account credentials

### Cloudflare
- `CLOUDFLARE_API_TOKEN`: API token for Cloudflare integration
- `CLOUDFLARE_ZONE_ID`: Zone ID for your domain in Cloudflare

## How to Set Environment Variables

### On Heroku
```bash
heroku config:set VARIABLE_NAME=variable_value
```

### Locally for Development
Create a `.env` file in the root directory with the following format:
```
VARIABLE_NAME=variable_value
```
