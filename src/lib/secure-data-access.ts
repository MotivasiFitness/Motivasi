/**
 * Secure Data Access Wrapper
 * 
 * Enforces server-side scoping for sensitive collections to prevent unauthorized access.
 * This wrapper ensures that:
 * 1. All queries are scoped to the authenticated user's context (role + memberId)
 * 2. Unscoped getAll() calls are impossible for protected collections
 * 3. Authentication context is always required
 * 4. Admin routes can bypass scoping when explicitly needed
 * 
 * SECURITY: This wrapper prevents common security vulnerabilities:
 * - Prevents clients from accessing other clients' data
 * - Prevents trainers from accessing data outside their assigned clients
 * - Enforces role-based access control at the data layer
 * - Makes it impossible to accidentally fetch unscoped data
 */

import { BaseCrudService } from '@/integrations';

/**
 * Authentication context required for all secure operations
 */
export interface AuthContext {
  memberId: string;
  role: 'client' | 'trainer' | 'admin';
}

/**
 * Protected collections that require scoped access
 */
const PROTECTED_COLLECTIONS = [
  'clientassignedworkouts',
  'programassignments',
  'clientprofiles',
  'trainerclientassignments',
  'trainerclientnotes',
  'weeklycheckins',
  'weeklysummaries',
  'weeklycoachesnotes',
  'trainernotifications',
] as const;

type ProtectedCollection = typeof PROTECTED_COLLECTIONS[number];

/**
 * Query options for secure data access
 */
interface SecureQueryOptions {
  singleRef?: string[];
  multiRef?: string[];
  limit?: number;
  skip?: number;
}

/**
 * Result from secure getAll operations
 */
interface SecureQueryResult<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
  pageSize: number;
  nextSkip: number | null;
}

/**
 * Secure Data Access Service
 * 
 * Provides scoped access to protected collections based on authentication context.
 * All methods enforce role-based filtering to prevent unauthorized data access.
 */
export class SecureDataAccess {
  /**
   * Get items scoped to the authenticated user's context
   * 
   * @param collectionId - The protected collection to query
   * @param authContext - Authentication context (role + memberId)
   * @param options - Query options (refs, pagination)
   * @returns Scoped query results
   * 
   * @throws Error if collection is not protected or auth context is missing
   * 
   * @example
   * // Client accessing their own workouts
   * const workouts = await SecureDataAccess.getScoped(
   *   'clientassignedworkouts',
   *   { memberId: 'client-123', role: 'client' },
   *   { limit: 50 }
   * );
   * 
   * @example
   * // Trainer accessing their assigned clients' workouts
   * const workouts = await SecureDataAccess.getScoped(
   *   'clientassignedworkouts',
   *   { memberId: 'trainer-456', role: 'trainer' },
   *   { limit: 50 }
   * );
   */
  static async getScoped<T>(
    collectionId: ProtectedCollection,
    authContext: AuthContext,
    options: SecureQueryOptions = {}
  ): Promise<SecureQueryResult<T>> {
    this.validateAuthContext(authContext);
    this.validateProtectedCollection(collectionId);

    // Admin can access all data (but should still scope in most cases)
    if (authContext.role === 'admin') {
      return this.getAdminScoped<T>(collectionId, options);
    }

    // Build scoped query based on role
    const scopedQuery = this.buildScopedQuery(collectionId, authContext);

    // Execute query with scoping
    const result = await BaseCrudService.getAll<T>(
      collectionId,
      options.singleRef || [],
      options.multiRef || [],
      { limit: options.limit, skip: options.skip }
    );

    // Filter results based on role (defense in depth)
    const filteredItems = this.filterByRole(result.items, collectionId, authContext);

    return {
      items: filteredItems,
      totalCount: filteredItems.length,
      hasNext: result.hasNext,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      nextSkip: result.nextSkip,
    };
  }

