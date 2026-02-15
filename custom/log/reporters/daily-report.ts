import { Logger } from "../core/logger.class";
import { TelegramTransport } from "../transports/telegram.transport";
import { config } from "../config";

export async function sendDailyReport(logger: Logger) {
  if (!config.telegram.enabled) return "Telegram disabled in config";

  const stats = logger.tracker.getDailyStats();
  if (stats.length === 0) {
    const telegram = new TelegramTransport();
    await telegram.sendMessage("✅ <b>Daily Report:</b> No errors tracked in the last 24 hours.");
    return "Empty report sent to Telegram";
  }

  let report = "📊 <b>DAILY ERROR REPORT</b>\n";
  report += "━━━━━━━━━━━━━━━━━━━━\n\n";

  stats.sort((a, b) => b.count - a.count);

  for (const s of stats) {
    report += `🔴 <b>Count: ${s.count}</b>\n`;
    report += `<blockquote>${s.message}</blockquote>\n`;
    report += `<i>First: ${new Date(s.firstSeen).toLocaleTimeString()} | Last: ${new Date(s.lastSeen).toLocaleTimeString()}</i>\n\n`;
  }

  const telegram = new TelegramTransport();
  await telegram.sendMessage(report);

  // Clear tracker after report
  logger.tracker.clear();
  return `Report with ${stats.length} errors sent to Telegram`;
}
