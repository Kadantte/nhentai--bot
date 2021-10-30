import pino from 'pino';

export const logger = pino({ prettyPrint: { hideObject: true } });