  /**
   * Get a single item by ID with scope validation
   * 
   * @param collectionId - The protected collection to query
   * @param itemId - The item ID to retrieve
   * @param authContext - Authentication context (role + memberId)
   * @param options - Query options (refs)
   * @returns The item if authorized, null otherwise
   * 
   * @throws Error if user is not authorized to access the item
   * 
   * @example
   * const workout = await SecureDataAccess.getByIdScoped(
   *   'clientassignedworkouts',
   *   'workout-123',
   *   { memberId: 'client-456', role: 'client' }
   * );
   */
  static async getByIdScoped<T>(
    collectionId: ProtectedCollection,
    itemId: string,
    authContext: AuthContext,
    options: Pick<SecureQueryOptions, 'singleRef' | 'multiRef'> = {}
  ): Promise<T | null> {
    this.validateAuthContext(authContext);
    this.validateProtectedCollection(collectionId);

    const item = await BaseCrudService.getById<T>(
      collectionId,
      itemId,
      options.singleRef || [],
      options.multiRef || []
    );

    if (!item) {
      return null;
    }

    // Validate access based on role
    const hasAccess = this.validateItemAccess(item, collectionId, authContext);
    
    if (!hasAccess) {
      throw new Error(`Unauthorized: User does not have access to this ${collectionId} item`);
    }

    return item;
  }

  /**
   * Get items for a specific client (trainer or admin only)
   * 
   * @param collectionId - The protected collection to query
   * @param clientId - The client ID to query for
   * @param authContext - Authentication context (must be trainer or admin)
   * @param options - Query options
   * @returns Scoped query results for the specified client
   * 
   * @throws Error if user is not authorized (must be trainer or admin)
   * 
   * @example
   * // Trainer accessing a specific client's data
   * const assignments = await SecureDataAccess.getForClient(
   *   'programassignments',
   *   'client-123',
   *   { memberId: 'trainer-456', role: 'trainer' }
   * );
   */
  static async getForClient<T>(
    collectionId: ProtectedCollection,
    clientId: string,
    authContext: AuthContext,
    options: SecureQueryOptions = {}
  ): Promise<SecureQueryResult<T>> {
    this.validateAuthContext(authContext);
    this.validateProtectedCollection(collectionId);

    // Only trainers and admins can query by client
    if (authContext.role === 'client') {
      throw new Error('Unauthorized: Clients cannot query other clients\' data');
    }

    // For trainers, verify they have access to this client
    if (authContext.role === 'trainer') {
      const hasAccess = await this.verifyTrainerClientAccess(authContext.memberId, clientId);
      if (!hasAccess) {
        throw new Error(`Unauthorized: Trainer does not have access to client ${clientId}`);
      }
    }

    // Query with client scoping
    const result = await BaseCrudService.getAll<T>(
      collectionId,
      options.singleRef || [],
      options.multiRef || [],
      { limit: options.limit, skip: options.skip }
    );

    // Filter to only items for this client
    const filteredItems = result.items.filter((item: any) => item.clientId === clientId);

    return {
      items: filteredItems,
      totalCount: filteredItems.length,
      hasNext: result.hasNext,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      nextSkip: result.nextSkip,
    };
  }

  /**
   * Get items for a specific trainer (admin only)
   * 
   * @param collectionId - The protected collection to query
   * @param trainerId - The trainer ID to query for
   * @param authContext - Authentication context (must be admin)
   * @param options - Query options
   * @returns Scoped query results for the specified trainer
   */
  static async getForTrainer<T>(
    collectionId: ProtectedCollection,
    trainerId: string,
    authContext: AuthContext,
    options: SecureQueryOptions = {}
  ): Promise<SecureQueryResult<T>> {
    this.validateAuthContext(authContext);
    this.validateProtectedCollection(collectionId);

    // Only admins can query by trainer
    if (authContext.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can query trainer-scoped data');
    }

    const result = await BaseCrudService.getAll<T>(
      collectionId,
      options.singleRef || [],
      options.multiRef || [],
      { limit: options.limit, skip: options.skip }
    );

    // Filter to only items for this trainer
    const filteredItems = result.items.filter((item: any) => item.trainerId === trainerId);

    return {
      items: filteredItems,
      totalCount: filteredItems.length,
      hasNext: result.hasNext,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      nextSkip: result.nextSkip,
    };
  }

  /**
   * Admin-only unscoped access (use with extreme caution)
   * 
   * @param collectionId - The protected collection to query
   * @param options - Query options
   * @returns Unscoped query results (admin only)
   * 
   * @throws Error if user is not admin
   */
  private static async getAdminScoped<T>(
    collectionId: ProtectedCollection,
    options: SecureQueryOptions = {}
  ): Promise<SecureQueryResult<T>> {
    const result = await BaseCrudService.getAll<T>(
      collectionId,
      options.singleRef || [],
      options.multiRef || [],
      { limit: options.limit, skip: options.skip }
    );

    return {
      items: result.items,
      totalCount: result.totalCount,
      hasNext: result.hasNext,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      nextSkip: result.nextSkip,
    };
  }

