import logger from '../logger/index.js';

const print = (type, message) => {
    if (type === 'error') {
        logger.error(`${typeof message === 'string' ? message : ''}`, typeof message !== 'string' ? message : '');
        return;
    }

    if (type === 'warn') {
        logger.warn(`${typeof message === 'string' ? message : ''}`, typeof message !== 'string' ? message : '');
        return;
    }

    if (type === 'fatal') {
        logger.fatal(`${typeof message === 'string' ? message : ''}`, typeof message !== 'string' ? message : '');
        return;
    }

    logger.info(`${typeof message === 'string' ? message : ''}`, typeof message !== 'string' ? message : '');
};

export default print;
