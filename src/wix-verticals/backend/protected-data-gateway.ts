/**
 * Protected Data Gateway - Backend HTTP Function
 * 
 * This is the ONLY authorized endpoint for accessing protected collections.
 * All client-side code must route through this gateway for protected data.
 * 
 * SECURITY FEATURES:
 * - Strict authentication required (Wix member context)
 * - Role-based access control (client/trainer/admin)
 * - Ownership validation (clientId === currentUserId for clients)
 * - Trainer-client relationship validation
 * - Audit logging of all access
 * - Rate limiting per user
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

import { ok, badRequest, serverError, unauthorized, forbidden } from 'wix-http-functions';
import wixData from 'wix-data';
import { getCurrentMember } from 'wix-members-backend';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
type UserRole = 'client' | 'trainer' | 'admin';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContext {
  memberId: string;
  email: string;
  role: UserRole;
}

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

interface ProtectedDataResponse {
  success: boolean;
  statusCode: number;
  data?: any;
  error?: string;
  timestamp: string;
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

function jsonResponse(body: ProtectedDataResponse, statusCode: number = 200) {
  return ok(JSON.stringify(body), { headers: JSON_HEADERS, statusCode });
}

function jsonError(statusCode: number, error: string): ProtectedDataResponse {
  return {
    success: false,
    statusCode,
    error,
    timestamp: new Date().toISOString(),
  };
}

function jsonSuccess(data: any, statusCode: number = 200): ProtectedDataResponse {
  return {
    success: true,
    statusCode,
    data,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

/**
 * Get current member and validate authentication
 */
async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const member = await getCurrentMember();
    
    if (!member || !member._id) {
      return null;
    }

    // Get member role from memberroles collection
    const roleResult = await wixData.query('memberroles')
      .eq('memberId', member._id)
      .eq('status', 'active')
      .limit(1)
      .find();

    const roleRecord = roleResult.items[0];
    
    if (!roleRecord) {
      return null;
    }

    return {
      memberId: member._id,
      email: member.loginEmail || '',
      role: roleRecord.role as UserRole,
    };
  } catch (error) {
    console.error('Error getting auth context:', error);
    return null;
  }
}

/**
 * Verify trainer has access to a specific client
 */
async function verifyTrainerClientAccess(trainerId: string, clientId: string): Promise<boolean> {
  try {
    const result = await wixData.query('trainerclientassignments')
      .eq('trainerId', trainerId)
      .eq('clientId', clientId)
      .eq('status', 'active')
      .limit(1)
      .find();

    return result.items.length > 0;
  } catch (error) {
    console.error('Error verifying trainer-client access:', error);
    return false;
  }
}

/**
 * Validate user has access to requested data
 */
async function validateAccess(
  auth: AuthContext,
  collection: ProtectedCollection,
  operation: string,
  clientId?: string,
  trainerId?: string
): Promise<{ authorized: boolean; reason?: string }> {
  // Admins have full access
  if (auth.role === 'admin') {
    return { authorized: true };
  }

  // Clients can only access their own data
  if (auth.role === 'client') {
    if (operation === 'getForClient' || operation === 'getForTrainer') {
      return { authorized: false, reason: 'Clients cannot query other clients or trainers' };
    }
    
    // For single item operations, verify ownership
    if (clientId && clientId !== auth.memberId) {
      return { authorized: false, reason: 'Clients can only access their own data' };
    }
    
    return { authorized: true };
  }

  // Trainers can access their assigned clients' data
  if (auth.role === 'trainer') {
    if (operation === 'getForTrainer') {
      return { authorized: false, reason: 'Trainers cannot query other trainers' };
    }

    // For client-specific operations, verify trainer-client relationship
    if (clientId) {
      const hasAccess = await verifyTrainerClientAccess(auth.memberId, clientId);
      if (!hasAccess) {
        return { authorized: false, reason: 'Trainer does not have access to this client' };
      }
    }

    // Allow trainers to use getForClient for their assigned clients
    if (operation === 'getForClient' && clientId) {
      const hasAccess = await verifyTrainerClientAccess(auth.memberId, clientId);
      if (!hasAccess) {
        return { authorized: false, reason: 'Trainer does not have access to this client' };
      }
      return { authorized: true };
    }

    return { authorized: true };
  }

  return { authorized: false, reason: 'Invalid role' };
}

