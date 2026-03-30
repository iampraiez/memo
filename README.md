<p align="center">
  <img src="public/logo.svg" width="120" height="120" alt="Memo Logo" />
</p>

# Memory Lane 🌟

> **Your personal history, beautifully preserved.**

Memory Lane is a modern, AI-powered personal timeline application that helps you capture, organize, and rediscover your most precious memories. Built with Next.js, PostgreSQL, and Google's Gemini AI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.28-orange)](https://pnpm.io/)

## ✨ Core Platform Features

- **📝 Rich Text Sanctuary** - Beautiful, customized Tiptap editor with elegant serif typography for memories
- **🤖 AI Heritage Generation** - Google Gemini integration transforms individual memories into cohesive, chaptered narratives
- **⏳ Digital Memory Capsules** - Server-enforced, time-locked future memories that unlock on specific dates
- **👥 Family & Circles** - RBAC-secured private sharing and collaborative circles with real-time notifications
- **⚡ Pure Server-Side Architecture** - High-reliability state model powered by direct PostgreSQL synchronization and React Query hydration
- **✨ Premium UI/UX** - Fluid transitions (Framer Motion), Immersive Reading Mode, and gamified streak analytics
- **📤 Heritage Exports** - Beautifully formatted PDF and DOCX exports with intelligently interspersed imagery

## 📸 Sneak Peek

_(Add production screenshots here: Dashboard, Immersive Reader, Memory Creation Modal)_

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 10+
- **PostgreSQL** 14+ database
- **Google Cloud** account (for OAuth and Gemini AI)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/iampraiez/memo.git
   cd memo
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

- **[PostgreSQL](https://www.postgresql.org/)** - Primary database (Single Source of Truth)
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database toolkit
- **[NextAuth.js 5](https://next-auth.js.org/)** - Authentication
- **[Nodemailer](https://nodemailer.com/)** - Email delivery

### State Management

- **[TanStack Query v5](https://tanstack.com/query)** - Pure server-side state model with direct API synchronization
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client UI state management

### Media & Document Workflows

- **[Cloudinary](https://cloudinary.com/)** - Optimized asset CDN and image transformations
- **[jsPDF & docx](https://github.com/parallax/jsPDF)** - On-device document generation with embedded media

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

| Variable               | Required | Description                          |
| ---------------------- | -------- | ------------------------------------ |
| `DATABASE_URL`         | ✅       | PostgreSQL connection string         |
| `AUTH_SECRET`          | ✅       | Random string for session encryption |
| `AUTH_URL`             | ⚠️       | Base URL (auto-detected in dev)      |
| `AUTH_GOOGLE_ID`       | ❌       | Google OAuth client ID               |
| `AUTH_GOOGLE_SECRET`   | ❌       | Google OAuth client secret           |
| `EMAIL_USER`           | ❌       | SMTP email address                   |
| `EMAIL_PASS`           | ❌       | SMTP password/app password           |
| `GEMINI_API_KEY`       | ✅       | Google Gemini API key                |
| `DROPBOX_ACCESS_TOKEN` | ❌       | Dropbox integration token            |
| `NODE_ENV`             | ✅       | Environment (development/production) |
| `NEXT_PUBLIC_APP_URL`  | ✅       | Public app URL                       |

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

### Docker (Production Ready)

Memory Lane includes a highly optimized Dockerfile for containerized deployment.

```bash
# Build the production image multi-stage
docker build -t memory-lane-prod .

# Run container (injecting env vars from secure vault or .env)
docker run -d -p 3000:3000 --env-file .env.production --name memory-lane memory-lane-prod
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
