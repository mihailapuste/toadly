/**
 * Type declarations for React Native specific globals
 */

// Extend the global object with React Native specific properties
declare global {
  var ErrorUtils: {
    getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
    setGlobalHandler(callback: (error: Error, isFatal?: boolean) => void): void;
  };
  var toadlyAutoReportCrashes: boolean;
  
  namespace NodeJS {
    interface Global {
      ErrorUtils: {
        getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
        setGlobalHandler(callback: (error: Error, isFatal?: boolean) => void): void;
      };
      toadlyAutoReportCrashes: boolean;
    }
  }
}

export {};
