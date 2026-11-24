export type DataSourceMode = 'mock' | 'api';

export const DATA_CONFIG = {
  source: ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_DATA_SOURCE as DataSourceMode) || 'mock',
  apiBaseUrl: (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '',
};
