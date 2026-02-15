export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  args?: unknown[];
  error?: Error;
}

export interface LogContext {
  url?: string;
  userAgent?: string;
  memoryUsage?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  environment: string;
  [key: string]: unknown;
}

export interface ITransport {
  send(entry: LogEntry): Promise<void>;
}

export interface IProcessor {
  process(entry: LogEntry): LogEntry | null;
}

export interface ErrorStats {
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  stack?: string;
}
