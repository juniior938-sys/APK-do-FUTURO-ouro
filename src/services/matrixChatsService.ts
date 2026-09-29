// Backward compatibility alias: re-exports GrokApiService as MatrixChatsService
import { grokApiService, GrokApiService, GrokApiStatus } from './grokApiService';

export type MatrixChatsStatus = GrokApiStatus;
export const MatrixChatsService = GrokApiService;
export const matrixChatsService = grokApiService;
