# Trading Journal Backend

Express.js + MongoDB backend for the Trading Journal application.

## Setup

1. **Install MongoDB** (or use MongoDB Atlas)
   - Local: https://www.mongodb.com/try/download/community
   - Atlas: https://www.mongodb.com/atlas

2. **Install dependencies**
   ```bash
   cd backend-code
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Journal Entries
- `GET /api/journal` - Get all entries
- `GET /api/journal/:id` - Get single entry
- `POST /api/journal` - Create entry
- `PUT /api/journal/:id` - Update entry
- `DELETE /api/journal/:id` - Delete entry
- `GET /api/journal/stats/summary` - Get statistics

### Mood Logs
- `GET /api/mood` - Get all mood logs
- `POST /api/mood` - Create mood log
- `PUT /api/mood/:id` - Update mood log
- `DELETE /api/mood/:id` - Delete mood log
- `GET /api/mood/stats/weekly` - Get weekly stats

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password

### Reflections
- `GET /api/reflections` - Get all reflections
- `POST /api/reflections` - Create reflection
- `PUT /api/reflections/:id` - Update reflection
- `DELETE /api/reflections/:id` - Delete reflection

## Connecting Frontend

Update your frontend API calls to point to `http://localhost:5000/api` (or your deployed URL).

Example API service:
```typescript
const API_URL = 'http://localhost:5000/api';

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  // ... other methods
};
```

## Deployment

Deploy to:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com
