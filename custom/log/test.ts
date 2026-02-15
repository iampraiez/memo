import "dotenv/config";
import { logger, reporters } from "./logger";
import { config } from "./config";

async function testLogger() {
  console.log("--- Starting Logger Test ---");
  console.log("Telegram Enabled:", config.telegram.enabled);
  console.log("Environment:", config.environment);

  logger.info("This is an info message");
  logger.warn("This is a warning message");
  logger.error("This is an error message", new Error("Test Error Check"));

  console.log("Triggering same error again (should be suppressed by deduplicator)...");
  logger.error("This is a dummy error message for telegram");

  console.log("Checking health...");
  const health = await reporters.checkHealth();
  console.log("Health:", health);

  console.log("Sending daily report summary...");
  const report = await reporters.sendDailyReport();
  console.log("Report:", report);

  console.log("Waiting for background tasks...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("--- Logger Test Completed ---");
}

if (require.main === module) {
  testLogger().catch(console.error);
}
