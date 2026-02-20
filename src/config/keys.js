import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default {
    PORT: process.env.PORT,
    DATABASE: {
        URL: process.env.MONGODB_URL,
    },
    REDIS_CLOUD: {
        HOST: process.env.REDIS_CLOUD_HOST,
        PORT: Number(process.env.REDIS_CLOUD_PORT),
        PASSWORD: process.env.REDIS_CLOUD_PASSWORD,
        USERNAME: process.env.REDIS_CLOUD_USERNAME,
        URL: `redis://${process.env.REDIS_CLOUD_USERNAME}:${process.env.REDIS_CLOUD_PASSWORD}@${process.env.REDIS_CLOUD_HOST}:${process.env.REDIS_CLOUD_PORT}`,
    },
    JWT: {
        SECRET: process.env.JWT_SECRET,
        TOKEN_EXPIRY: '7d',
        VERIFY_EMAIL_TOKEN_EXPIRY: '15m',
    },
};
