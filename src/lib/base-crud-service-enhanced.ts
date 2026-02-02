/**
 * Enhanced BaseCrudService with improved type safety and error handling
 * 
 * This module provides type-safe CRUD operations with robust error handling
 * for network requests and JSON parsing.
 * 
 * NOTE: This is an enhanced version with stricter type definitions.
 * Use this for new implementations requiring higher type safety.
 */

/**
 * Standard API response contract
 */
interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Validated API response after parsing
 */
interface ValidatedApiResponse<T = unknown> {
  status: number;
  data: T;
}

/**
 * Type guard to validate API response structure
 */
function isValidApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.status === 'number';
}

/**
 * Enhanced BaseCrudService with improved type safety
 * 
 * Key improvements:
 * - Strict type definitions for request/response data
 * - Robust JSON parsing with error recovery
 * - Comprehensive HTTP and app-level error handling
 * - Type guards for response validation
 */
export default class BaseCrudService {
  /**
   * Creates a new item in the collection
   * 
   * @template T - The type of the created item
   * @param collection - Collection ID to create item in
   * @param data - Item data (use Record<string, unknown> for flexibility)
   * @returns Promise<T> - The created item with type safety
   * @throws Error with descriptive message on failure
   * 
   * @example
   * ```ts
   * const item = await BaseCrudService.create<MyType>('my-collection', {
   *   title: 'New Item',
   *   _id: crypto.randomUUID()
   * });
   * ```
   */
  static async create<T>(
    collection: string,
    data: Record<string, unknown>
  ): Promise<T> {
    // Validate inputs
    if (!collection || typeof collection !== 'string') {
      throw new Error('Collection ID must be a non-empty string');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    const response = await fetch('/_functions/protected-data-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        collection,
        data,
      }),
    });

    // Parse JSON response safely
    let json: unknown = null;
    try {
      json = await response.json();
    } catch (err) {
      // Non-JSON response -> treat as error
      const errorMsg =
        err instanceof Error
          ? `Invalid JSON response: ${err.message}`
          : 'Invalid JSON response';
      throw new Error(
        `Failed to parse response creating ${collection} (HTTP ${response.status}): ${errorMsg}`
      );
    }

    // Validate response structure
    if (!isValidApiResponse(json)) {
      throw new Error(
        `Unexpected response structure creating ${collection}: missing or invalid status field`
      );
    }

    // Handle HTTP-level errors
    if (!response.ok) {
      const message =
        json.message ||
        json.error ||
        `Failed to create in ${collection} (HTTP ${response.status})`;
      throw new Error(message);
    }

    // Handle app-level errors (status !== 200)
    if (json.status !== 200) {
      const message =
        (json.data as Record<string, unknown>)?.error ||
        json.message ||
        `Create returned status ${json.status}`;
      throw new Error(message);
    }

    // Validate data is present
    if (!json.data) {
      throw new Error(`No data returned from create operation in ${collection}`);
    }

    return json.data as T;
  }

  /**
   * Retrieves all items from a collection with pagination
   * 
   * @template T - The type of items in the collection
   * @param collection - Collection ID to query
   * @param options - Optional pagination and reference options
   * @returns Promise with paginated results
   * @throws Error with descriptive message on failure
   */
  static async getAll<T>(
    collection: string,
    options?: {
      limit?: number;
      skip?: number;
      singleRef?: string[];
      multiRef?: string[];
    }
  ): Promise<{ items: T[]; totalCount: number; hasNext: boolean }> {
    if (!collection || typeof collection !== 'string') {
      throw new Error('Collection ID must be a non-empty string');
    }

    const response = await fetch('/_functions/protected-data-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getAll',
        collection,
        options,
      }),
    });

    let json: unknown = null;
    try {
      json = await response.json();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? `Invalid JSON response: ${err.message}`
          : 'Invalid JSON response';
      throw new Error(
        `Failed to parse response querying ${collection} (HTTP ${response.status}): ${errorMsg}`
      );
    }

    if (!isValidApiResponse(json)) {
      throw new Error(
        `Unexpected response structure querying ${collection}: missing or invalid status field`
      );
    }

    if (!response.ok) {
      const message =
        json.message ||
        json.error ||
        `Failed to query ${collection} (HTTP ${response.status})`;
      throw new Error(message);
    }

    if (json.status !== 200) {
      const message =
        (json.data as Record<string, unknown>)?.error ||
        json.message ||
        `Query returned status ${json.status}`;
      throw new Error(message);
    }

    if (!json.data) {
      throw new Error(`No data returned from query in ${collection}`);
    }

    return json.data as { items: T[]; totalCount: number; hasNext: boolean };
  }

  /**
   * Retrieves a single item by ID
   * 
   * @template T - The type of the item
   * @param collection - Collection ID
   * @param itemId - Item ID to retrieve
   * @param options - Optional reference options
   * @returns Promise<T | null> - The item or null if not found
   * @throws Error with descriptive message on failure
   */
  static async getById<T>(
    collection: string,
    itemId: string,
    options?: {
      singleRef?: string[];
      multiRef?: string[];
    }
  ): Promise<T | null> {
    if (!collection || typeof collection !== 'string') {
      throw new Error('Collection ID must be a non-empty string');
    }
    if (!itemId || typeof itemId !== 'string') {
      throw new Error('Item ID must be a non-empty string');
    }

    const response = await fetch('/_functions/protected-data-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getById',
        collection,
        itemId,
        options,
      }),
    });

    let json: unknown = null;
    try {
      json = await response.json();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? `Invalid JSON response: ${err.message}`
          : 'Invalid JSON response';
      throw new Error(
        `Failed to parse response retrieving ${collection}/${itemId} (HTTP ${response.status}): ${errorMsg}`
      );
    }

    if (!isValidApiResponse(json)) {
      throw new Error(
        `Unexpected response structure retrieving ${collection}/${itemId}: missing or invalid status field`
      );
    }

    if (!response.ok) {
      const message =
        json.message ||
        json.error ||
        `Failed to retrieve ${collection}/${itemId} (HTTP ${response.status})`;
      throw new Error(message);
    }

    if (json.status !== 200) {
      const message =
        (json.data as Record<string, unknown>)?.error ||
        json.message ||
        `Retrieval returned status ${json.status}`;
      throw new Error(message);
    }

    // Return null if item not found (data is null/undefined)
    if (!json.data) {
      return null;
    }

    return json.data as T;
  }

  /**
   * Updates an existing item
   * 
   * @template T - The type of the item
   * @param collection - Collection ID
   * @param itemId - Item ID to update
   * @param data - Updated item data (only include fields to update)
   * @returns Promise<T> - The updated item
   * @throws Error with descriptive message on failure
   */
  static async update<T>(
    collection: string,
    itemId: string,
    data: Record<string, unknown>
  ): Promise<T> {
    if (!collection || typeof collection !== 'string') {
      throw new Error('Collection ID must be a non-empty string');
    }
    if (!itemId || typeof itemId !== 'string') {
      throw new Error('Item ID must be a non-empty string');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    const response = await fetch('/_functions/protected-data-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        collection,
        itemId,
        data,
      }),
    });

    let json: unknown = null;
    try {
      json = await response.json();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? `Invalid JSON response: ${err.message}`
          : 'Invalid JSON response';
      throw new Error(
        `Failed to parse response updating ${collection}/${itemId} (HTTP ${response.status}): ${errorMsg}`
      );
    }

    if (!isValidApiResponse(json)) {
      throw new Error(
        `Unexpected response structure updating ${collection}/${itemId}: missing or invalid status field`
      );
    }

    if (!response.ok) {
      const message =
        json.message ||
        json.error ||
        `Failed to update ${collection}/${itemId} (HTTP ${response.status})`;
      throw new Error(message);
    }

    if (json.status !== 200) {
      const message =
        (json.data as Record<string, unknown>)?.error ||
        json.message ||
        `Update returned status ${json.status}`;
      throw new Error(message);
    }

    if (!json.data) {
      throw new Error(`No data returned from update operation in ${collection}`);
    }

    return json.data as T;
  }

  /**
   * Deletes an item by ID
   * 
   * @param collection - Collection ID
   * @param itemId - Item ID to delete
   * @returns Promise<{ success: boolean }> - Deletion result
   * @throws Error with descriptive message on failure
   */
  static async delete(
    collection: string,
    itemId: string
  ): Promise<{ success: boolean }> {
    if (!collection || typeof collection !== 'string') {
      throw new Error('Collection ID must be a non-empty string');
    }
    if (!itemId || typeof itemId !== 'string') {
      throw new Error('Item ID must be a non-empty string');
    }

    const response = await fetch('/_functions/protected-data-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        collection,
        itemId,
      }),
    });

    let json: unknown = null;
    try {
      json = await response.json();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? `Invalid JSON response: ${err.message}`
          : 'Invalid JSON response';
      throw new Error(
        `Failed to parse response deleting ${collection}/${itemId} (HTTP ${response.status}): ${errorMsg}`
      );
    }

    if (!isValidApiResponse(json)) {
      throw new Error(
        `Unexpected response structure deleting ${collection}/${itemId}: missing or invalid status field`
      );
    }

    if (!response.ok) {
      const message =
        json.message ||
        json.error ||
        `Failed to delete ${collection}/${itemId} (HTTP ${response.status})`;
      throw new Error(message);
    }

    if (json.status !== 200) {
      const message =
        (json.data as Record<string, unknown>)?.error ||
        json.message ||
        `Delete returned status ${json.status}`;
      throw new Error(message);
    }

    return { success: true };
  }
}
