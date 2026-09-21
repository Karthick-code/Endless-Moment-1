# ENDLESS Moments

A production-oriented split deployment of the original ENDLESS Moments photo-studio application. The existing public site, authentication, CRM/leads, EmailJS diagnostics, project portfolio, animations and responsive UI are retained while the application is separated into independently deployable frontend and backend services.

## Architecture

- `frontend/` — React + Vite. Deploy this folder to Netlify (or another static host).
- `backend/` — Node.js + Express API. Deploy this folder to Render, Railway, Fly.io, etc.
- MongoDB — persistent application database.
- Cloudinary — optional backend image hosting for authenticated project image uploads.
- EmailJS / EmailJS — existing enquiry email delivery paths are preserved.
- Slack / Discord / Telegram — optional enquiry notifications. These are disabled automatically when their environment variables are empty.

## Project structure

```text
ENDLESS Moments/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── netlify.toml
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/notifications/
│   ├── utils/
│   ├── .env.example
│   ├── createAdmin.js
│   ├── package.json
│   └── server.js
├── metadata.json
├── README.md
└── .gitignore
```

## Local development

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite runs on `http://localhost:5173` by default.

Set `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Backend environment

Copy `backend/.env.example` to `backend/.env` and configure:

- `PORT` — API port, normally `5000` locally. Production platforms normally provide this automatically.
- `MONGODB_URI` — MongoDB connection string. `MONGO_URI` is also accepted for compatibility with the original project.
- `JWT_SECRET` — strong secret used for admin authentication. Do not commit it.
- `FRONTEND_URL` — exact frontend origin, for example `http://localhost:5173` or your Netlify URL.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — optional Cloudinary credentials. They stay backend-only.
- Existing EmailJS variables: `EmailJS_HOST`, `EmailJS_PORT`, `EmailJS_USER`, `EmailJS_PASS`, `COMPANY_EMAIL`, `CC_EMAIL`.
- Existing EmailJS variables: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `EMAILJS_USER_ID`, `EMAILJS_ACCESS_TOKEN`.
- `SLACK_WEBHOOK_URL` — optional Slack Incoming Webhook URL.
- `DISCORD_WEBHOOK_URL` — optional Discord Webhook URL.
- `TELEGRAM_BOT_TOKEN` — optional Telegram BotFather token.
- `TELEGRAM_CHAT_ID` — optional Telegram destination chat/group/channel ID.

## Admin account

For a fresh installation, the backend creates one admin account if no admin exists. You can override the defaults with:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-strong-password
```

For an explicit admin creation run:

```bash
cd backend
npm run create-admin
```

Do not use the development default credentials in a production deployment.

## Enquiry notifications

The enquiry flow is:

```text
Contact form
   ↓
POST /api/leads
   ↓
Validate + save to MongoDB/local development store
   ↓
Existing email delivery
   ↓
Slack / Discord / Telegram notifications (independent, non-blocking)
```

If a notification provider is unavailable or misconfigured, the lead remains successfully saved and the enquiry request is not failed because of that provider.

### Slack

Create an Incoming Webhook in Slack and put the URL in `SLACK_WEBHOOK_URL`.

### Discord

Create a webhook for the destination Discord channel and put it in `DISCORD_WEBHOOK_URL`.

### Telegram

Create a bot with `@BotFather`, put the bot token in `TELEGRAM_BOT_TOKEN`, and put the destination chat/group/channel ID in `TELEGRAM_CHAT_ID`.

## Cloudinary image handling

Authenticated project management supports uploading images through the backend to Cloudinary. The browser never receives the Cloudinary API secret. The resulting secure Cloudinary URL is stored with the project and is then served normally by the public portfolio.

If Cloudinary is not configured, the existing project workflow of entering externally hosted image URLs remains available.

## Netlify frontend deployment

Deploy the `frontend` directory as the Netlify base/root directory.

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND-DOMAIN`

`frontend/netlify.toml` contains the SPA fallback so React Router pages continue to work after a browser refresh.

## Backend deployment

Deploy the `backend` directory as the service root.

Typical settings:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: configure everything from `backend/.env.example`.

The backend does **not** serve the React application. CORS is restricted through `FRONTEND_URL`.

## Security

Never commit:

- MongoDB credentials
- JWT secrets
- Cloudinary API secrets
- EmailJS passwords
- Slack webhook URLs
- Discord webhook URLs
- Telegram bot tokens
- real `.env` files

The notification integrations intentionally live in backend-only code.
