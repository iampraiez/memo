# Custom Modular Logger

A feature-rich, modular logging system designed for production monitoring with Telegram integration.

## 🏗️ Architecture

The logger uses an orchestration pipeline:
`Log Call` → `Processors` → `Internal Tracking` → `Transports`

### 1. Processors (`/processors`)
Log entries are enriched or filtered before being sent:
- **Context Collector**: Gathers URL, UserAgent, and Memory usage.
- **Deduplicator**: Squashes repeat errors within a 5-minute window to prevent spam.
- **Formatter**: Prepares strings for Console (colors) and Telegram (HTML).

### 2. Core (`/core`)
- **Logger.class**: Orchestrates the whole flow.
- **ErrorTracker.class**: Keeps in-memory statistics of unique errors for daily reports.

### 3. Transports (`/transports`)
Where the logs actually go:
- **Console**: Standard output for development.
- **File**: (Server-only) Persistent storage in `./logs/app.log`.
- **Telegram**: (Server-only) Real-time alerts for WARN/ERROR levels.

### 4. Reporters (`/reporters`)
- **Daily Report**: Aggregates all errors tracked by the `ErrorTracker` into a single summary.
- **Health Check**: Provides a snapshot of memory usage and error counts.

---

## 🚀 Setup Instructions

### 1. Generate Telegram Keys
1. **Bot Token**:
   - Message [@BotFather](https://t.me/BotFather) on Telegram.
   - Use `/newbot` to create a bot and get your **API Token**.
2. **Chat ID**:
   - Message [@userinfobot](https://t.me/userinfobot) to get your personal **ID**.

### 2. Configure Environment
Add these to your `.env` file:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 3. Usage
```typescript
import { logger } from "@/custom/log";

logger.info("Application started");
logger.error("Database connection failed", new Error("Timeout"));
```

## 📊 Daily Reports & Automation

The logger is designed to send a summary of tracked errors. I've set up Vercel Crons to automate this.

**Endpoint:** `/api/cron/daily-report`

### 1. Automation Setup (Done)
I have already configured your `vercel.json` and `.env`:
- **vercel.json**: Added a corn job that runs at 9 AM UTC daily.
- **.env**: Added a `CRON_SECRET` to secure the route.

### 2. How to trigger manually
If you want to test the report right now:
`https://your-domain.com/api/cron/daily-report?key=MEMO_DAILY_REPORT_SECURE_TOKEN_2026`

### 3. Setup Vercel Cron (Vercel Dashboard)
When you deploy this to Vercel, the cron should be automatically detected. You can view it in your **Vercel Project Dashboard** under the **Cron** tab.