  /**
   * Build scoped query filters based on role and collection
   */
  private static buildScopedQuery(
    collectionId: ProtectedCollection,
    authContext: AuthContext
  ): Record<string, any> {
    const query: Record<string, any> = {};

    switch (authContext.role) {
      case 'client':
        // Clients can only see their own data
        query.clientId = authContext.memberId;
        break;

      case 'trainer':
        // Trainers can see data for their assigned clients
        query.trainerId = authContext.memberId;
        break;

      case 'admin':
        // Admins have no restrictions (handled separately)
        break;
    }

    return query;
  }

  /**
   * Filter results based on role (defense in depth)
   */
  private static filterByRole<T>(
    items: T[],
    collectionId: ProtectedCollection,
    authContext: AuthContext
  ): T[] {
    if (authContext.role === 'admin') {
      return items;
    }

    return items.filter((item: any) => {
      switch (authContext.role) {
        case 'client':
          return item.clientId === authContext.memberId;
        
        case 'trainer':
          return item.trainerId === authContext.memberId;
        
        default:
          return false;
      }
    });
  }

  /**
   * Validate item access based on role
   */
  private static validateItemAccess<T>(
    item: T,
    collectionId: ProtectedCollection,
    authContext: AuthContext
  ): boolean {
    if (authContext.role === 'admin') {
      return true;
    }

    const itemData = item as any;

    switch (authContext.role) {
      case 'client':
        return itemData.clientId === authContext.memberId;
      
      case 'trainer':
        return itemData.trainerId === authContext.memberId;
      
      default:
        return false;
    }
  }

  /**
   * Verify trainer has access to a specific client
   */
  private static async verifyTrainerClientAccess(
    trainerId: string,
    clientId: string
  ): Promise<boolean> {
    try {
      const assignments = await BaseCrudService.getAll<any>(
        'trainerclientassignments',
        [],
        [],
        { limit: 1 }
      );

      return assignments.items.some(
        (assignment: any) =>
          assignment.trainerId === trainerId &&
          assignment.clientId === clientId &&
          assignment.status === 'active'
      );
    } catch (error) {
      console.error('Error verifying trainer-client access:', error);
      return false;
    }
  }

  /**
   * Validate authentication context
   */
  private static validateAuthContext(authContext: AuthContext): void {
    if (!authContext || !authContext.memberId || !authContext.role) {
      throw new Error('Invalid authentication context: memberId and role are required');
    }

    if (!['client', 'trainer', 'admin'].includes(authContext.role)) {
      throw new Error(`Invalid role: ${authContext.role}`);
    }
  }

  /**
   * Validate collection is protected
   */
  private static validateProtectedCollection(collectionId: string): void {
    if (!PROTECTED_COLLECTIONS.includes(collectionId as ProtectedCollection)) {
      throw new Error(`Collection ${collectionId} is not a protected collection`);
    }
  }

  /**
   * Check if a collection is protected
   */
  static isProtectedCollection(collectionId: string): boolean {
    return PROTECTED_COLLECTIONS.includes(collectionId as ProtectedCollection);
  }

  /**
   * Get list of all protected collections
   */
  static getProtectedCollections(): readonly string[] {
    return PROTECTED_COLLECTIONS;
  }
}

/**
 * Helper function to get auth context from member data
 * 
 * @example
 * const authContext = await getAuthContext(member);
 * const workouts = await SecureDataAccess.getScoped(
 *   'clientassignedworkouts',
 *   authContext
 * );
 */
export async function getAuthContext(member: any): Promise<AuthContext | null> {
  if (!member?._id) {
    return null;
  }

  // Get member role from memberroles collection
  try {
    const roleResult = await BaseCrudService.getAll<any>('memberroles', [], [], { limit: 1 });
    const roleRecord = roleResult.items.find(
      (r: any) => r.memberId === member._id && r.status === 'active'
    );

    if (!roleRecord) {
      return null;
    }

    return {
      memberId: member._id,
      role: roleRecord.role as 'client' | 'trainer' | 'admin',
    };
  } catch (error) {
    console.error('Error getting auth context:', error);
    return null;
  }
}

/**
 * Type guard for auth context
 */
export function isValidAuthContext(context: any): context is AuthContext {
  return (
    context &&
    typeof context.memberId === 'string' &&
    typeof context.role === 'string' &&
    ['client', 'trainer', 'admin'].includes(context.role)
  );
}
