import { LogEntry, ErrorStats } from "../types";

export class ErrorTracker {
  private stats: Map<string, ErrorStats> = new Map();

  track(entry: LogEntry) {
    if (entry.level !== "error") return;

    const key = this.generateKey(entry);
    const existing = this.stats.get(key);

    if (existing) {
      existing.count++;
      existing.lastSeen = entry.timestamp;
    } else {
      this.stats.set(key, {
        message: entry.message,
        count: 1,
        firstSeen: entry.timestamp,
        lastSeen: entry.timestamp,
        stack: entry.error?.stack,
      });
    }
  }

  private generateKey(entry: LogEntry): string {
    const stackKey = entry.error?.stack?.split("\n")[0] || "";
    return `${entry.message}:${stackKey}`;
  }

  getDailyStats(): ErrorStats[] {
    return Array.from(this.stats.values());
  }

  clear() {
    this.stats.clear();
  }
}
