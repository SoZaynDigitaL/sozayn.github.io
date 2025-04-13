# SoZayn - Restaurant Management Platform

SoZayn is a comprehensive digital platform for restaurants and grocery stores branded as "Welcome to Digital Era." It features a modern "Digital Command Center" interface that helps businesses manage online ordering, delivery services, and more.

## Key Features

- **Supabase Integration**: Authentication, database, and real-time updates
- **Delivery Partner Integrations**: UberDirect and JetGo connectivity
- **Real-time Order Tracking**: Map visualization with custom delivery vehicle animations
- **Modern UI**: Dark theme with blue/purple accent colors
- **Responsive Design**: Works on all devices

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **UI Components**: Tailwind CSS, shadcn/ui
- **Authentication & Database**: Supabase
- **Payment Processing**: Stripe
- **Deployment**: Cloudflare Pages (frontend), Cloudflare Workers (API)
- **Monitoring & CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 9.x or later
- Supabase account
- Stripe account (for payments)
- Cloudflare account (for deployment)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-organization/sozayn.git
   cd sozayn
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Copy `.env.example` to `.env.local` and fill in your API keys:
   ```
   cp .env.example .env.local
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Visit `http://localhost:3000` in your browser

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key (server-side only)

## Deployment

### Cloudflare Pages (Frontend)

1. Connect your GitHub repository to Cloudflare Pages
2. Set your environment variables in the Cloudflare dashboard
3. Configure the build settings:
   - Build command: `npm run build`
   - Build directory: `dist`

### Cloudflare Workers (API)

1. Install Wrangler CLI
   ```
   npm install -g wrangler
   ```

2. Authenticate and deploy
   ```
   wrangler login
   wrangler publish
   ```

## Supabase Schema

The database schema includes the following tables:
- profiles
- integrations
- webhooks
- webhook_logs
- orders
- customers
- deliveries
- social_media_accounts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/your-organization/sozayn](https://github.com/your-organization/sozayn)