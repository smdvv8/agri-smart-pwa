# Run Locally on Windows

1. Install Node.js 22+ or 24+ from `https://nodejs.org`.
2. Open PowerShell in the project folder:

```powershell
cd "C:\Users\samad\Documents\AgriSmart TJ\agri-smart-pwa"
```

3. Install dependencies:

```powershell
npm install
```

4. Create Neon PostgreSQL:
   - Go to Neon.
   - Create a project.
   - Copy the PostgreSQL connection string.

5. Create `.env` from `.env.example`.

6. Add `DATABASE_URL`, `JWT_SECRET` and provider keys.

7. Generate Prisma Client:

```powershell
npx prisma generate
```

8. Create tables:

```powershell
npx prisma migrate dev --name init
```

9. Seed regions, crops and diseases:

```powershell
npx prisma db seed
```

10. Start dev server:

```powershell
npm run dev
```

If Next.js prints `Slow filesystem detected`, add this project folder to the
Microsoft Defender exclusion list. This project also disables Turbopack's dev
filesystem cache in `next.config.js` to avoid very slow `.next/dev` cache
compaction on affected Windows machines. If local development is still slow,
try the webpack fallback:

```powershell
npm run dev:webpack
```

11. Open `http://localhost:3000`.

12. Check registration:
    - Create a farmer account.
    - Confirm redirect to `/dashboard`.

13. Check weather:
    - Open `/weather`.
    - Select a seeded region.
    - If `OPENWEATHER_API_KEY` is missing, the app must show an error.

14. Check AI irrigation advice:
    - Open `/irrigation`.
    - Fill region, crop, soil, growth stage and field size.
    - If `OPENAI_API_KEY` is missing, the app must show an error.

15. Check photo analysis:
    - Open `/diagnosis`.
    - Upload JPEG/PNG/WebP up to 6 MB.
    - Requires Cloudinary, Hugging Face and OpenAI keys.

16. Check market:
    - Open `/market/new`.
    - Add product with photo.
    - Open `/market` and filter/search.

Useful checks:

```powershell
npm run check-env
npm run smoke-test
npm run typecheck
npm run lint
npm run build
curl http://localhost:3000/api/health
```
