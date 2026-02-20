import BaseError from './BaseError.js';
import logger from '../../logger/index.js';

class ErrorHandler {
    handleError(err) {
        logger.error(
            `Error: ${err.message}`,
            err,
        );
    }

    handleUncaughtException(error) {
        logger.error(
            `Uncaught Exception: ${error}`,
            error,
        );
    }

    isTrustedError(error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }
}

const errorHandler = new ErrorHandler();

export default errorHandler;
