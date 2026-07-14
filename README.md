# NutriTrack

AI-powered calorie and nutrition tracker. Log meals by sending photos to a Discord bot or uploading through the web app — Google Gemini analyzes the image and estimates macros automatically.

## Features

### Core
- **Onboarding** — enter your age, gender, height, weight, activity level, goal, and timezone. Calculates personalized calorie and macro targets using the Mifflin-St Jeor equation.
- **AI meal analysis** — Google Gemini estimates calories, protein, carbs, fat, fiber, sugar, and sodium from a photo
- **Manual text entry** — describe a meal in plain English (e.g. "2 eggs and toast") and AI estimates nutrition
- **Health rating** — each meal gets a 0-100 score based on macro balance, fiber, sugar, sodium, and processing level
- **Weekly calendar** — day-by-day view with color-coded meal bubbles, expandable to show full macro breakdown
- **Natural language editing** — type things like "I only ate half" or "the protein should be 35g" and AI updates the meal
- **Timezone support** — all times display in your local timezone

### Tracking & Analytics
- **Streak & habit tracking** — current streak, longest streak, and 90-day heatmap
- **Weekly & monthly reports** — aggregated nutrition data with calorie bar charts and macro pie charts
- **Week-over-week comparison** — compare this week vs last week with delta indicators
- **Body weight tracking** — log weight over time with a trend line chart
- **Water intake tracking** — tap to log glasses of water with a daily goal
- **Daily macro breakdown** — pie chart and progress bars for protein, carbs, and fat

### Smart Features
- **AI meal suggestions** — get meal ideas based on your remaining daily macros
- **Meal templates** — save meals as reusable templates for quick logging
- **Custom macro ratios** — set your own protein/carbs/fat split (balanced, high protein, keto, low fat presets)

### Discord Bot
- `/link` — get your Discord ID to link your account
- `/log <description>` — log a meal by text
- `/status` — see today's calorie and macro progress
- `/meals` — view your last 5 meals
- `/weekly` — 7-day nutrition summary
- `/goals` — see your current nutrition targets
- **Photo logging** — send a meal photo via DM and the bot analyzes it automatically

### Data & Settings
- **Data export** — download meal history as CSV or JSON
- **Settings page** — link Discord, set timezone, customize macro ratios

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui, Recharts
- **Database**: SQLite via Prisma ORM (libsql adapter)
- **AI**: Google Gemini (gemini-3.1-flash-lite) for image analysis, text analysis, NLP editing, and suggestions
- **Bot**: Discord.js with slash commands
- **Validation**: Zod schemas on all API routes

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
│   ├── dashboard/         # Weekly calendar + meal tracking + all widgets
│   ├── reports/           # Weekly/monthly nutrition reports
│   ├── settings/          # Discord, timezone, macros, export
│   └── api/
│       ├── onboarding/    # Create user + calculate targets
│       ├── meals/         # CRUD + AI analysis + NLP edit + suggestions
│       ├── templates/     # Meal template CRUD
│       ├── streaks/       # Streak calculation
│       ├── water/         # Water intake tracking
│       ├── weight/        # Body weight tracking
│       ├── export/        # CSV/JSON data export
│       ├── user/          # Profile get/update
│       └── discord/       # Link Discord account
├── components/
│   ├── onboarding/        # Step components
│   └── dashboard/         # Calendar, bubbles, detail sheet, editors,
│                          # streaks, water, weight, suggestions, charts
├── lib/
│   ├── db.ts              # Prisma client
│   ├── gemini.ts          # Gemini API (image, text, NLP, suggestions)
│   ├── discord.ts         # Bot + slash commands
│   ├── nutrition.ts       # BMR/TDEE calculations + custom macro ratios
│   ├── health-rating.ts   # 0-100 scoring algorithm
│   ├── session.ts         # HMAC-SHA256 cookie session
│   ├── image-store.ts     # File upload with validation
│   ├── streaks.ts         # Streak calculation logic
│   ├── timezone.ts        # Timezone-aware date helpers
│   └── validations.ts     # Zod schemas for all API routes
└── types/                 # Shared TypeScript types
```
