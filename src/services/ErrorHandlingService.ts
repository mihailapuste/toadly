// Import necessary types
import type { IErrorHandlingService } from './interfaces';
import { NitroModules } from 'react-native-nitro-modules';
import type { Toadly } from '../Toadly.nitro';
import { LoggingService } from './index';

// Create direct access to the hybrid object
const ToadlyHybridObject = NitroModules.createHybridObject<Toadly>('Toadly');

/**
 * ErrorHandlingService manages JavaScript error handling and automatic issue submission
 */
class ErrorHandlingService implements IErrorHandlingService {
  private static instance: ErrorHandlingService;
  private isErrorHandlingSetup: boolean = false;
  private autoSubmitIssues: boolean = false;

  private constructor() {
    this.setupErrorHandling();
  }

  /**
   * Get the singleton instance of ErrorHandlingService
   */
  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Set up global error handlers for React Native
   */
  private setupErrorHandling() {
    // Only setup once to prevent duplicate handlers
    if (this.isErrorHandlingSetup || typeof global === 'undefined') {
      return;
    }

    this.isErrorHandlingSetup = true;

    // Handle uncaught JS exceptions in React Native
    // In React Native, ErrorUtils is available directly from require('react-native')
    try {
      // Dynamically require ErrorUtils from react-native to avoid TypeScript issues
      const RN = require('react-native');
      const ErrorUtils = RN.ErrorUtils;
      
      if (ErrorUtils) {
        // Get the default global error handler
        const defaultErrorHandler = ErrorUtils.getGlobalHandler();
        
        // Set our custom error handler
        ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
          this.captureJSCrash(error, isFatal);
          
          // If auto-submit is enabled and the error is fatal, create a GitHub issue
          if (this.autoSubmitIssues && isFatal) {
            this.submitErrorAsGitHubIssue(error, isFatal);
          }
          
          // Call the default handler afterwards
          defaultErrorHandler(error, isFatal);
        });
      }
    } catch (error) {
      console.warn('Error setting up React Native error handler:', error);
    }
  }

  /**
   * Capture JavaScript crash information
   */
  public captureJSCrash(error: Error, isFatal: boolean = false): void {
    try {
      const timestamp = new Date().toISOString();
      const errorType = isFatal ? 'FATAL CRASH' : 'NON-FATAL ERROR';
      
      // Format the error with stack trace if available
      const errorMessage = error.message || String(error);
      const stackTrace = error.stack || '';
      
      // Create detailed crash log
      const crashLog = [
        `[${timestamp}] [${errorType}] ${errorMessage}`,
        stackTrace ? `Stack trace:\n${stackTrace}` : '',
        `Component info: ${this.getComponentInfo()}`
      ].filter(Boolean).join('\n');
      
      // Add to logs via LoggingService
      LoggingService.addLog(crashLog);
    } catch (captureError) {
      console.error('Error capturing JS crash:', captureError);
    }
  }

  /**
   * Submit error as GitHub issue
   */
  public submitErrorAsGitHubIssue(error: Error, isFatal: boolean = false): void {
    try {
      // Create a descriptive title for the issue
      const errorType = isFatal ? 'Fatal Error' : 'Non-Fatal Error';
      const title = `[${errorType}] ${error.message.substring(0, 100)}`;
      
      // Use a slight delay to ensure logs are captured
      setTimeout(() => {
        // Get JavaScript logs and send them to native side before creating issue
        const jsLogs = LoggingService.getRecentLogs();
        ToadlyHybridObject.addJSLogs(jsLogs);
        
        // Create the issue with the title
        ToadlyHybridObject.createIssueWithTitle(title);
      }, 100);
    } catch (submitError) {
      console.error('Error submitting GitHub issue:', submitError);
    }
  }

  /**
   * Get component information for better context in error reports
   */
  private getComponentInfo(): string {
    // This is a placeholder - in a real app you might want to capture
    // current screen, component tree, or other relevant context
    return 'No component info available';
  }

  /**
   * Enable or disable automatic crash reporting
   */
  public enableAutomaticCrashReporting(enable: boolean = true): void {
    if (typeof global !== 'undefined') {
      (global as any).toadlyAutoReportCrashes = enable;
    }
  }

  /**
   * Enable or disable automatic issue submission
   */
  public enableAutomaticIssueSubmission(enable: boolean = true): void {
    this.autoSubmitIssues = enable;
  }

  /**
   * Check if automatic issue submission is enabled
   */
  public isAutomaticIssueSubmissionEnabled(): boolean {
    return this.autoSubmitIssues;
  }
}

export default ErrorHandlingService.getInstance();
