import { Logger } from "./core/logger.class";
import { sendDailyReport } from "./reporters/daily-report";
import { checkHealth } from "./reporters/health-check";

export const logger = new Logger();

export const reporters = {
  sendDailyReport: () => sendDailyReport(logger),
  checkHealth: () => checkHealth(logger),
};

export default logger;

export * from "./types";
