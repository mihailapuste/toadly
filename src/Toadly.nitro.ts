import type { HybridObject } from 'react-native-nitro-modules';

export interface Toadly
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Setup GitHub integration
   * @param githubToken GitHub access token
   * @param repoOwner Repository owner (username or organization)
   * @param repoName Repository name
   */
  setup(githubToken: string, repoOwner: string, repoName: string): void;

  /**
   * Add JavaScript logs to be included in bug reports
   * @param logs Recent JavaScript logs as a string
   */
  addJSLogs(logs: string): void;

  /**
   * Show bug report dialog
   */
  show(): void;
  
  /**
   * Create and submit a GitHub issue with a custom title
   * @param title The title for the GitHub issue
   */
  createIssueWithTitle(title: string): void;
}
