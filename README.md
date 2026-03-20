# JournalFX

JournalFX is a mini full-stack trading psychology journal. The frontend is built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. The backend is an Express and MongoDB API in [backend-code](backend-code).

## Frontend

```sh
npm install
npm run dev
```

The frontend runs on port `8080` by default.

## Backend

```sh
cd backend-code
npm install
npm run dev
```

Create `backend-code/.env` with these values before starting the API:

```env
MONGODB_URI=mongodb://localhost:27017/trading-journal
JWT_SECRET=replace-this-with-a-secure-secret
PORT=5000
FRONTEND_URL=http://localhost:8080
```

The frontend API client currently targets `http://localhost:5000/api` in `src/lib/api.ts`.

## Available Scripts

- `npm run dev` starts the frontend dev server
- `npm run build` creates a production frontend build
- `npm run lint` runs ESLint on the frontend code

## Project Structure

- `src/` contains the React frontend
- `backend-code/` contains the Express and MongoDB backend
- `src/components/ui/` contains the shared UI primitives used by the app
