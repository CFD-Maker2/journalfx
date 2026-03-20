# Trading Psychology Journal

A full-stack trading psychology journal application. The frontend is built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. The backend is an Express and MongoDB API in [backend-code](backend-code).

**Features:**
- Trade entry logging with emotion snapshots
- Daily mood check-ins
- Daily reflection prompts
- Mood trend analytics
- AI-powered insights

## Security First

⚠️ **Important:** Environment secrets are not tracked in git. See [SECURITY.md](SECURITY.md) for setup and best practices.

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Frontend Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Start dev server (runs on port 8080):
   ```sh
   npm run dev
   ```

### Backend Setup

1. Navigate to backend directory:
   ```sh
   cd backend-code
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create `.env` file from template:
   ```sh
   cp .env.example .env
   ```

4. Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/trading-journal
   JWT_SECRET=<generate-secure-random-32-chars>
   PORT=5000
   FRONTEND_URL=http://localhost:8080
   GEMINI_API_KEY=<your-gemini-api-key>
   GEMINI_MODEL=gemini-2.0-flash
   ```

5. Start dev server:
   ```sh
   npm run dev
   ```

The backend API runs on port 5000 and serves requests from `http://localhost:5000/api`.

## Available Commands

### Frontend
- `npm run dev` — Start development server (port 8080)
- `npm run build` — Create production build
- `npm run lint` — Run ESLint on source code
- `npm run preview` — Preview production build locally

### Backend
- `npm run dev` — Start development server with auto-reload (port 5000)
- `npm start` — Start server without auto-reload

## API Endpoints

Base URL: `http://localhost:5000/api`

- `/api/auth` — Authentication (register, login, logout)
- `/api/journal` — Journal entry CRUD operations
- `/api/mood` — Daily mood check-ins
- `/api/profile` — User profile management
- `/api/reflection` — Daily reflection prompts
- `/api/ai` — AI insights generation
- `/api/health` — Health check endpoint

## Project Structure

```
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── charts/              # Chart components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── layout/              # Layout components (Sidebar, MainLayout)
│   │   └── ui/                  # shadcn/ui primitive components
│   ├── pages/                    # Page components (Journal, Dashboard, etc.)
│   ├── contexts/                 # React contexts (AuthContext)
│   ├── hooks/                    # Custom hooks (useAuth, useAI, useToast)
│   ├── lib/                      # Utilities (api.ts, utils.ts)
│   ├── types/                    # TypeScript type definitions
│   └── main.tsx                  # Application entry point
│
├── backend-code/                 # Express API backend
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API route handlers
│   ├── middleware/               # Auth and custom middleware
│   ├── server.js                 # Express server setup
│   ├── .env                      # Environment variables (not tracked)
│   └── .env.example              # Environment template
│
├── .env.example                  # Frontend env template
├── SECURITY.md                   # Security best practices
├── README.md                     # This file
└── vite.config.ts               # Vite configuration
```

## Environment Variables

Both frontend and backend use environment files for configuration. Templates are provided:

- **Frontend:** `.env.example`
- **Backend:** `backend-code/.env.example`

Copy templates to `.env` and fill in your values. **Never commit `.env` files.**

## Security

For detailed security best practices, secret rotation, and deployment checklist, see [SECURITY.md](SECURITY.md).

## Development Workflow

1. **Start both servers:**
   - Terminal 1: `npm run dev` (frontend)
   - Terminal 2: `cd backend-code && npm run dev` (backend)

2. **Frontend listens on:** `http://localhost:8080`
3. **Backend API on:** `http://localhost:5000/api`
4. **Frontend connects to backend** via `src/lib/api.ts`

## Testing & Validation

- **Frontend build:** `npm run build`
- **Frontend lint:** `npm run lint`
- **Backend:** Test with Postman, curl, or frontend UI

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design included
