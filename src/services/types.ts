// Type declarations for React Native specific globals
declare global {
  // Add React Native specific properties to the global object
  interface Window {
    ErrorUtils?: {
      getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
      setGlobalHandler(callback: (error: Error, isFatal?: boolean) => void): void;
    };
    toadlyAutoReportCrashes?: boolean;
  }
}

// For React Native specific globals
// This is necessary because TypeScript doesn't recognize React Native's global object by default
declare const global: Window & typeof globalThis;

// Console override types
export interface ConsoleOverrides {
  log: typeof console.log;
  info: typeof console.info;
  warn: typeof console.warn;
  error: typeof console.error;
}
