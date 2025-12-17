/**
 * AI agent tools for LangVoice SDK
 *
 * Supports multiple AI frameworks:
 * - OpenAI: LangVoiceOpenAITools
 * - LangChain: LangVoiceLangChainToolkit
 * - AutoGen: LangVoiceAutoGenTools
 * - Generic: LangVoiceToolkit (works with any framework)
 */

// ============================================
// Shared Types (from types.ts)
// ============================================
export {
  // Common types
  type BaseToolResult,
  type TTSResult,
  type VoicesResult,
  type LanguagesResult,
  type VoiceInfo,
  type LanguageInfo,
  // Input types
  type TTSInput,
  type MultiVoiceInput,
  // Schema types
  type SchemaProperty,
  type FunctionParameters,
  type FunctionSchema,
  type OpenAIToolDefinition,
  type OpenAIToolCall,
  // AutoGen types
  type AutoGenFunctionDef,
  type AutoGenToolConfig,
  type AutoGenFunctionCall,
  // LangChain types
  type LangChainInputSchema,
  type LangChainToolMetadata,
  // Constants
  TOOL_NAMES,
  VOICES,
  ALL_VOICES,
  LANGUAGES,
  type ToolName,
  type VoiceId,
  type LanguageId,
} from './types';

// ============================================
// Generic Tools
// ============================================
export {
  LangVoiceToolkit,
  createLangVoiceToolkit,
} from './generic-tools';

export type {
  ToolResult,
  TTSToolResult,
  VoicesToolResult,
  LanguagesToolResult,
} from './generic-tools';

// ============================================
// OpenAI Tools
// ============================================
export {
  LangVoiceOpenAITools,
  getOpenAITools,
  handleOpenAIToolCall,
  LANGVOICE_TTS_TOOL,
  LANGVOICE_MULTI_VOICE_TOOL,
  LANGVOICE_LIST_VOICES_TOOL,
  LANGVOICE_LIST_LANGUAGES_TOOL,
} from './openai-tools';

export type { ToolCallResult } from './openai-tools';

// ============================================
// LangChain Tools
// ============================================
export {
  LangVoiceLangChainToolkit,
  LangVoiceTTSTool,
  LangVoiceMultiVoiceTool,
  LangVoiceVoicesTool,
  LangVoiceLanguagesTool,
  getAllLangChainTools,
} from './langchain-tools';

// ============================================
// AutoGen Tools
// ============================================
export {
  LangVoiceAutoGenTools,
  createAutoGenTools,
  getAutoGenFunctionDefinitions,
} from './autogen-tools';

export type {
  AutoGenToolOptions,
  FunctionHandler,
  FunctionMap,
} from './autogen-tools';
