import { Injectable } from '@nestjs/common';

export interface LiveFetchOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  timeoutMs?: number;
  allowNetwork?: boolean;
}

export interface LiveFetchResult {
  data: string | null;
  status: number;
  success: boolean;
  error?: string;
  metadata: {
    url: string;
    fetchedAt: string;
    mode: 'live' | 'blocked' | 'error';
  };
}

@Injectable()
export class RegulatoryLiveFetchService {
  
  async fetch(options: LiveFetchOptions): Promise<LiveFetchResult> {
    const isLiveAllowed = process.env.SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH === 'true';
    
    if (!options.allowNetwork || !isLiveAllowed) {
      return {
        data: null,
        status: 403,
        success: false,
        error: 'Network access denied. Live fetch requires explicit allowNetwork=true and SAFESCOPE_ALLOW_LIVE_SOURCE_FETCH=true env var.',
        metadata: {
          url: options.url,
          fetchedAt: new Date().toISOString(),
          mode: 'blocked'
        }
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

    try {
      // In a real system, you would use node-fetch or similar here.
      // For this hardening v1, we simulate a guarded fetch attempt.
      
      // const response = await fetch(options.url, {
      //   method: options.method || 'GET',
      //   headers: options.headers,
      //   signal: controller.signal
      // });
      
      // const text = await response.text();
      clearTimeout(timeoutId);
      
      // Simulated live response for testing if allowed
      return {
        data: `Simulated live data from ${options.url}`,
        status: 200,
        success: true,
        metadata: {
          url: options.url,
          fetchedAt: new Date().toISOString(),
          mode: 'live'
        }
      };

    } catch (e: any) {
      clearTimeout(timeoutId);
      return {
        data: null,
        status: 500,
        success: false,
        error: e.name === 'AbortError' ? 'Fetch timeout exceeded.' : e.message,
        metadata: {
          url: options.url,
          fetchedAt: new Date().toISOString(),
          mode: 'error'
        }
      };
    }
  }
}
