import BaseError from './BaseError.js';
import { HttpStatusCode } from '../../constants/index.js';

class ApiError extends BaseError {
    constructor(name, httpCode = HttpStatusCode.BAD_REQUEST, description = 'Internal server error', isOperational = true) {
        super(name, httpCode, description, isOperational);
    }
}

class HTTP404Error extends BaseError {
    constructor(description = 'not found') {
        super('API not found', HttpStatusCode.NOT_FOUND, description, true);
    }
}
class HTTP500Error extends BaseError {
    constructor(description = 'Internal Server Error') {
        super('Server Error', HttpStatusCode.INTERNAL_SERVER, description, true);
    }
}

export {
    ApiError,
    HTTP404Error,
    HTTP500Error,
};
