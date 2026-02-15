import { ITransport, LogEntry } from "../types";
import { Formatter } from "../processors/formatter";

export class ConsoleTransport implements ITransport {
  async send(entry: LogEntry): Promise<void> {
    const formatted = Formatter.formatForConsole(entry);

    switch (entry.level) {
      case "info":
        console.log(formatted, ...(entry.args || []));
        break;
      case "warn":
        console.warn(formatted, ...(entry.args || []));
        break;
      case "error":
        console.error(formatted, ...(entry.args || []));
        break;
      case "debug":
        console.debug(formatted, ...(entry.args || []));
        break;
    }
  }
}
