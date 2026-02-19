# EcoTrack - Earth Karma Network

A community-driven platform for tracking and verifying eco-friendly activities.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn-ui
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)

## Local Development

### Prerequisites
- Node.js 18+ (or Bun)
- Supabase account

### Setup

```bash
# Clone the repository
git clone https://github.com/GingerBaddie/earth-karma-net.git
cd earth-karma-net

# Install dependencies
npm install
# or: bun install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
# or: bun run dev
```

### Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Deployment

### Option 1: Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 2: Netlify

1. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy via Netlify CLI or GitHub integration

### Option 3: Self-hosted with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```
