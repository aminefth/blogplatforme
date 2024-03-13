import { createLogger, transports, format } from 'winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { environment, logDirectory } from '../config';

// set the default log dir if not provided
let dir = logDirectory;
if (!dir) dir = path.resolve('logs');

// create directory if it does not exist
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const logLevel = environment === 'development' ? 'debug' : 'warn';

// Set up the configuration for the daily rotate file transport

/**
 * Represents a daily rotating file for logging.
 */
const dailyRotateFile = new DailyRotateFile({
  level: logLevel,
  filename: `${dir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  handleExceptions: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
  ),
});

// Create a logger with console and file transports
export default createLogger({
  transports: [
    // Console transport
    new transports.Console({
      level: logLevel,
      format: format.combine(
        format.errors({ stack: true }),
        format.prettyPrint(),
      ),
    }),
    // File transport
    dailyRotateFile,
  ],
  // Set the file transport as the exception handler
  exceptionHandlers: [dailyRotateFile],
  exitOnError: false, // do not exit on handled exceptions
});
