import { ITransport, LogEntry } from "../types";
import { config } from "../config";

export class FileTransport implements ITransport {
  async send(entry: LogEntry): Promise<void> {
    if (!config.isServer) return;

    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      
      const logPath = path.join(process.cwd(), config.file.logDir);
      
      try {
        await fs.access(logPath);
      } catch {
        await fs.mkdir(logPath, { recursive: true });
      }

      const logFile = path.join(logPath, config.file.fileName);
      const line = JSON.stringify({
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        context: entry.context,
      }) + "\n";

      await fs.appendFile(logFile, line);
    } catch (error) {
      console.error("[FileTransport] Failed to write log to file:", error);
    }
  }
}
