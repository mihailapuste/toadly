import type { INetworkMonitoringService, NetworkRequest } from './interfaces';
import { LoggingService } from './index';

/**
 * NetworkMonitoringService captures all network requests made from the app
 * It works by intercepting fetch and XMLHttpRequest calls
 */
class NetworkMonitoringService implements INetworkMonitoringService {
  private static instance: NetworkMonitoringService;
  private isMonitoringActive: boolean = false;
  private requests: NetworkRequest[] = [];
  private originalFetch: typeof fetch;
  private originalXHROpen: any;
  private originalXHRSend: any;
  private maxRequests: number = 50; // Store the last 50 requests by default

  private constructor() {
    // Store original implementations
    this.originalFetch = global.fetch;
    if (typeof XMLHttpRequest !== 'undefined') {
      this.originalXHROpen = XMLHttpRequest.prototype.open;
      this.originalXHRSend = XMLHttpRequest.prototype.send;
    }
  }

  /**
   * Get the singleton instance of NetworkMonitoringService
   */
  public static getInstance(): NetworkMonitoringService {
    if (!NetworkMonitoringService.instance) {
      NetworkMonitoringService.instance = new NetworkMonitoringService();
    }
    return NetworkMonitoringService.instance;
  }

  /**
   * Start monitoring network requests
   */
  public startMonitoring(): void {
    if (this.isMonitoringActive) {
      return; // Already monitoring
    }

    this.isMonitoringActive = true;
    LoggingService.addLog('Network monitoring started');

    // Intercept fetch API
    this.interceptFetch();

    // Intercept XMLHttpRequest if available
    if (typeof XMLHttpRequest !== 'undefined') {
      this.interceptXMLHttpRequest();
    }
  }

  /**
   * Stop monitoring network requests
   */
  public stopMonitoring(): void {
    if (!this.isMonitoringActive) {
      return; // Not monitoring
    }

    // Restore original implementations
    global.fetch = this.originalFetch;
    
    if (typeof XMLHttpRequest !== 'undefined') {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
      XMLHttpRequest.prototype.send = this.originalXHRSend;
    }

    this.isMonitoringActive = false;
    LoggingService.addLog('Network monitoring stopped');
  }

  /**
   * Check if network monitoring is active
   */
  public isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  /**
   * Get recent network requests
   * @param count Number of recent requests to return (default: all)
   */
  public getRecentRequests(count?: number): NetworkRequest[] {
    if (!count || count >= this.requests.length) {
      return [...this.requests];
    }
    return this.requests.slice(this.requests.length - count);
  }

  /**
   * Clear stored network requests
   */
  public clearRequests(): void {
    this.requests = [];
    LoggingService.addLog('Network request history cleared');
  }

