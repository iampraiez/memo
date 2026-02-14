const isDev = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private lastAlertedAt: number = 0;
  private readonly ALERT_COOLDOWN = 5 * 60 * 1000;

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (!isDev && level !== "error" && level !== "warn") return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "info":
        console.log(prefix, message, ...args);
        break;
      case "warn":
        console.warn(prefix, message, ...args);
        break;
      case "error":
        console.error(prefix, message, ...args);
        break;
      case "debug":
        console.debug(prefix, message, ...args);
        break;
    }
  }

  private async notifyAdmin(message: string, ...args: unknown[]) {
    if (!isServer || isDev) return;

    const now = Date.now();
    if (now - this.lastAlertedAt < this.ALERT_COOLDOWN) {
      this.info("[Logger] Admin notification suppressed (cooldown)");
      return;
    }

    try {
      const { sendErrorReportEmail } = await import("@/services/email.service");

      const error =
        args.find((arg) => arg instanceof Error) || new Error(message);

      await sendErrorReportEmail(error, message);
      this.lastAlertedAt = now;
      this.info("[Logger] Admin notified of critical error");
    } catch (err) {
      console.error("[Logger] Failed to notify admin:", err);
    }
  }

  info(message: string, ...args: unknown[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log("error", message, ...args);

    if (!isDev) {
      this.notifyAdmin(message, ...args).catch(() => {});
    }
  }

  debug(message: string, ...args: unknown[]) {
    this.log("debug", message, ...args);
  }
}

export const logger = new Logger();
