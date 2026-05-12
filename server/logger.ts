type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  correlationId?: string;
  userId?: number;
  organizationId?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const currentLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
const isProduction = process.env.NODE_ENV === "production";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function formatLog(entry: LogEntry): string {
  if (isProduction) {
    return JSON.stringify(entry);
  }
  const { timestamp, level, service, message, ...rest } = entry;
  const time = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const meta = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `${time} [${level.toUpperCase()}] [${service}] ${message}${meta}`;
}

function createLogEntry(
  level: LogLevel,
  service: string,
  message: string,
  metadata?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...metadata,
  };
}

export function debug(service: string, message: string, metadata?: Record<string, unknown>): void {
  if (!shouldLog("debug")) return;
  const entry = createLogEntry("debug", service, message, metadata);
  console.log(formatLog(entry));
}

export function info(service: string, message: string, metadata?: Record<string, unknown>): void {
  if (!shouldLog("info")) return;
  const entry = createLogEntry("info", service, message, metadata);
  console.log(formatLog(entry));
}

export function warn(service: string, message: string, metadata?: Record<string, unknown>): void {
  if (!shouldLog("warn")) return;
  const entry = createLogEntry("warn", service, message, metadata);
  console.warn(formatLog(entry));
}

export function error(service: string, message: string, err?: Error | unknown, metadata?: Record<string, unknown>): void {
  if (!shouldLog("error")) return;
  const errorDetails = err instanceof Error ? {
    error: {
      name: err.name,
      message: err.message,
      stack: isProduction ? undefined : err.stack,
    }
  } : err ? { error: { name: "Unknown", message: String(err) } } : {};
  
  const entry = createLogEntry("error", service, message, { ...errorDetails, ...metadata });
  console.error(formatLog(entry));
}

export function fatal(service: string, message: string, err?: Error | unknown, metadata?: Record<string, unknown>): void {
  const errorDetails = err instanceof Error ? {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  } : err ? { error: { name: "Unknown", message: String(err) } } : {};
  
  const entry = createLogEntry("fatal", service, message, { ...errorDetails, ...metadata });
  console.error(formatLog(entry));
}

export function request(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  if (!shouldLog(level)) return;
  
  const entry = createLogEntry(level, "http", `${method} ${path} ${statusCode}`, {
    duration,
    statusCode,
    ...metadata,
  });
  console.log(formatLog(entry));
}

export const logger = {
  debug,
  info,
  warn,
  error,
  fatal,
  request,
};

export default logger;
