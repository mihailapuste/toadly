// Add React Native specific type declarations
declare global {
  interface ErrorUtils {
    getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
    setGlobalHandler(callback: (error: Error, isFatal?: boolean) => void): void;
  }
}

// For React Native specific globals
declare const global: {
  ErrorUtils?: {
    getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
    setGlobalHandler(callback: (error: Error, isFatal?: boolean) => void): void;
  };
  toadlyAutoReportCrashes?: boolean;
  [key: string]: any;
};

class LoggingService {
  private static instance: LoggingService;
  private logs: string[] = [];
  private maxLogs: number = 50;
  private originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  private isOverridden: boolean = false;
  private isErrorHandlingSetup: boolean = false;
  private autoSubmitIssues: boolean = false;

  private constructor() {
    this.setupConsoleOverrides();
    this.setupErrorHandling();
  }

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

  private setupErrorHandling() {
    // Only setup once to prevent duplicate handlers
    if (this.isErrorHandlingSetup || typeof global === 'undefined') {
      return;
    }

    this.isErrorHandlingSetup = true;

    // Handle uncaught JS exceptions in React Native
    if (global.ErrorUtils) {
      // Get the default global error handler
      const defaultErrorHandler = global.ErrorUtils.getGlobalHandler();
      
      // Set our custom error handler
      global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        this.captureJSCrash(error, isFatal);
        
        // If auto-submit is enabled and the error is fatal, create a GitHub issue
        if (this.autoSubmitIssues && isFatal) {
          this.submitErrorAsGitHubIssue(error, isFatal);
        }
        
        // Call the default handler afterwards
        defaultErrorHandler(error, isFatal);
      });
    }
  }

  private captureJSCrash(error: Error, isFatal: boolean = false) {
    try {
      const errorType = isFatal ? 'FATAL CRASH' : 'CRASH';
      const timestamp = new Date().toISOString();
      
      // Format the error with stack trace if available
      const errorMessage = error.message || String(error);
      const stackTrace = error.stack || '';
      
      // Create detailed crash log
      const crashLog = [
        `[${timestamp}] [${errorType}] ${errorMessage}`,
        stackTrace ? `Stack trace:\n${stackTrace}` : '',
        `Component info: ${this.getComponentInfo()}`
      ].filter(Boolean).join('\n');
      
      // Add to logs
      this.logs.push(crashLog);
      
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
    } catch (captureError) {
      // Use original console to avoid recursion
      this.originalConsole.error('Error capturing JS crash:', captureError);
    }
  }

  private submitErrorAsGitHubIssue(error: Error, isFatal: boolean = false) {
    try {
      // Create a descriptive title for the issue
      const errorType = isFatal ? 'Fatal Error' : 'Non-Fatal Error';
      const title = `[${errorType}] ${error.message.substring(0, 100)}`;
      
      // Import dynamically to avoid circular dependencies
      const { _createIssueWithTitle } = require('./index');
      
      // Use a slight delay to ensure logs are captured
      setTimeout(() => {
        _createIssueWithTitle(title);
      }, 100);
    } catch (submitError) {
      // Use original console to avoid recursion
      this.originalConsole.error('Error submitting GitHub issue:', submitError);
    }
  }

  private getComponentInfo(): string {
    // This is a placeholder - in a real app you might want to capture
    // current screen, component tree, or other relevant context
    return 'No component info available';
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

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

  public getRecentLogs(): string {
    return this.logs.join('\n');
  }

  public addLog(message: string): void {
    this.captureLog('TOADLY', message);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public logError(error: Error, fatal: boolean = false): void {
    this.captureJSCrash(error, fatal);
    
    if (this.autoSubmitIssues) {
      this.submitErrorAsGitHubIssue(error, fatal);
    }
  }

  public enableAutomaticCrashReporting(enable: boolean = true): void {
    if (typeof global !== 'undefined') {
      global.toadlyAutoReportCrashes = enable;
    }
  }

  public enableAutomaticIssueSubmission(enable: boolean = true): void {
    this.autoSubmitIssues = enable;
  }
}

export default LoggingService.getInstance();
