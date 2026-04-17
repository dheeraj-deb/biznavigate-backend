/**
 * Standard Response Interface
 */
export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

/**
 * Pagination Metadata Interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * JWT Payload Interface
 */
export interface JwtPayload {
  user_id: string;
  tenant_id: string;
  business_id: string;
  role_id: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}
