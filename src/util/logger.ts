import winston from 'winston';
import moment from 'moment';

const level = process.env.DEBUG != null ? 'debug' : 'info';

const timestampFormat = () => moment().format();
const colorizer = winston.format.colorize();
const logger = winston.createLogger({
    format: winston.format((info) => {
        if ((info.message as any) instanceof Error) {
            const error = info.message as unknown as Error;
            info.message = Object.assign({
                message: `${error.message}\n${error.stack}`,
            }, info.message);
        }

        if (typeof info.message === 'object') {
            info.message = JSON.stringify(info.message, null, 2);
        }

        if (info instanceof Error) {
            return Object.assign({
                message: `${info.message}\n${info.stack}`,
            }, info);
        }
        
        return info;
    })(),
    transports: [
        new winston.transports.Console({
            level,
            format: winston.format.combine(
                winston.format.timestamp({format: timestampFormat}),
                winston.format.printf((msg) => {
                    const {timestamp, level, message} = msg;
                    const prefix = colorizer.colorize(level, `Mareel:core:${level.toUpperCase()}`);
                    return `${prefix} ${timestamp}: ${message}`;
                }),
            ),
        }),
    ],
});

export { logger };