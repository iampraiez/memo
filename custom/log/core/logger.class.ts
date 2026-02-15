import { LogLevel, LogEntry, ITransport, IProcessor } from "../types";
import { ErrorTracker } from "./error-tracker.class";
import { ContextCollector } from "../processors/context.collector";
import { Deduplicator } from "../processors/deduplicator";
import { ConsoleTransport } from "../transports/console.transport";
import { TelegramTransport } from "../transports/telegram.transport";
import { FileTransport } from "../transports/file.transport";
import { config } from "../config";

export class Logger {
  private processors: IProcessor[] = [];
  private transports: ITransport[] = [];
  public tracker: ErrorTracker;

  constructor() {
    this.tracker = new ErrorTracker();

    // Initialize standard processors
    this.processors.push(new ContextCollector());
    this.processors.push(new Deduplicator());

    // Initialize transports
    this.transports.push(new ConsoleTransport());

    if (config.isServer) {
      this.transports.push(new FileTransport());
      this.transports.push(new TelegramTransport());
    }
  }

  private async log<T>(level: LogLevel, message: string, ...args: T[]) {
    let entry: LogEntry | null = {
      level,
      message,
      timestamp: new Date().toISOString(),
      args: args.filter((a) => !(a instanceof Error)),
      error: args.find((a) => a instanceof Error),
    };

    // Run processors
    for (const processor of this.processors) {
      entry = processor.process(entry);
      if (!entry) return; // Suppressed by processor
    }

    // Track error
    if (level === LogLevel.ERROR) {
      this.tracker.track(entry);
    }

    // Run transports - Fire and forget (non-blocking)
    this.transports.forEach((t) => {
      t.send(entry!).catch((err) => {
        console.error(`[Logger] Transport ${t.constructor.name} failed:`, err);
      });
    });
  }

  info<T>(message: string, ...args: T[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn<T>(message: string, ...args: T[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error<T>(message: string, ...args: T[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }

  debug<T>(message: string, ...args: T[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}
