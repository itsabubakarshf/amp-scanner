const winston = require('winston');
require('winston-daily-rotate-file');

const fs = require('fs');
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const customLogFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} : ${level.toUpperCase()} : ${message}`;
});
const fileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/AMP-Scanner-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '7d',
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        customLogFormat 
    )
});

const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} : ${level} :  ${message}`;
        })
    ),
    level: 'info'
});




const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        fileTransport,
        consoleTransport 
    ],
});


module.exports = logger;