# JournalFX Backend

Express and MongoDB API for the JournalFX frontend.

## Environment

Create `backend-code/.env` with:

```env
MONGODB_URI=mongodb://localhost:27017/trading-journal
JWT_SECRET=replace-this-with-a-secure-secret
PORT=5000
FRONTEND_URL=http://localhost:8080
GEMINI_API_KEY=replace-with-your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

## Run Locally

```sh
cd backend-code
npm install
npm run dev
```

Use `npm start` for a non-watch production-style run.

## Routes

The API is mounted under `/api` with these route groups:

- `/api/auth`
- `/api/journal`
- `/api/mood`
- `/api/profile`
- `/api/reflection`
- `/api/ai`
- `/api/health`

The frontend client in `src/lib/api.ts` expects the API to be available at `http://localhost:5000/api`.
