/**
 * Structured logging utility for SoloSuccess AI
 * Provides consistent logging across the application with proper formatting
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  agentId?: string;
  feature?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class Logger {
  private serviceName: string;
  private environment: string;

  constructor() {
    this.serviceName = 'solosuccess-ai';
    this.environment = process.env.NODE_ENV || 'development';
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        service: this.serviceName,
        environment: this.environment,
      },
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private write(entry: LogEntry): void {
    const output = JSON.stringify(entry);

    // In production, logs go to stdout for CloudWatch
    // In development, pretty print for readability
    if (this.environment === 'production') {
      console.log(output);
    } else {
      const color = this.getColorForLevel(entry.level);
      console.log(
        `${color}[${entry.level.toUpperCase()}]${this.resetColor()} ${entry.timestamp} - ${entry.message}`,
        entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : '',
        entry.error ? `\nError: ${JSON.stringify(entry.error, null, 2)}` : '',
        entry.metadata ? `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}` : ''
      );
    }
  }

  private getColorForLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    return colors[level] || '';
  }

  private resetColor(): string {
    return '\x1b[0m';
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.formatLog(LogLevel.DEBUG, message, context, undefined, metadata);
    this.write(entry);
  }

  info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.formatLog(LogLevel.INFO, message, context, undefined, metadata);
    this.write(entry);
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.formatLog(LogLevel.WARN, message, context, undefined, metadata);
    this.write(entry);
  }

  error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, any>): void {
    const entry = this.formatLog(LogLevel.ERROR, message, context, error, metadata);
    this.write(entry);
  }

  // Convenience methods for common logging scenarios
  logRequest(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, context, { type: 'http_request' });
  }

  logResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`${method} ${path} - ${statusCode}`, context, {
      type: 'http_response',
      statusCode,
      duration,
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: LogContext): void {
    this.debug('Database query executed', context, {
      type: 'database_query',
      query: query.substring(0, 200), // Truncate long queries
      duration,
    });
  }

  logAIRequest(agentId: string, prompt: string, context?: LogContext): void {
    this.info('AI request initiated', { ...context, agentId }, {
      type: 'ai_request',
      promptLength: prompt.length,
    });
  }

  logAIResponse(agentId: string, responseLength: number, duration: number, context?: LogContext): void {
    this.info('AI response received', { ...context, agentId }, {
      type: 'ai_response',
      responseLength,
      duration,
    });
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = severity === 'critical' || severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    const entry = this.formatLog(level, `Security event: ${event}`, context, undefined, {
      type: 'security_event',
      severity,
    });
    this.write(entry);
  }

  logPerformanceMetric(metric: string, value: number, unit: string, context?: LogContext): void {
    this.info(`Performance metric: ${metric}`, context, {
      type: 'performance_metric',
      metric,
      value,
      unit,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export helper function for creating child loggers with context
export function createLogger(defaultContext: LogContext): Logger {
  const childLogger = new Logger();
  const originalMethods = {
    debug: childLogger.debug.bind(childLogger),
    info: childLogger.info.bind(childLogger),
    warn: childLogger.warn.bind(childLogger),
    error: childLogger.error.bind(childLogger),
  };

  childLogger.debug = (message, context, metadata) =>
    originalMethods.debug(message, { ...defaultContext, ...context }, metadata);
  childLogger.info = (message, context, metadata) =>
    originalMethods.info(message, { ...defaultContext, ...context }, metadata);
  childLogger.warn = (message, context, metadata) =>
    originalMethods.warn(message, { ...defaultContext, ...context }, metadata);
  childLogger.error = (message, error, context, metadata) =>
    originalMethods.error(message, error, { ...defaultContext, ...context }, metadata);

  return childLogger;
}
