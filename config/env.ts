import { z } from "zod";

// Next.js automatically loads .env files, so manual dotenv.config() is redundant here.

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().optional(),
  DROPBOX_ACCESS_TOKEN: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
