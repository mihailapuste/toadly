/**
 * Interface for ErrorHandlingService
 * This helps avoid circular dependencies between services
 */
export interface IErrorHandlingService {
  captureJSCrash(error: Error, isFatal?: boolean): void;
  submitErrorAsGitHubIssue(error: Error, isFatal?: boolean): void;
  enableAutomaticCrashReporting(enable?: boolean): void;
  enableAutomaticIssueSubmission(enable?: boolean): void;
  isAutomaticIssueSubmissionEnabled(): boolean;
}

/**
 * Interface for LoggingService
 * This helps avoid circular dependencies between services
 */
export interface ILoggingService {
  getRecentLogs(): string;
  addLog(message: string): void;
  clearLogs(): void;
  logError(error: Error, fatal?: boolean): void;
}

/**
 * Interface for NetworkMonitoringService
 * Provides network request monitoring capabilities
 */
export interface INetworkMonitoringService {
  startMonitoring(): void;
  stopMonitoring(): void;
  isMonitoring(): boolean;
  getRecentRequests(count?: number): NetworkRequest[];
  clearRequests(): void;
}

/**
 * Network request information
 */
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  startTime: number;
  endTime?: number;
  status?: number;
  response?: string;
  error?: string;
  duration?: number;
}
