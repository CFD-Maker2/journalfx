# Security Best Practices

## Environment Variables

### 1. Keep Secrets Private
- **Never commit `.env` files to version control**
- `.env` is already listed in `.gitignore` — verify it's never tracked
- Use `.env.example` templates for documentation only

### 2. Generate Secure Secrets

#### JWT_SECRET (Backend)
Generate a strong 32+ character random string:

**Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**macOS/Linux (Bash):**
```bash
openssl rand -hex 32
```

#### MongoDB URI
- **Development:** Use `mongodb://localhost:27017/trading-journal`
- **Production:** Use MongoDB Atlas with strong credentials
  - Create dedicated user for this app
  - Use IP whitelist
  - Enable encryption in transit (TLS)

### 3. Secret Rotation Strategy

#### When to Rotate:
- After team member departure
- If secret is accidentally exposed
- Quarterly security review (optional but recommended)
- After deployment to production

#### Rotation Steps:
1. Generate new secret value
2. Test with new secret in local environment
3. Update `.env` file
4. Restart backend server
5. Monitor logs for authentication errors
6. Schedule old secret removal if using key versioning

### 4. Frontend Security
- Frontend runs on port `8080` — ensure CORS is properly configured on backend
- No sensitive data should be stored in localStorage — use secure HTTP-only cookies for auth tokens
- API calls go through `src/lib/api.ts` — centralize auth headers there

### 5. Backend Configuration

#### CORS Settings
Update `backend-code/server.js`:
```javascript
// Only allow frontend origin
const ALLOWED_ORIGINS = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
```

#### Database Security
- Never expose MongoDB connection string in client code
- Use environment variables for all sensitive config
- Enable authentication on MongoDB
- Use separate credentials for dev/prod environments

### 6. Auth Middleware Best Practices
- JWTs use `HS256` algorithm with strong secret
- Token expiration: Set reasonable TTL (recommend 1-7 days)
- Refresh tokens: Implement rotation on each refresh
- Logout: Maintain server-side token blacklist if needed

### 7. Code Examples

#### Checking which secrets are in use:
```bash
# Search for secret references
grep -r "process.env" backend-code --include="*.js"
grep -r "VITE_" src --include="*.ts" --include="*.tsx"
```

#### Verifying .env exclusion:
```bash
# Should output nothing if properly ignored
git ls-files | grep -E "\.env$"
```

### 8. Deployment Checklist
- [ ] All `.env` files are in `.gitignore`
- [ ] Production secrets are securely managed (e.g., environment variables in CI/CD)
- [ ] CORS origins are restricted to production domain
- [ ] MongoDB Atlas cluster has IP whitelist and strong auth
- [ ] JWT secret is strong (32+ characters, high entropy)
- [ ] Backend HTTPS is enforced in production
- [ ] CORS cookies use `Secure` and `HttpOnly` flags

### 9. Incident Response
If secrets are compromised:
1. Immediately regenerate JWT_SECRET
2. Reset MongoDB credentials
3. Review git history for accidental commits: `git log --all --full-history -- backend-code/.env`
4. Remove from history if found: `git filter-branch --tree-filter 'rm -f backend-code/.env'`
5. Force push to remote (if safe to do so)
6. Audit all logs for unauthorized access

### 10. Resources
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security-checklist/)
