import { NitroModules } from 'react-native-nitro-modules';
import type { Toadly } from './Toadly.nitro';
import { LoggingService, ErrorHandlingService, NetworkMonitoringService } from './services';

// Create the hybrid object for internal use
const ToadlyHybridObject = NitroModules.createHybridObject<Toadly>('Toadly');

/**
 * Internal function to create and submit a GitHub issue with a custom title
 * Not exposed in the public API - used internally by error handling
 * @param title The title for the GitHub issue
 */
export const _createIssueWithTitle = (title: string): void => {
  // Get JavaScript logs and send them to native side before creating issue
  const jsLogs = LoggingService.getRecentLogs();
  ToadlyHybridObject.addJSLogs(jsLogs);
  
  return ToadlyHybridObject.createIssueWithTitle(title);
};

/**
 * Setup the Toadly module with GitHub configuration
 * @param githubToken GitHub access token from environment variables
 * @param repoOwner Repository owner (username or organization)
 * @param repoName Repository name
 */
export function setup(
  githubToken: string,
  repoOwner: string,
  repoName: string
): void {
  LoggingService.addLog(`Setting up Toadly with GitHub integration`);
  return ToadlyHybridObject.setup(githubToken, repoOwner, repoName);
}

/**
 * Shows a bug reporting dialog
 */
export function show(): void {
  LoggingService.addLog('Showing bug report dialog');
  
  // Get JavaScript logs and send them to native side before showing dialog
  const jsLogs = LoggingService.getRecentLogs();
  ToadlyHybridObject.addJSLogs(jsLogs);
  
  return ToadlyHybridObject.show();
}

/**
 * Add a toadly log entry
 * @param message Log message to add
 */
export function log(message: string): void {
  LoggingService.addLog(message);
}

export function clearLogs(): void {
  LoggingService.clearLogs();
}

/**
 * Enable automatic crash reporting
 * When enabled, fatal JS crashes will automatically trigger the bug report dialog
 * @param enable Whether to enable automatic crash reporting (default: true)
 */
export function enableAutomaticCrashReporting(enable: boolean = true): void {
  ErrorHandlingService.enableAutomaticCrashReporting(enable);
}

/**
 * Enable automatic issue submission for JavaScript errors
 * @param enable Whether to enable automatic issue submission
 */
export function enableAutomaticIssueSubmission(enable: boolean = true): void {
  ErrorHandlingService.enableAutomaticIssueSubmission(enable);
}

/**
 * Manually log an error with its stack trace
 * This is useful for caught exceptions that you want to track
 * @param error The error object to log
 * @param fatal Whether this error is considered fatal
 */
export function logError(error: Error, fatal: boolean = false): void {
  LoggingService.logError(error, fatal);
}

/**
 * Start monitoring network requests
 * This will capture all fetch and XMLHttpRequest calls
 * Network requests will be included in bug reports
 */
export function startNetworkMonitoring(): void {
  NetworkMonitoringService.getInstance().startMonitoring();
  LoggingService.addLog('Network monitoring started');
}

/**
 * Stop monitoring network requests
 */
export function stopNetworkMonitoring(): void {
  NetworkMonitoringService.getInstance().stopMonitoring();
  LoggingService.addLog('Network monitoring stopped');
}

/**
 * Check if network monitoring is active
 */
export function isNetworkMonitoringActive(): boolean {
  return NetworkMonitoringService.getInstance().isMonitoring();
}

/**
 * Clear network request history
 */
export function clearNetworkHistory(): void {
  NetworkMonitoringService.getInstance().clearRequests();
}

// Export internal objects for use by ErrorHandlingService
export { ToadlyHybridObject };
