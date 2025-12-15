/**
 * NeuroTamagotchi TypeScript Type Definitions
 * 
 * These types match the backend Pydantic schemas and database models.
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * User data returned from API.
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  username: string;
  /** NTG token balance */
  balance_ntg: number;
  /** Account creation timestamp (ISO 8601) */
  created_at?: string;
}

/**
 * Request payload for user registration.
 */
export interface UserCreateRequest {
  /** User's email address */
  email: string;
  /** Display username (3-20 characters) */
  username: string;
  /** Password (minimum 8 characters, 1 uppercase, 1 lowercase, 1 number) */
  password: string;
}

/**
 * Request payload for user login.
 */
export interface UserLoginRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Request payload for updating user profile.
 */
export interface UserUpdateRequest {
  /** New display username */
  username?: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Authentication tokens returned after login/register.
 */
export interface AuthTokens {
  /** JWT access token for API requests */
  access_token: string;
  /** Token type (always "bearer") */
  token_type: string;
}

/**
 * Login response from API.
 */
export interface LoginResponse {
  /** JWT access token */
  access_token: string;
  /** Token type */
  token_type: string;
  /** User's UUID */
  user_id: string;
  /** User's display name */
  username: string;
  /** Current NTG balance */
  balance_ntg: number;
}

/**
 * Register response from API.
 */
export interface RegisterResponse {
  /** Created user's UUID */
  user_id: string;
  /** JWT access token */
  access_token: string;
  /** Token type */
  token_type: string;
  /** Initial NTG balance */
  balance_ntg: number;
  /** Success message */
  message: string;
}

// ============================================================================
// Character Types
// ============================================================================

/**
 * Available character visual styles.
 */
export type CharacterStyle = "anime" | "cyberpunk" | "fantasy";

/**
 * Character status based on current parameters.
 */
export type CharacterStatus = 
  | "happy" 
  | "normal" 
  | "bored" 
  | "tired" 
  | "sad" 
  | "exhausted";

/**
 * Character parameters (energy, mood, bond).
 */
export interface CharacterParams {
  /** Energy level (0-100) */
  energy: number;
  /** Mood/happiness level (0-100) */
  mood: number;
  /** Bond/affection level with owner (0+) */
  bond: number;
}

/**
 * Character data returned from API.
 */
export interface Character {
  /** Unique character identifier (UUID) */
  id: string;
  /** Owner user ID (UUID) */
  user_id: string;
  /** Character's display name */
  name: string;
  /** Visual style: anime, cyberpunk, fantasy */
  style: CharacterStyle;
  /** Avatar image URL */
  avatar_url: string | null;
  /** InWorld AI agent identifier */
  inworld_agent_id: string | null;
  /** InWorld AI scene identifier */
  inworld_scene_id: string | null;
  /** Character parameters */
  params: CharacterParams;
  /** Current status based on params */
  status: CharacterStatus;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Request payload for creating a new character.
 */
export interface CharacterCreateRequest {
  /** Character name (1-50 characters) */
  name: string;
  /** Visual style: anime, cyberpunk, fantasy */
  style: CharacterStyle;
}

/**
 * Request payload for updating a character.
 */
export interface CharacterUpdateRequest {
  /** New character name */
  name?: string;
  /** New avatar image URL */
  avatar_url?: string;
}

// ============================================================================
// Mission Types
// ============================================================================

/**
 * Available mission types.
 */
export type MissionType = "feed" | "hairstyle" | "selfie";

/**
 * Mission data returned from API.
 */
export interface Mission {
  /** Unique mission identifier (UUID) */
  id: string;
  /** Mission display name */
  name: string;
  /** Mission description */
  description: string | null;
  /** Cost in NTG tokens */
  cost_ntg: number;
  /** Mission type: feed, hairstyle, selfie */
  type: MissionType;
  /** Cooldown period in seconds */
  cooldown_seconds: number;
  /** Cooldown period in minutes */
  cooldown_minutes: number;
  /** Whether mission is currently available */
  is_active: boolean;
}

/**
 * Completed mission data returned from API.
 */
export interface CompletedMission {
  /** Unique completion record identifier (UUID) */
  id: string;
  /** User who completed the mission (UUID) */
  user_id: string;
  /** Character used in the mission (UUID) */
  character_id: string;
  /** The completed mission ID (UUID) */
  mission_id: string;
  /** Full mission details */
  mission: Mission | null;
  /** Completion timestamp (ISO 8601) */
  completed_at: string;
  /** Whether mission can be repeated now */
  can_repeat: boolean;
  /** Seconds until mission can be repeated */
  time_until_repeat: number;
}

/**
 * Request payload for executing a mission.
 */
export interface MissionExecuteRequest {
  /** Character to use for the mission (UUID) */
  character_id: string;
}

/**
 * Response after mission execution.
 */
export interface MissionExecuteResponse {
  /** Whether mission was successful */
  success: boolean;
  /** Result message */
  message: string;
  /** Completed mission details */
  completed_mission: CompletedMission | null;
  /** User's new NTG balance */
  new_balance: number;
  /** Updated character parameters */
  character_params: CharacterParams | null;
}

// ============================================================================
// Payment Types
// ============================================================================

/**
 * Payment status values.
 */
export type PaymentStatus = "pending" | "completed" | "failed";

/**
 * Payment data returned from API.
 */
export interface Payment {
  /** Unique payment identifier (UUID) */
  id: string;
  /** User who made the payment (UUID) */
  user_id: string;
  /** Stripe payment intent ID */
  stripe_payment_intent_id: string | null;
  /** Amount in USD cents */
  amount_usd: number;
  /** Amount in USD dollars */
  amount_usd_dollars: number;
  /** NTG tokens purchased */
  amount_ntg: number;
  /** Payment status: pending, completed, failed */
  status: PaymentStatus;
  /** Payment timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Request payload for creating a checkout session.
 */
export interface CheckoutRequest {
  /** Amount in USD cents */
  amount_usd: number;
  /** NTG tokens to purchase */
  amount_ntg: number;
}

/**
 * Response after creating checkout session.
 */
export interface CheckoutResponse {
  /** Stripe checkout URL */
  checkout_url: string;
  /** Checkout session ID */
  session_id: string;
}

/**
 * User balance response.
 */
export interface BalanceResponse {
  /** Current NTG token balance */
  balance_ntg: number;
  /** Currency code (always "NTG") */
  currency: string;
}

// ============================================================================
// Chat Types
// ============================================================================

/**
 * Chat message role.
 */
export type MessageRole = "user" | "assistant";

/**
 * Chat message data.
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Character ID this message belongs to */
  character_id: string;
  /** Message sender role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Character emotion (for assistant messages) */
  emotion?: string;
  /** Message timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Request payload for sending a chat message (new format).
 */
export interface SendMessageRequest {
  /** Message content */
  content: string;
  /** Optional session ID for continuity */
  session_id?: string;
  /** Optional context data */
  context?: Record<string, unknown>;
}

/**
 * Parameter changes from a chat message.
 */
export interface ParamsUpdated {
  /** Energy change amount */
  energy: number;
  /** Mood change amount */
  mood: number;
  /** Bond change amount */
  bond: number;
}

/**
 * Chat response format (new API format).
 */
export interface ChatApiResponse {
  /** AI character's response text */
  response: string;
  /** Session ID for conversation continuity */
  session_id: string;
  /** Character emotion: neutral, happy, sad, excited, tired */
  emotion: string;
  /** Parameter changes from this message */
  params_updated: ParamsUpdated;
}

/**
 * Response after sending a chat message (legacy format).
 */
export interface SendMessageResponse {
  /** The assistant's response message */
  message: ChatMessage;
  /** Character reaction details */
  character_reaction?: {
    /** Character's emotion */
    emotion: string;
    /** Animation to play */
    animation: string;
    /** Parameter changes */
    param_changes?: Partial<CharacterParams>;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * API error response.
 */
export interface ApiError {
  /** Error detail message */
  detail: string;
  /** Error code (optional) */
  code?: string;
  /** Field that caused the error (optional) */
  field?: string;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  /** Items in current page */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  page_size: number;
  /** Total number of pages */
  total_pages: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties in T optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the type of elements in an array.
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