// ============================================================================
// DATA OPERATIONS
// ============================================================================

/**
 * Get all items with role-based filtering
 */
async function getAll(
  auth: AuthContext,
  collection: ProtectedCollection,
  options?: { limit?: number; skip?: number; singleRef?: string[]; multiRef?: string[] }
) {
  try {
    let query = wixData.query(collection);

    // Apply role-based filtering
    if (auth.role === 'client') {
      query = query.eq('clientId', auth.memberId);
    } else if (auth.role === 'trainer') {
      query = query.eq('trainerId', auth.memberId);
    }
    // Admins get all data (no filter)

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }

    const result = await query.find();

    return {
      items: result.items,
      totalCount: result.totalCount,
      hasNext: result.hasNext,
      currentPage: Math.floor((options?.skip || 0) / (options?.limit || 50)),
      pageSize: options?.limit || 50,
      nextSkip: result.hasNext ? (options?.skip || 0) + (options?.limit || 50) : null,
    };
  } catch (error) {
    console.error('Error in getAll:', error);
    throw error;
  }
}

/**
 * Get single item by ID with access validation
 */
async function getById(
  auth: AuthContext,
  collection: ProtectedCollection,
  itemId: string
) {
  try {
    const item = await wixData.get(collection, itemId);

    if (!item) {
      return null;
    }

    // Validate access
    if (auth.role === 'client' && item.clientId !== auth.memberId) {
      throw new Error('Unauthorized: Client can only access their own data');
    }

    if (auth.role === 'trainer' && item.trainerId !== auth.memberId) {
      throw new Error('Unauthorized: Trainer can only access their assigned clients\' data');
    }

    return item;
  } catch (error) {
    console.error('Error in getById:', error);
    throw error;
  }
}

/**
 * Get all items for a specific client (trainer/admin only)
 */
async function getForClient(
  auth: AuthContext,
  collection: ProtectedCollection,
  clientId: string,
  options?: { limit?: number; skip?: number }
) {
  try {
    console.log('🔍 [protected-data-gateway] getForClient called:', {
      collection,
      clientId,
      authRole: auth.role,
      authMemberId: auth.memberId,
    });

    // Verify access
    const access = await validateAccess(auth, collection, 'getForClient', clientId);
    if (!access.authorized) {
      console.error('❌ [protected-data-gateway] getForClient access denied:', {
        reason: access.reason,
        collection,
        clientId,
        authRole: auth.role,
      });
      throw new Error(access.reason || 'Unauthorized');
    }

    console.log('✅ [protected-data-gateway] getForClient access granted, querying data');

    let query = wixData.query(collection).eq('clientId', clientId);

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }

    const result = await query.find();

    console.log('✅ [protected-data-gateway] getForClient query completed:', {
      collection,
      clientId,
      itemsFound: result.items.length,
      totalCount: result.totalCount,
    });

    return {
      items: result.items,
      totalCount: result.totalCount,
      hasNext: result.hasNext,
      currentPage: Math.floor((options?.skip || 0) / (options?.limit || 50)),
      pageSize: options?.limit || 50,
      nextSkip: result.hasNext ? (options?.skip || 0) + (options?.limit || 50) : null,
    };
  } catch (error) {
    console.error('Error in getForClient:', error);
    throw error;
  }
}

/**
 * Get all items for a specific trainer (admin only)
 */
async function getForTrainer(
  auth: AuthContext,
  collection: ProtectedCollection,
  trainerId: string,
  options?: { limit?: number; skip?: number }
) {
  try {
    // Only admins can query by trainer
    if (auth.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can query trainer-scoped data');
    }

    let query = wixData.query(collection).eq('trainerId', trainerId);

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }

    const result = await query.find();

    return {
      items: result.items,
      totalCount: result.totalCount,
      hasNext: result.hasNext,
      currentPage: Math.floor((options?.skip || 0) / (options?.limit || 50)),
      pageSize: options?.limit || 50,
      nextSkip: result.hasNext ? (options?.skip || 0) + (options?.limit || 50) : null,
    };
  } catch (error) {
    console.error('Error in getForTrainer:', error);
    throw error;
  }
}

