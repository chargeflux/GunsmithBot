import { IErrorObject, ILogObject, Logger } from "tslog";
import fs from "fs";

export const logger: Logger = new Logger({
  name: "Main",
  printLogMessageInNewLine: true
});
const defaultLogFilename = "logs/GunsmithBot.log";

function logToTransport(logObject: ILogObject) {
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
  let message = `${logObject.date.toISOString()} ${logObject.logLevel.toUpperCase()} ` + 
  `[${logObject.loggerName} ${logObject.filePath}:${logObject.lineNumber}${logObject.functionName !== undefined ? " " + logObject.functionName : ""}]\n`;
  for (const argument of logObject.argumentsArray) {
    if (Object.prototype.hasOwnProperty.call(argument, "isError")) {
      const argumentParsed: IErrorObject = argument as unknown as IErrorObject
      message += "\nL" + argumentParsed?.codeFrame?.lineNumber + " " + argumentParsed.codeFrame?.relevantLine.trimStart()
    }
    else {
      message += argument;
    }
  }
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
