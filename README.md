# AgriSmart TJ

AgriSmart TJ is a production-ready Next.js PWA for farmers in Tajikistan. It works as a normal website, Android PWA, iPhone Home Screen app and desktop web app without Supabase, Expo or Play Market.

The app uses real server-side providers only:

- PostgreSQL + Prisma ORM for data
- Custom JWT auth with bcrypt password hashing and httpOnly cookies
- OpenAI API for irrigation, agronomy chat and market price advice
- Hugging Face Inference API for plant disease image classification
- OpenWeatherMap for weather by saved region coordinates
- Cloudinary for plant and market photos

If a required key is missing, API routes return a clear provider error. The app does not generate fake weather, fake AI answers or random diagnosis.

## Features

- PWA landing page with install prompt, offline fallback, manifest and service worker
- Register/login/logout with custom auth
- Role based access: `FARMER`, `BUYER`, `ADMIN`
- Dashboard with weather, health check and quick actions
- Weather endpoint: `/api/weather/[regionId]`
- AI irrigation advisor with structured JSON saved to `IrrigationHistory`
- AI plant diagnosis with Cloudinary upload, Hugging Face classification and OpenAI advice
- AI agronomist chat in Russian and Tajik
- Marketplace with product photos, search, filters and phone CTA
- AI market price assistant using similar products and weather
- Admin panel with stats, users, products, diagnoses, crops, diseases and admin logs
- Russian/Tajik message dictionaries in `messages/`

## Project Structure

```txt
agri-smart-pwa/
├── app/
│   ├── api/
│   ├── admin/
│   ├── ai-chat/
│   ├── crop-guide/
│   ├── dashboard/
│   ├── diagnosis/
│   ├── history/
│   ├── irrigation/
│   ├── login/
│   ├── market/
│   ├── offline/
│   ├── profile/
│   ├── register/
│   ├── settings/
│   ├── weather/
│   ├── globals.css
│   ├── layout.tsx
│   ├── manifest.ts
│   └── page.tsx
├── components/
├── lib/
├── messages/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── icons/
│   ├── screenshots/
│   ├── offline.html
│   └── sw.js
├── middleware.ts
├── prisma.config.ts
├── next.config.js
├── RUN_LOCALLY.md
├── DEPLOYMENT.md
└── .env.example
```

## Environment Variables

Copy `.env.example` to `.env` and fill:

```env
DATABASE_URL=
JWT_SECRET=
APP_URL=http://localhost:3000
ENVIRONMENT=development
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
OPENWEATHER_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Optional:

```env
OPENAI_MODEL=gpt-4o-mini
HUGGINGFACE_PLANT_MODEL=mesabo/agri-plant-disease-resnet50
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_PHONE=
```

## Neon PostgreSQL

1. Create a Neon account.
2. Create a project and database.
3. Copy the pooled connection string.
4. Set it as `DATABASE_URL`.
5. Run Prisma migration and seed.

Render PostgreSQL also works if you use its external PostgreSQL connection URL.

## Provider Keys

- Cloudinary: Dashboard -> Settings -> API keys. Use cloud name, API key and API secret.
- OpenAI: Platform -> API keys. Put the key in `OPENAI_API_KEY`.
- Hugging Face: Settings -> Access Tokens. Put the token in `HUGGINGFACE_API_KEY`.
- OpenWeatherMap: API keys. This app uses One Call API 3.0 for 7-day forecast.

## Local Run

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

Health check:

```bash
curl http://localhost:3000/api/health
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run check-env
npm run check-i18n
npm run smoke-test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run db:studio
```

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add all environment variables in Project Settings.
4. Run production migration from a trusted machine:

```bash
npx prisma migrate deploy
```

5. Deploy.
6. Open `/api/health` and verify providers are configured.
7. Test install on Android and iPhone.

## PWA Install

Android:

1. Open the site in Chrome.
2. Tap install prompt or browser menu.
3. Choose Install app/Add to Home screen.

iPhone:

1. Open the site in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch AgriSmart TJ from the Home Screen.

## What to Show Judges

- Register/login with httpOnly cookie auth
- `/api/health` without exposing secrets
- Real weather request after `OPENWEATHER_API_KEY` is configured
- Real irrigation advice after `OPENAI_API_KEY` is configured
- Real plant image flow after Cloudinary + Hugging Face + OpenAI keys are configured
- Market product upload and Cloudinary photo URL
- Admin role access and product hiding
- PWA install prompt, standalone mode and offline fallback

## How to Verify

Run local checks after `.env` is configured and the dev server is running:

```bash
npm run check-env
npm run smoke-test
npm run typecheck
npm run lint
npm run build
```

Manual QA:

- Switch RU/TJ from the landing page, app shell or settings.
- Switch light/dark/system in settings.
- Register, log in, refresh and confirm the session persists.
- Open `/weather` and verify the OpenWeatherMap result or a clear provider error.
- Open `/diagnosis`, upload a JPEG/PNG/WebP image and verify the response contains `success: true` plus `data.photoUrl`.
- Open `/market/new`, upload a product photo and verify it appears in `/market`.
- Open `/offline` and test Add to Home Screen from the browser.
