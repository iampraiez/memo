import axios, { AxiosError } from "axios";
import { ITransport, LogEntry, LogLevel } from "../types";
import { config } from "../config";
import { Formatter } from "../processors/formatter";

export class TelegramTransport implements ITransport {
  async send(entry: LogEntry): Promise<void> {
    if (!config.telegram.enabled) return;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minIndex = levels.indexOf(config.telegram.minLevel as LogLevel);
    const entryIndex = levels.indexOf(entry.level);
    
    if (entryIndex < minIndex) return;

    const text = Formatter.formatForTelegram(entry);
    
    // Background processing (non-blocking)
    this.sendMessage(text).catch(err => {
      console.error("[TelegramTransport] Error in background task:", err.message);
    });
  }

  async sendMessage(text: string): Promise<void> {
    const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
    
    try {
      await axios.post(url, {
        chat_id: config.telegram.chatId,
        text: text,
        parse_mode: "HTML",
      }, {
        timeout: 5000,
      });
    } catch (error: any) {
      if (error.response) {
        console.error("[TelegramTransport] API Error:", error.response.data);
      } else if (error.request) {
        console.error("[TelegramTransport] Network Error (No response):", error.message);
      } else {
        console.error("[TelegramTransport] Config Error:", error.message);
      }
    }
  }
}
