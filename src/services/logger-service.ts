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
  fs.appendFileSync(defaultLogFilename, JSON.stringify(logObject) + "\n");
}

export function rotateLog() {
  logger.info("Rotating log");
  const date = new Date();
  const dateString = [
    date.getDay().toString().padStart(2, "0"),
    date.getMonth().toString().padStart(2, "0"),
    date.getFullYear(),
  ].join("-");
  if (!fs.existsSync(defaultLogFilename + "." + dateString)) {
    fs.renameSync(defaultLogFilename, defaultLogFilename + "." + dateString);
  } else logger.error(defaultLogFilename + "." + dateString + " exists");
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