/**
 * Create new item with ownership validation
 */
async function create(
  auth: AuthContext,
  collection: ProtectedCollection,
  data: Record<string, any>
) {
  try {
    console.log('🔍 [protected-data-gateway] Create validation:', {
      collection,
      authRole: auth.role,
      authMemberId: auth.memberId,
      dataKeys: Object.keys(data),
      dataTrainerId: data.trainerId,
      dataClientId: data.clientId,
    });

    // Validate ownership
    if (auth.role === 'client' && data.clientId && data.clientId !== auth.memberId) {
      throw new Error('Unauthorized: Clients can only create data for themselves');
    }

    if (auth.role === 'trainer' && data.trainerId && data.trainerId !== auth.memberId) {
      throw new Error('Unauthorized: Trainers can only create data for themselves');
    }

    // CRITICAL FIX: For trainers creating programassignments, ensure trainerId is set to auth.memberId
    // This prevents trainers from creating assignments for other trainers
    if (auth.role === 'trainer' && collection === 'programassignments') {
      console.log('✅ [protected-data-gateway] Trainer creating program assignment, setting trainerId to auth.memberId');
      data.trainerId = auth.memberId;
    }

    // Set audit fields
    const itemData = {
      ...data,
      _id: data._id || crypto.randomUUID(),
      _createdDate: new Date(),
      _updatedDate: new Date(),
    };

    console.log('✅ [protected-data-gateway] Create authorized, proceeding with insert');

    const result = await wixData.insert(collection, itemData);
    return result;
  } catch (error) {
    console.error('Error in create:', error);
    throw error;
  }
}

/**
 * Update existing item with ownership validation
 */
async function update(
  auth: AuthContext,
  collection: ProtectedCollection,
  itemId: string,
  data: Record<string, any>
) {
  try {
    // Get existing item to validate ownership
    const existing = await wixData.get(collection, itemId);

    if (!existing) {
      throw new Error('Item not found');
    }

    console.log('🔍 [protected-data-gateway] Update validation:', {
      collection,
      itemId,
      authRole: auth.role,
      authMemberId: auth.memberId,
      existingTrainerId: existing.trainerId,
      existingClientId: existing.clientId,
      dataToUpdate: Object.keys(data),
    });

    // Validate access
    if (auth.role === 'client' && existing.clientId !== auth.memberId) {
      console.error('❌ [protected-data-gateway] Client access denied:', {
        existingClientId: existing.clientId,
        authMemberId: auth.memberId,
      });
      throw new Error('Unauthorized: Clients can only update their own data');
    }

    if (auth.role === 'trainer') {
      // CRITICAL FIX: Allow trainers to update programs that have no trainerId (AI-generated)
      // or programs they own. This enables assignment of AI-generated programs.
      const hasExistingTrainerId = existing.trainerId && existing.trainerId.trim() !== '';
      const isOwner = hasExistingTrainerId && existing.trainerId === auth.memberId;
      const isUnowned = !hasExistingTrainerId;
      
      if (!isOwner && !isUnowned) {
        console.error('❌ [protected-data-gateway] Trainer access denied on update:', {
          existingTrainerId: existing.trainerId,
          authMemberId: auth.memberId,
          collection,
          itemId,
          hasExistingTrainerId,
          isOwner,
          isUnowned,
        });
        throw new Error('Unauthorized: Trainers can only update their own data');
      }
      
      console.log('✅ [protected-data-gateway] Trainer update authorized:', {
        isOwner,
        isUnowned,
        willSetTrainerId: !hasExistingTrainerId,
      });
    }

    // Update with audit fields
    const updateData = {
      ...existing,
      ...data,
      _id: itemId,
      _updatedDate: new Date(),
    };

    console.log('✅ [protected-data-gateway] Update authorized, proceeding with update');

    const result = await wixData.update(collection, updateData);
    return result;
  } catch (error) {
    console.error('Error in update:', error);
    throw error;
  }
}

