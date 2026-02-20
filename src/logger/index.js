import winston from 'winston';
import { customLevels } from '../constants/index.js';

const formatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        const checkIfMessageIsArrayOrObj = (typeof message === 'object' || Array.isArray(message));
        return `${timestamp} [${level}]: ${checkIfMessageIsArrayOrObj ? JSON.stringify(message) : message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ' '}`;
    }),
);

// const isDevEnvironment = () => process.env.NODE_ENV === 'local';
const isDevEnvironment = () => true;

class Logger {
    // private logger: winston.Logger;
    static logger;

    constructor() {
        const prodTransport = new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        });
        const transport = new winston.transports.Console({
            format: formatter,
        });

        this.logger = winston.createLogger({
            level: isDevEnvironment() ? 'trace' : 'error',
            levels: customLevels.levels,
            transports: [isDevEnvironment() ? transport : prodTransport],
            // transports: [transport],
        });
        winston.addColors(customLevels.colors);
    }

    trace(msg, meta) {
        this.logger.log('trace', msg, meta);
    }

    debug(msg, meta) {
        this.logger.debug(msg, meta);
    }

    info(msg, meta) {
        this.logger.info(msg, meta);
    }

    warn(msg, meta) {
        this.logger.warn(msg, meta);
    }

    error(msg, meta) {
        this.logger.error(msg, meta);
    }

    fatal(msg, meta) {
        this.logger.log('fatal', msg, meta);
    }
}

const logger = new Logger();

export default logger;
