const isDev = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private lastAlertedAt: number = 0;
  private readonly ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

  private log(level: LogLevel, message: string, ...args: any[]) {
    // In production, we still want to see errors and warnings in the logs
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

  private async notifyAdmin(message: string, ...args: any[]) {
    if (!isServer || isDev) return;

    const now = Date.now();
    if (now - this.lastAlertedAt < this.ALERT_COOLDOWN) {
      this.info("[Logger] Admin notification suppressed (cooldown)");
      return;
    }

    try {
      // Use dynamic import to avoid circular dependency
      const { sendErrorReportEmail } = await import("@/services/email.service");
      
      const error = args.find(arg => arg instanceof Error) || new Error(message);
      const context = args.length > 0 ? JSON.stringify(args) : undefined;
      
      await sendErrorReportEmail(error, message);
      this.lastAlertedAt = now;
      this.info("[Logger] Admin notified of critical error");
    } catch (err) {
      // Avoid recursion if email fails
      console.error("[Logger] Failed to notify admin:", err);
    }
  }

  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
    
    // Auto-notify admin for errors in production
    if (!isDev) {
      this.notifyAdmin(message, ...args).catch(() => {});
    }
  }

  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }
}

export const logger = new Logger();
