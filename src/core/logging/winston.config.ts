import * as winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple, printf } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, context, correlationId, stack, ...meta }) => {
    let line = `[${ts}] ${level} [${context || 'App'}]`;
    if (correlationId) line += ` (${correlationId})`;
    line += `: ${message}`;
    if (stack) line += `\n${stack}`;
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return line + extra;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export function createWinstonConfig(nodeEnv: string): winston.LoggerOptions {
  const isProd = nodeEnv === 'production';

  return {
    level: isProd ? 'info' : 'debug',
    format: isProd ? prodFormat : devFormat,
    transports: [new winston.transports.Console()],
    exitOnError: false,
  };
}
