/**
 * Protected Data Service - Client-Side Gateway
 * 
 * This service MUST be used for all access to protected collections.
 * It routes all requests through the backend gateway for security validation.
 * 
 * CRITICAL: Do NOT use BaseCrudService directly for protected collections.
 * Always use this service instead.
 * 
 * PROTECTED COLLECTIONS:
 * - clientassignedworkouts
 * - programassignments
 * - trainerclientassignments
 * - trainerclientmessages
 * - trainerclientnotes
 * - weeklycheckins
 * - weeklycoachesnotes
 * - weeklysummaries
 * - trainernotifications
 * - trainernotificationpreferences
 * - clientprofiles
 * - clientprograms
 * - programdrafts
 * - programs
 */

const PROTECTED_COLLECTIONS = [
  'clientassignedworkouts',
  'programassignments',
  'trainerclientassignments',
  'trainerclientmessages',
  'trainerclientnotes',
  'weeklycheckins',
  'weeklycoachesnotes',
  'weeklysummaries',
  'trainernotifications',
  'trainernotificationpreferences',
  'clientprofiles',
  'clientprograms',
  'programdrafts',
  'programs',
] as const;

type ProtectedCollection = typeof PROTECTED_COLLECTIONS[number];

interface ProtectedDataRequest {
  operation: 'getAll' | 'getById' | 'getForClient' | 'getForTrainer' | 'create' | 'update' | 'delete';
  collection: ProtectedCollection;
  itemId?: string;
  clientId?: string;
  trainerId?: string;
  data?: Record<string, any>;
  options?: {
    limit?: number;
    skip?: number;
    singleRef?: string[];
    multiRef?: string[];
  };
}

interface ProtectedDataResponse<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: string;
  timestamp: string;
}

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
  pageSize: number;
  nextSkip: number | null;
}

/**
 * Protected Data Service
 * 
 * All methods route through the backend gateway for security validation.
 * This ensures role-based access control, ownership validation, and audit logging.
 */
export class ProtectedDataService {
  private static readonly GATEWAY_URL = '/_functions/protected-data-gateway';

  /**
   * Check if a collection is protected
   */
  static isProtected(collection: string): boolean {
    return PROTECTED_COLLECTIONS.includes(collection as ProtectedCollection);
  }

  /**
   * Get all items with role-based filtering
   */
  static async getAll<T>(
    collection: ProtectedCollection,
    options?: { limit?: number; skip?: number; singleRef?: string[]; multiRef?: string[] }
  ): Promise<PaginatedResult<T>> {
    return this.request<PaginatedResult<T>>({
      operation: 'getAll',
      collection,
      options,
    });
  }

  /**
   * Get single item by ID with access validation
   */
  static async getById<T>(
    collection: ProtectedCollection,
    itemId: string,
    options?: { singleRef?: string[]; multiRef?: string[] }
  ): Promise<T | null> {
    const result = await this.request<T | null>({
      operation: 'getById',
      collection,
      itemId,
      options,
    });
    return result;
  }

  /**
   * Get all items for a specific client (trainer/admin only)
   */
  static async getForClient<T>(
    collection: ProtectedCollection,
    clientId: string,
    options?: { limit?: number; skip?: number }
  ): Promise<PaginatedResult<T>> {
    return this.request<PaginatedResult<T>>({
      operation: 'getForClient',
      collection,
      clientId,
      options,
    });
  }

  /**
   * Get all items for a specific trainer (admin only)
   */
  static async getForTrainer<T>(
    collection: ProtectedCollection,
    trainerId: string,
    options?: { limit?: number; skip?: number }
  ): Promise<PaginatedResult<T>> {
    return this.request<PaginatedResult<T>>({
      operation: 'getForTrainer',
      collection,
      trainerId,
      options,
    });
  }

  /**
   * Create new item with ownership validation
   */
  static async create<T>(
    collection: ProtectedCollection,
    data: Record<string, any>
  ): Promise<T> {
    return this.request<T>({
      operation: 'create',
      collection,
      data,
    });
  }

  /**
   * Update existing item with ownership validation
   */
  static async update<T>(
    collection: ProtectedCollection,
    itemId: string,
    data: Record<string, any>
  ): Promise<T> {
    return this.request<T>({
      operation: 'update',
      collection,
      itemId,
      data,
    });
  }

  /**
   * Delete item with ownership validation (admin only)
   */
  static async delete(
    collection: ProtectedCollection,
    itemId: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      operation: 'delete',
      collection,
      itemId,
    });
  }

  /**
   * Internal method to send request to backend gateway
   */
  private static async request<T>(req: ProtectedDataRequest): Promise<T> {
    try {
      const response = await fetch(this.GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      });

      const data: ProtectedDataResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error('Protected data service error:', error);
      throw error;
    }
  }

  /**
   * Get list of all protected collections
   */
  static getProtectedCollections(): readonly string[] {
    return PROTECTED_COLLECTIONS;
  }
}

export default ProtectedDataService;
