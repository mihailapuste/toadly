import type { ConsoleOverrides } from './types';
import type { IErrorHandlingService, ILoggingService } from './interfaces';

/**
 * LoggingService manages log collection and console overrides
 */
class LoggingService implements ILoggingService {
  private static instance: LoggingService;
  private logs: string[] = [];
  private maxLogs: number = 50;
  private originalConsole: ConsoleOverrides = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  private isOverridden: boolean = false;

  private constructor() {
    this.setupConsoleOverrides();
  }

  /**
   * Get the singleton instance of LoggingService
   */
  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Set up console method overrides to capture logs
   */
  private setupConsoleOverrides() {
    // Only override once to prevent recursion
    if (this.isOverridden) {
      return;
    }

    this.isOverridden = true;

    console.log = (...args: any[]) => {
      this.captureLog('LOG', ...args);
      this.originalConsole.log(...args);
    };

    console.info = (...args: any[]) => {
      this.captureLog('INFO', ...args);
      this.originalConsole.info(...args);
    };

    console.warn = (...args: any[]) => {
      this.captureLog('WARN', ...args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      this.captureLog('ERROR', ...args);
      this.originalConsole.error(...args);
    };
  }

  /**
   * Capture a log entry with timestamp and level
   */
  private captureLog(level: string, ...args: any[]): void {
    try {
      const timestamp = new Date().toISOString();
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      const logEntry = `[${timestamp}] [${level}] ${message}`;
      
      this.logs.push(logEntry);

      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
    } catch (error) {
      // Use original console to avoid recursion
      this.originalConsole.error('Error in LoggingService:', error);
    }
  }

  /**
   * Get all recent logs as a string
   */
  public getRecentLogs(): string {
    return this.logs.join('\n');
  }

  /**
   * Add a custom log entry
   */
  public addLog(message: string): void {
    this.captureLog('TOADLY', message);
  }

  /**
   * Clear all stored logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Log an error with its stack trace
   */
  public logError(error: Error, fatal: boolean = false): void {
    // Dynamically import ErrorHandlingService to avoid circular dependency
    const errorHandlingService = require('./ErrorHandlingService').default as IErrorHandlingService;
    
    errorHandlingService.captureJSCrash(error, fatal);
    
    if (errorHandlingService.isAutomaticIssueSubmissionEnabled()) {
      errorHandlingService.submitErrorAsGitHubIssue(error, fatal);
    }
  }
}

export default LoggingService.getInstance();
