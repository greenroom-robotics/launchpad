import axios from 'axios';
import type { AxiosInstance } from 'axios';
import https from 'https';

interface AxiosError {
  response?: {
    status: number;
  };
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error && typeof error === 'object' && 'response' in error) as boolean;
}

export class SecureHttpClient {
  private instance: AxiosInstance;

  constructor() {
    // Create HTTPS agent that bypasses SSL certificate validation
    // This is necessary for offline environments with self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Bypass SSL validation
      requestCert: false,
    });

    this.instance = axios.create({
      httpsAgent,
      validateStatus: () => true, // Don't throw on any status code
      timeout: 10000, // 10 second default timeout
    });
  }

  /**
   * Check if a URL requires authentication by sending a request without credentials.
   * Does not follow redirects, since a redirect may indicate an auth gateway.
   * @param url - The URL to check
   * @returns Object indicating if auth is required and the HTTP status code
   */
  async checkAuthRequired(
    url: string
  ): Promise<{ authRequired: boolean; status: number; realm?: string }> {
    try {
      const response = await this.instance.get(url, {
        timeout: 5000,
        maxRedirects: 0, // Don't follow redirects — a redirect may indicate an auth gate
      });

      const status = response.status;
      const authRequired = status === 401 || status === 407;
      const wwwAuth = response.headers?.['www-authenticate'] || '';
      const realmMatch = wwwAuth.match(/realm="?([^"]*)"?/i);

      return { authRequired, status, realm: realmMatch?.[1] };
    } catch (error: unknown) {
      // Axios throws on redirects when maxRedirects is 0
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 401 || status === 407) {
          return { authRequired: true, status };
        }
        // 3xx redirects may indicate an auth gateway
        if (status >= 300 && status < 400) {
          return { authRequired: true, status };
        }
        return { authRequired: false, status };
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SecureHttpClient] Auth check failed for ${url}:`, errorMessage);
      // Network error — can't determine, assume no auth so the window can attempt to load
      return { authRequired: false, status: 0 };
    }
  }

  /**
   * Test Basic Authentication credentials against a server
   * @param url - The URL to test against
   * @param username - Username for Basic Auth
   * @param password - Password for Basic Auth
   * @returns Object with success status and HTTP status code
   */
  async testBasicAuth(
    url: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; status: number }> {
    try {
      const response = await this.instance.get(url, {
        auth: { username, password },
        timeout: 5000, // 5 second timeout for auth testing
      });

      return {
        success: response.status >= 200 && response.status < 400,
        status: response.status,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SecureHttpClient] Auth test failed for ${url}:`, errorMessage);
      // If request fails completely, return error status
      return {
        success: false,
        status: isAxiosError(error) ? error.response?.status || 0 : 0,
      };
    }
  }

  /**
   * Check connectivity to a given URL
   * @param url - The URL to check
   * @returns Object with connection status and optional error message
   */
  async checkConnectivity(
    url: string
  ): Promise<{ connected: boolean; status?: number; error?: string }> {
    try {
      const response = await this.instance.head(url, { timeout: 5000 });

      return {
        connected: true,
        status: response.status,
      };
    } catch (error: unknown) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
