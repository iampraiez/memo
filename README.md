# Memory Lane 🌟

> **Your personal history, beautifully preserved.**

Memory Lane is a modern, AI-powered personal timeline application that helps you capture, organize, and rediscover your most precious memories. Built with Next.js, PostgreSQL, and Google's Gemini AI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.28-orange)](https://pnpm.io/)

## ✨ Features

- **📝 Rich Memory Capture** - Create detailed memories with text, images, tags, and mood tracking
- **🤖 AI-Powered Stories** - Generate beautiful narratives from your memories using Google Gemini
- **🔍 Advanced Search** - Full-text search with filters for tags, dates, and moods
- **📅 Timeline View** - Visualize your life story with an interactive, chronological timeline
- **👥 Family Sharing** - Share memories with family members and collaborate on your history
- **🔐 Secure & Private** - End-to-end encryption with NextAuth.js authentication
- **📱 Progressive Web App** - Install on any device with offline support
- **📊 Analytics Dashboard** - Insights into your memory patterns and trends
- **📤 Export Options** - Download your memories as PDF or Word documents

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 10+
- **PostgreSQL** 14+ database
- **Google Cloud** account (for OAuth and Gemini AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/memory-lane.git
   cd memory-lane
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/memo
   
   # Authentication
   AUTH_SECRET=your-secret-key-here
   AUTH_URL=http://localhost:3000
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret
   
   # Email (Gmail SMTP)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   
   # AI
   GEMINI_API_KEY=your-gemini-api-key
   
   # Optional
   DROPBOX_ACCESS_TOKEN=your-dropbox-token
   
   # App
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   pnpm drizzle-kit push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Core
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling

### Backend & Database
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database toolkit
- **[NextAuth.js 5](https://next-auth.js.org/)** - Authentication
- **[Nodemailer](https://nodemailer.com/)** - Email delivery

### State & Data
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client state management
- **[Dexie.js](https://dexie.org/)** - IndexedDB wrapper for offline support

### AI & Integrations
- **[Google Gemini AI](https://ai.google.dev/)** - Story generation
- **[Axios](https://axios-http.com/)** - HTTP client

### UI Components
- **[Phosphor Icons](https://phosphoricons.com/)** - Icon library
- **[Lucide React](https://lucide.dev/)** - Additional icons
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Framer Motion](https://www.framer.com/motion/)** - Animations

### Development
- **[ESLint](https://eslint.org/)** - Code linting
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations
- **[tsx](https://github.com/privatenumber/tsx)** - TypeScript execution

## 📁 Project Structure

```
memory-lane/
├── app/                      # Next.js App Router
│   ├── _pages/              # Page components
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── memories/       # Memory CRUD
│   │   ├── stories/        # AI story generation
│   │   └── ...
│   ├── auth/               # Auth pages
│   ├── mainpage/           # Main application
│   └── onboarding/         # User onboarding
├── components/              # React components
│   ├── ui/                 # Base UI components
│   └── ...                 # Feature components
├── config/                  # Configuration
│   └── env.ts              # Environment validation
├── drizzle/                 # Database
│   ├── db/                 # Schema definitions
│   └── index.ts            # Database client
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities
│   ├── auth.ts             # Auth configuration
│   ├── api.ts              # API helpers
│   └── utils.ts            # Utility functions
├── public/                  # Static assets
├── services/                # External services
├── stores/                  # Zustand stores
└── types/                   # TypeScript types
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm drizzle-kit push        # Push schema changes
pnpm drizzle-kit studio      # Open Drizzle Studio
```

## 🔐 Authentication Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to `.env`

### Email Authentication

For Gmail SMTP:
1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Add credentials to `.env` as `EMAIL_USER` and `EMAIL_PASS`

## 🤖 AI Story Generation

Memory Lane uses Google's Gemini AI to generate personalized stories from your memories.

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` as `GEMINI_API_KEY`
3. Navigate to the Story Generator page
4. Select date range, tone, and length
5. Generate your personalized narrative

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | Random string for session encryption |
| `AUTH_URL` | ⚠️ | Base URL (auto-detected in dev) |
| `AUTH_GOOGLE_ID` | ❌ | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | ❌ | Google OAuth client secret |
| `EMAIL_USER` | ❌ | SMTP email address |
| `EMAIL_PASS` | ❌ | SMTP password/app password |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `DROPBOX_ACCESS_TOKEN` | ❌ | Dropbox integration token |
| `NODE_ENV` | ✅ | Environment (development/production) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL |

## 📊 Database Schema

Key tables:
- **users** - User accounts and profiles
- **memories** - Memory entries with content
- **memoryMedia** - Attached images and files
- **memoryTags** - Tag associations
- **tags** - Tag definitions
- **stories** - AI-generated stories
- **reactions** - Memory reactions/likes
- **comments** - Memory comments
- **familyMembers** - Family sharing relationships

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t memory-lane .

# Run container
docker run -p 3000:3000 --env-file .env memory-lane
```

### Manual Deployment

```bash
# Build
pnpm build

# Start
pnpm start
```

## 🔒 Security

- All passwords are hashed with bcrypt
- Session tokens are encrypted
- CSRF protection enabled
- SQL injection prevention via Drizzle ORM
- XSS protection with React
- Environment variables validated with Zod

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting platform
- [Google](https://ai.google.dev/) for Gemini AI
- All open-source contributors

## 📧 Support

For support, email support@memorylane.app or open an issue on GitHub.

---

**Made with ❤️ by the Memory Lane team**