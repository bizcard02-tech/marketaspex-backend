import mongoose from 'mongoose';
import ENV from './keys.js';
import print from '../utils/print.js';
import logger from '../logger/index.js';

const DB = () => {
    try {
        mongoose.set('strictQuery', false);
        mongoose.connect(ENV.DATABASE.URL);

        mongoose.connection.on('connected', () => {
            logger.info('MongoDB Connected...');
        });
        mongoose.connection.on('error', (error) => {
            logger.error('Mongoose connection error:', error);
        });
        mongoose.connection.on('disconnected', () => {
            logger.warn('Mongodb disconnected...');
        });
        mongoose.connection.on('reconnected', () => {
            logger.warn('Mongodb reconnected successfully.');
        });
    } catch (error) {
        print('error', '${error.message}');
        process.exit(1);
    }
};

export default DB;