  /**
   * Set the maximum number of requests to store
   * @param max Maximum number of requests to keep in history
   */
  public setMaxRequests(max: number): void {
    this.maxRequests = max;
    // Trim if needed
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(this.requests.length - this.maxRequests);
    }
  }

  /**
   * Add a request to the history
   */
  private addRequest(request: NetworkRequest): void {
    this.requests.push(request);
    
    // Trim if we exceed the max
    if (this.requests.length > this.maxRequests) {
      this.requests.shift();
    }
    
    // Log basic request info
    LoggingService.addLog(`Network request: ${request.method} ${request.url}`);
  }

  /**
   * Intercept fetch API calls
   */
  private interceptFetch(): void {
    const self = this;
    
    // Replace global fetch with our interceptor
    global.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const requestId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      const startTime = Date.now();
      
      // Extract request details
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET');
      const headers = init?.headers ? 
        (init.headers instanceof Headers ? 
          Object.fromEntries(Array.from(init.headers.entries())) : 
          (typeof init.headers === 'object' ? init.headers as Record<string, string> : {})) 
        : {};
      
      // Try to get body content
      let bodyContent = '';
      try {
        if (init?.body) {
          if (typeof init.body === 'string') {
            bodyContent = init.body;
          } else if (init.body instanceof FormData || init.body instanceof URLSearchParams) {
            bodyContent = '[FormData or URLSearchParams]';
          } else if (init.body instanceof Blob || init.body instanceof ArrayBuffer) {
            bodyContent = '[Binary data]';
          } else {
            bodyContent = JSON.stringify(init.body);
          }
        }
      } catch (e) {
        bodyContent = '[Error serializing request body]';
      }
      
      // Create initial request object
      const request: NetworkRequest = {
        id: requestId,
        url,
        method: method || 'GET',
        headers,
        body: bodyContent,
        startTime
      };
      
      // Add to history
      self.addRequest(request);
      
      // Call original fetch
      return self.originalFetch.call(global, input, init)
        .then((response) => {
          // Clone the response so we can read its body
          const clonedResponse = response.clone();
          
          // Update request with response info
          request.endTime = Date.now();
          request.duration = request.endTime - request.startTime;
          request.status = response.status;
          
          // Try to get response body
          clonedResponse.text().then(text => {
            try {
              request.response = text;
              LoggingService.addLog(`Network response: ${request.status} for ${request.method} ${request.url}`);
            } catch (e) {
              request.response = '[Error reading response body]';
            }
          }).catch(() => {
            request.response = '[Error reading response body]';
          });
          
          return response;
        })
        .catch(error => {
          // Update request with error info
          request.endTime = Date.now();
          request.duration = request.endTime - request.startTime;
          request.error = error.message || 'Network request failed';
          LoggingService.addLog(`Network error: ${request.error} for ${request.method} ${request.url}`);
          
          // Re-throw the error
          throw error;
        });
    };
  }

  /**
   * Intercept XMLHttpRequest calls
   */
  private interceptXMLHttpRequest(): void {
    const self = this;
    
    // Replace XMLHttpRequest.open
    XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
      const xhr = this as XMLHttpRequest;
      
      // Store request info on the XHR instance
      (xhr as any).__toadlyRequest = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        method,
        url,
        headers: {},
        startTime: 0, // Will be set in send
      };
      
      // Call original open
      return self.originalXHROpen.apply(xhr, [method, url, ...args]);
    };
    
    // Replace XMLHttpRequest.send
    XMLHttpRequest.prototype.send = function(body?: Document | string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null) {
      const xhr = this as XMLHttpRequest;
      const toadlyRequest = (xhr as any).__toadlyRequest as NetworkRequest;
      
      if (!toadlyRequest) {
        return self.originalXHRSend.call(xhr, body);
      }
      
      // Set start time
      toadlyRequest.startTime = Date.now();
      
      // Try to get body content
      try {
        if (body) {
          if (typeof body === 'string') {
            toadlyRequest.body = body;
          } else if (body instanceof FormData || body instanceof URLSearchParams) {
            toadlyRequest.body = '[FormData or URLSearchParams]';
          } else if (body instanceof Blob || body instanceof ArrayBuffer) {
            toadlyRequest.body = '[Binary data]';
          } else {
            toadlyRequest.body = '[Complex body]';
          }
        }
      } catch (e) {
        toadlyRequest.body = '[Error serializing request body]';
      }
      
      // Add to history
      self.addRequest(toadlyRequest);
      
      // Add response handlers
      xhr.addEventListener('load', function() {
        toadlyRequest.endTime = Date.now();
        toadlyRequest.duration = toadlyRequest.endTime - toadlyRequest.startTime;
        toadlyRequest.status = xhr.status;
        
        try {
          toadlyRequest.response = xhr.responseText || xhr.response;
        } catch (e) {
          toadlyRequest.response = '[Error reading response body]';
        }
        
        LoggingService.addLog(`XHR response: ${toadlyRequest.status} for ${toadlyRequest.method} ${toadlyRequest.url}`);
      });
      
      xhr.addEventListener('error', function() {
        toadlyRequest.endTime = Date.now();
        toadlyRequest.duration = toadlyRequest.endTime - toadlyRequest.startTime;
        toadlyRequest.error = 'Network request failed';
        LoggingService.addLog(`XHR error for ${toadlyRequest.method} ${toadlyRequest.url}`);
      });
      
      xhr.addEventListener('abort', function() {
        toadlyRequest.endTime = Date.now();
        toadlyRequest.duration = toadlyRequest.endTime - toadlyRequest.startTime;
        toadlyRequest.error = 'Request aborted';
        LoggingService.addLog(`XHR aborted for ${toadlyRequest.method} ${toadlyRequest.url}`);
      });
      
      xhr.addEventListener('timeout', function() {
        toadlyRequest.endTime = Date.now();
        toadlyRequest.duration = toadlyRequest.endTime - toadlyRequest.startTime;
        toadlyRequest.error = 'Request timeout';
        LoggingService.addLog(`XHR timeout for ${toadlyRequest.method} ${toadlyRequest.url}`);
      });
      
      // Capture request headers
      const originalSetRequestHeader = xhr.setRequestHeader;
      xhr.setRequestHeader = function(name: string, value: string) {
        if (toadlyRequest.headers) {
          toadlyRequest.headers[name] = value;
        }
        return originalSetRequestHeader.call(xhr, name, value);
      };
      
      // Call original send
      return self.originalXHRSend.call(xhr, body);
    };
  }
}

export default NetworkMonitoringService;
