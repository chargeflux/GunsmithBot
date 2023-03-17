import { ILogObj, Logger } from "tslog";
import fs from "fs";
import { IErrorObject } from "tslog/dist/types/interfaces";

const LogLevel: Record<string, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  fatal: 6,
};

export const logger: Logger<ILogObj> = new Logger({
  minLevel: LogLevel[process.env.LOG_LEVEL ?? "info"],
  type: "pretty",
  argumentsArrayName: "argumentsArray",
});

logger.attachTransport((logObj) => {
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
  const meta = logObj._meta;
  const argumentsArray = logObj.argumentsArray as unknown as unknown[];
  let message =
    `${meta.date.toISOString()} ${meta.logLevelName.toUpperCase()} ` +
    `[${meta.name !== undefined ? meta.name + " " : ""}${meta.path?.fileNameWithLine} ${
      meta.path?.method !== undefined ? " " + meta.path?.method : ""
    }] `;
  for (const argument of argumentsArray) {
    if (Object.prototype.hasOwnProperty.call(argument, "nativeError")) {
      const argumentParsed: IErrorObject = argument as IErrorObject;
      message += argumentParsed.name.toUpperCase() + ": " + argumentParsed.message + "\n";
      for (const element of argumentParsed.stack) {
        message += `${element.fileName} ${element.method} [${element.filePathWithLine}]\n`;
      }
    } else {
      message += argument + "\n";
    }
  }
  fs.appendFileSync("logs/GunsmithBot.log", message);
});
