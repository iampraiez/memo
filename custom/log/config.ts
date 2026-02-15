export const config = {
  isDev: process.env.NODE_ENV === "development",
  isServer: typeof window === "undefined",
  environment: process.env.NODE_ENV || "development",

  telegram: {
    enabled:
      !!process.env.TELEGRAM_BOT_TOKEN &&
      !!process.env.TELEGRAM_CHAT_ID &&
      process.env.NODE_ENV === "production",
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
    minLevel: "warn",
  },

  file: {
    enabled: typeof window === "undefined" && process.env.NODE_ENV !== "production",
    logDir: "./logs",
    fileName: "app.log",
  },

  deduplication: {
    enabled: true,
    windowMs: 5 * 60 * 1000,
  },

  dailyReport: {
    enabled: process.env.NODE_ENV === "production",
    scheduledHour: 6,
  },
};
