import { Logger } from "../core/logger.class";
import { TelegramTransport } from "../transports/telegram.transport";
import { config } from "../config";

export async function checkHealth(logger: Logger) {
  if (!config.telegram.enabled) return "Telegram disabled in config";

  const telegram = new TelegramTransport();
  const stats = logger.tracker.getDailyStats();

  let status = "🏥 <b>SYSTEM HEALTH</b>\n";
  status += "━━━━━━━━━━━━━━━━━━━━\n\n";
  status += `🟢 <b>Status:</b> Online\n`;
  status += `📊 <b>Queued Errors:</b> ${stats.length}\n`;
  status += `📉 <b>Memory Usage:</b>\n`;
  status += `<code>${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB</code>`;

  await telegram.sendMessage(status);
  return "Health check sent to Telegram";
}
