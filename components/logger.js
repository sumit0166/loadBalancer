const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const config = require('../config/config.json');
const logConfig = config.logs;
// Define the logger configuration

const logger = winston.createLogger({
  level: logConfig.mode, // Set the default logging level to info
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), // Include timestamp in logs
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`),
    // winston.format.simple() // Use the simple format for logs
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new DailyRotateFile({
        filename: logConfig.path,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: logConfig.size, // Rotate when file size exceeds 20 MB
        maxFiles: logConfig.retantionPeriod, // Retain logs for 14 days
        new: false,
      }),
  ],
});




module.exports = logger;
