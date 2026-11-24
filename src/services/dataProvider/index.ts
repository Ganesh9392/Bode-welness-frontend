import { DATA_CONFIG } from '../../config/dataConfig';
import { IDataProvider } from './types';
import { MockDataProvider } from './mockProvider';
import { ApiDataProvider } from './apiProvider';

export type { IDataProvider, LoginResponse } from './types';
export { MockDataProvider } from './mockProvider';
export { ApiDataProvider } from './apiProvider';

export const dataProvider: IDataProvider =
  DATA_CONFIG.source === 'api' ? new ApiDataProvider() : new MockDataProvider();
