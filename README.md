# NutriTrack

AI-powered calorie and nutrition tracker. Log meals by sending photos to a Discord bot or uploading through the web app — Google Gemini analyzes the image and estimates macros automatically.

## Features

- **Onboarding** — enter your age, gender, height, weight, activity level, and goal. Calculates personalized calorie and macro targets using the Mifflin-St Jeor equation.
- **Discord bot** — send a meal photo via DM or use slash commands:
  - `/link` — get your Discord ID to link your account
  - `/log <description>` — log a meal by text (e.g. `/log 2 eggs and toast`)
  - `/status` — see today's calorie and macro progress
  - `/meals` — view your last 5 meals
- **AI meal analysis** — Google Gemini estimates calories, protein, carbs, fat, fiber, sugar, and sodium from a photo
- **Health rating** — each meal gets a 0-100 score based on macro balance, fiber, sugar, sodium, and processing level
- **Weekly calendar** — day-by-day view with color-coded meal bubbles, expandable to show full macro breakdown
- **Natural language editing** — type things like "I only ate half" or "the protein should be 35g" and AI updates the meal
- **Mobile + web** — responsive design, works on any device

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Database**: SQLite via Prisma ORM (libsql adapter)
- **AI**: Google Gemini (gemini-2.0-flash) for image analysis and NLP editing
- **Bot**: Discord.js with slash commands

## Setup

### 1. Clone and install

```bash
git clone https://github.com/PHILLJAY/nutriTrack.git
cd nutritrack
npm install
```

### 2. Environment variables

Create a `.env` file:

```bash
DATABASE_URL="file:prisma/dev.db"
GEMINI_API_KEY="your-google-ai-key"          # https://aistudio.google.com/apikey
DISCORD_BOT_TOKEN="your-discord-bot-token"    # https://discord.com/developers
SESSION_SECRET="any-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database

```bash
npx prisma migrate deploy
```

### 4. Run

```bash
# Web app
npm run dev

# Discord bot (separate terminal)
npm run bot
```

Open `http://localhost:3000` to complete onboarding.

### 5. Link Discord

1. Add the bot to your server via OAuth2 (Developer Portal → OAuth2 → URL Generator → check `bot` + permissions)
2. DM the bot `/link` — it gives you your Discord ID
3. Paste the ID in NutriTrack → Settings → Discord User ID

## Deploying to Railway

The project includes a `Dockerfile` and `railway.toml` for one-click deployment.

1. Push to GitHub
2. Create a project on [railway.app](https://railway.app) → Deploy from GitHub repo
3. Add a **Volume** with mount path `/data`
4. Set environment variables:
   ```
   DATABASE_URL=file:/data/db/dev.db
   GEMINI_API_KEY=...
   DISCORD_BOT_TOKEN=...
   SESSION_SECRET=...
   NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
   ```
5. Deploy — the SQLite database and uploaded images persist across restarts

## Project Structure

```
src/
├── app/
│   ├── onboarding/        # Multi-step onboarding wizard
│   ├── dashboard/         # Weekly calendar + meal tracking
│   ├── settings/          # Discord linking + profile
│   └── api/
│       ├── onboarding/    # Create user + calculate targets
│       ├── meals/         # CRUD + AI analysis + NLP edit
│       ├── user/          # Profile get/update
│       └── discord/       # Link Discord account
├── components/
│   ├── onboarding/        # Step components
│   └── dashboard/         # Calendar, bubbles, detail sheet, editors
├── lib/
│   ├── db.ts              # Prisma client
│   ├── gemini.ts          # Gemini API (image + NLP)
│   ├── discord.ts         # Bot + slash commands
│   ├── nutrition.ts       # BMR/TDEE calculations
│   ├── health-rating.ts   # 0-100 scoring algorithm
│   ├── session.ts         # Cookie session management
│   └── image-store.ts     # File upload handling
└── types/                 # Shared TypeScript types
```
