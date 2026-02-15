import { LogEntry, LogLevel } from "../types";

export class Formatter {
  static formatForConsole(entry: LogEntry): string {
    const emoji = this.getEmoji(entry.level);
    return `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`;
  }

  static formatForTelegram(entry: LogEntry): string {
    const emoji = this.getEmoji(entry.level);
    const label = entry.level.toUpperCase();
    
    let message = `${emoji} <b>${label}</b>\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `💬 <b>Message:</b>\n`;
    message += `<blockquote>${this.escapeHtml(entry.message)}</blockquote>\n`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += `\n🛠 <b>Context:</b>\n`;
      message += `<code>${this.escapeHtml(JSON.stringify(entry.context, null, 2))}</code>\n`;
    }
    
    if (entry.error?.stack) {
      const cleanStack = entry.error.stack.split("\n").slice(0, 6).join("\n");
      message += `\n📑 <b>Stack Trace:</b>\n`;
      message += `<pre>${this.escapeHtml(cleanStack)}</pre>`;
    }

    return message;
  }

  private static getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR: return "🔴";
      case LogLevel.WARN: return "🟡";
      case LogLevel.INFO: return "🔵";
      case LogLevel.DEBUG: return "⚪";
      default: return "⚫";
    }
  }

  private static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