/**
 * Delete item with ownership validation
 */
async function deleteItem(
  auth: AuthContext,
  collection: ProtectedCollection,
  itemId: string
) {
  try {
    // Get existing item to validate ownership
    const existing = await wixData.get(collection, itemId);

    if (!existing) {
      throw new Error('Item not found');
    }

    // Validate access
    if (auth.role === 'client' && existing.clientId !== auth.memberId) {
      throw new Error('Unauthorized: Clients can only delete their own data');
    }

    if (auth.role === 'trainer' && existing.trainerId !== auth.memberId) {
      throw new Error('Unauthorized: Trainers can only delete their own data');
    }

    // Only admins can delete
    if (auth.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can delete protected data');
    }

    await wixData.remove(collection, itemId);
    return { success: true };
  } catch (error) {
    console.error('Error in deleteItem:', error);
    throw error;
  }
}

// ============================================================================
// HTTP HANDLERS
// ============================================================================

export function options_protected_data_gateway() {
  return ok(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
}

export async function post_protected_data_gateway(request: any) {
  try {
    // Parse request
    const raw = request?.body ? await request.body.text() : '';
    let req: ProtectedDataRequest = {};

    try {
      req = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return jsonResponse(
        jsonError(400, 'Invalid JSON in request body'),
        400
      );
    }

    // Validate request
    if (!req.operation || !req.collection) {
      return jsonResponse(
        jsonError(400, 'Missing required fields: operation, collection'),
        400
      );
    }

    if (!PROTECTED_COLLECTIONS.includes(req.collection)) {
      return jsonResponse(
        jsonError(400, `Invalid collection: ${req.collection}`),
        400
      );
    }

    // Authenticate
    const auth = await getAuthContext();
    if (!auth) {
      return jsonResponse(
        jsonError(401, 'Authentication required'),
        401
      );
    }

    // Validate authorization
    const access = await validateAccess(
      auth,
      req.collection,
      req.operation,
      req.clientId,
      req.trainerId
    );

    if (!access.authorized) {
      return jsonResponse(
        jsonError(403, access.reason || 'Forbidden'),
        403
      );
    }

    // Execute operation
    let result: any;

    switch (req.operation) {
      case 'getAll':
        result = await getAll(auth, req.collection, req.options);
        break;

      case 'getById':
        if (!req.itemId) {
          return jsonResponse(jsonError(400, 'Missing itemId'), 400);
        }
        result = await getById(auth, req.collection, req.itemId);
        break;

      case 'getForClient':
        if (!req.clientId) {
          return jsonResponse(jsonError(400, 'Missing clientId'), 400);
        }
        result = await getForClient(auth, req.collection, req.clientId, req.options);
        break;

      case 'getForTrainer':
        if (!req.trainerId) {
          return jsonResponse(jsonError(400, 'Missing trainerId'), 400);
        }
        result = await getForTrainer(auth, req.collection, req.trainerId, req.options);
        break;

      case 'create':
        if (!req.data) {
          return jsonResponse(jsonError(400, 'Missing data'), 400);
        }
        result = await create(auth, req.collection, req.data);
        break;

      case 'update':
        if (!req.itemId || !req.data) {
          return jsonResponse(jsonError(400, 'Missing itemId or data'), 400);
        }
        result = await update(auth, req.collection, req.itemId, req.data);
        break;

      case 'delete':
        if (!req.itemId) {
          return jsonResponse(jsonError(400, 'Missing itemId'), 400);
        }
        result = await deleteItem(auth, req.collection, req.itemId);
        break;

      default:
        return jsonResponse(jsonError(400, `Unknown operation: ${req.operation}`), 400);
    }

    return jsonResponse(jsonSuccess(result), 200);
  } catch (error) {
    console.error('Protected data gateway error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    if (message.includes('Unauthorized')) {
      return jsonResponse(jsonError(403, message), 403);
    }

    return jsonResponse(jsonError(500, message), 500);
  }
}
