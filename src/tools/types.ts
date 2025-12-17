/**
 * Shared types for LangVoice tools
 */

// ============================================
// Common Types
// ============================================

/**
 * Base result interface for all tool operations
 */
export interface BaseToolResult {
  success: boolean;
  error?: string;
}

/**
 * Result from TTS generation tools
 */
export interface TTSResult extends BaseToolResult {
  audioBase64?: string;
  audioBuffer?: Buffer;
  duration?: number;
  generationTime?: number;
  charactersProcessed?: number;
}

/**
 * Result from list voices tool
 */
export interface VoicesResult extends BaseToolResult {
  voices?: VoiceInfo[];
}

/**
 * Result from list languages tool
 */
export interface LanguagesResult extends BaseToolResult {
  languages?: LanguageInfo[];
}

/**
 * Voice information
 */
export interface VoiceInfo {
  id: string;
  name: string;
  gender?: string;
  language?: string;
  description?: string;
}

/**
 * Language information
 */
export interface LanguageInfo {
  id: string;
  name: string;
  voices?: string[];
}

// ============================================
// Tool Input Types
// ============================================

/**
 * Input for text-to-speech generation
 */
export interface TTSInput {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

/**
 * Input for multi-voice generation
 */
export interface MultiVoiceInput {
  text: string;
  language?: string;
  speed?: number;
}

// ============================================
// Function Schema Types
// ============================================

/**
 * JSON Schema property definition
 */
export interface SchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

/**
 * Function parameters schema
 */
export interface FunctionParameters {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required: string[];
  [key: string]: unknown;
}

/**
 * Function schema definition
 */
export interface FunctionSchema {
  name: string;
  description: string;
  parameters: FunctionParameters;
}

/**
 * OpenAI tool definition format
 */
export interface OpenAIToolDefinition {
  type: 'function';
  function: FunctionSchema;
}

/**
 * OpenAI tool call format
 */
export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ============================================
// AutoGen Types
// ============================================

/**
 * AutoGen function definition
 */
export interface AutoGenFunctionDef {
  name: string;
  description: string;
  parameters: FunctionParameters;
}

/**
 * AutoGen tool configuration
 */
export interface AutoGenToolConfig {
  functions: AutoGenFunctionDef[];
}

/**
 * AutoGen function call
 */
export interface AutoGenFunctionCall {
  name: string;
  arguments: Record<string, unknown> | string;
}

// ============================================
// LangChain Types
// ============================================

/**
 * LangChain tool input schema
 */
export interface LangChainInputSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

/**
 * LangChain tool metadata
 */
export interface LangChainToolMetadata {
  name: string;
  description: string;
  schema?: LangChainInputSchema;
}

// ============================================
// Constants
// ============================================

/**
 * Tool name constants
 */
export const TOOL_NAMES = {
  TTS: 'langvoice_text_to_speech',
  MULTI_VOICE: 'langvoice_multi_voice_speech',
  LIST_VOICES: 'langvoice_list_voices',
  LIST_LANGUAGES: 'langvoice_list_languages',
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

/**
 * Available voices
 */
export const VOICES = {
  AMERICAN: [
    'heart', 'bella', 'nicole', 'sarah', 'nova', 'sky', 'jessica',
    'river', 'michael', 'fenrir', 'eric', 'liam', 'onyx', 'adam',
  ],
  BRITISH: [
    'emma', 'isabella', 'alice', 'lily', 'george', 'fable', 'lewis', 'daniel',
  ],
} as const;

export const ALL_VOICES = [...VOICES.AMERICAN, ...VOICES.BRITISH] as const;

/**
 * Supported languages
 */
export const LANGUAGES = [
  'american_english',
  'british_english',
  'spanish',
  'french',
  'hindi',
  'italian',
  'japanese',
  'brazilian_portuguese',
  'mandarin_chinese',
] as const;

export type VoiceId = (typeof ALL_VOICES)[number];
export type LanguageId = (typeof LANGUAGES)[number];
