import { IProcessor, LogEntry, LogContext } from "../types";
import { config } from "../config";

export class ContextCollector implements IProcessor {
  process(entry: LogEntry): LogEntry {
    const context: LogContext = {
      ...entry.context,
      environment: config.environment,
      timestamp: new Date().toISOString(),
    };

    if (config.isServer) {
      if (typeof process !== "undefined") {
        context.memoryUsage = process.memoryUsage();
      }
    } else {
      context.url = typeof window !== "undefined" ? window.location.href : "unknown";
      context.userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
    }

    return { ...entry, context };
  }
}
