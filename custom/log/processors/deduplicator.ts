import { IProcessor, LogEntry } from "../types";
import { config } from "../config";

export class Deduplicator implements IProcessor {
  private lastSeen: Map<string, number> = new Map();

  process(entry: LogEntry): LogEntry | null {
    if (!config.deduplication.enabled) return entry;
    if (entry.level !== "error" && entry.level !== "warn") return entry;

    const key = `${entry.level}:${entry.message}`;
    const now = Date.now();
    const lastTime = this.lastSeen.get(key) || 0;

    if (now - lastTime < config.deduplication.windowMs) {
      return null; 
    }

    this.lastSeen.set(key, now);
    return entry;
  }
}
