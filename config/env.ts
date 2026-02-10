import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().optional(),
  DROPBOX_ACCESS_TOKEN: z.string().optional(),
  DROPBOX_APP_KEY: z.string().optional(),
  DROPBOX_APP_SECRET: z.string().optional(),
  DROPBOX_REFRESH_TOKEN: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
});

const isServer = typeof window === "undefined";

function validateEnv() {
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  });

  if (!clientResult.success) {
    throw new Error("Invalid client environment variables");
  }

  if (isServer) {
    const serverResult = serverSchema.safeParse(process.env);
    if (!serverResult.success) {
      throw new Error("Invalid server environment variables");
    }
    return { ...serverResult.data, ...clientResult.data };
  }

  return clientResult.data as any;
}

export const env = validateEnv() as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;
