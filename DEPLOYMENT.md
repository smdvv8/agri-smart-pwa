# Deployment Guide

## Neon PostgreSQL

1. Create a Neon project.
2. Copy the pooled PostgreSQL connection string.
3. Add it to Vercel as `DATABASE_URL`.
4. From a trusted machine with production env loaded, run:

```bash
npx prisma migrate deploy
```

## Cloudinary

1. Create a Cloudinary account.
2. Create or use a cloud.
3. Copy:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Add them to Vercel environment variables.

## OpenAI

1. Create an API key in OpenAI Platform.
2. Add it as `OPENAI_API_KEY`.
3. Optional: set `OPENAI_MODEL`.

## Hugging Face

1. Create a Hugging Face access token.
2. Add it as `HUGGINGFACE_API_KEY`.
3. Optional: set `HUGGINGFACE_PLANT_MODEL`.

## OpenWeatherMap

1. Create an OpenWeatherMap key.
2. Enable the plan/API access required for One Call API 3.0.
3. Add it as `OPENWEATHER_API_KEY`.

## Vercel

1. Push project to GitHub.
2. Import repository in Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Add environment variables:

```env
DATABASE_URL=
JWT_SECRET=
APP_URL=https://your-domain.vercel.app
ENVIRONMENT=production
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
OPENWEATHER_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

7. Deploy.

## Production Checklist

- `JWT_SECRET` is long and random.
- No secret starts with `NEXT_PUBLIC_`.
- `/api/health` says providers are configured.
- `npm run check-env`, `npm run typecheck`, `npm run lint`, and `npm run build` pass before deploy.
- Registration/login works.
- AI endpoints rate limit excessive requests.
- Admin user is created securely through seed env or direct DB update.
- PWA manifest loads at `/manifest.webmanifest`.
- Service worker loads in production.
- Android install prompt works in Chrome.
- iPhone Add to Home Screen works in Safari.
- Offline page appears when network is unavailable.

## Troubleshooting

- `DATABASE_URL missing`: add the env var server side and redeploy.
- OpenWeather error: verify One Call API 3.0 is enabled for the key.
- Hugging Face model loading error: wait and retry, or set another image classification model in `HUGGINGFACE_PLANT_MODEL`.
- Cloudinary upload error: check cloud name, API key, API secret and file type.
- Admin redirect to dashboard: the logged-in user does not have role `ADMIN`.
