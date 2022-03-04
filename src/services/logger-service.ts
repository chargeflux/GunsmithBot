import { ILogObject, Logger } from "tslog";
import fs from "fs";

export const logger: Logger = new Logger({
  name: "Main",
  printLogMessageInNewLine: true,
});
const defaultLogFilename = "logs/GunsmithBot.log";

function logToTransport(logObject: ILogObject) {
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
  const message = `${logObject.date.toISOString()} ${logObject.logLevel.toUpperCase()} ` + 
  `[${logObject.loggerName} ${logObject.filePath}:${logObject.lineNumber}${logObject.functionName !== undefined ? " " + logObject.functionName : ""}]\n` +
  logObject.argumentsArray.join(" ")
  fs.appendFileSync(defaultLogFilename, message + "\n");
}

logger.attachTransport(
  {
    silly: logToTransport,
    trace: logToTransport,
    debug: logToTransport,
    info: logToTransport,
    warn: logToTransport,
    error: logToTransport,
    fatal: logToTransport,
  },
  "debug"
);
