/**
 * LangVoice JavaScript/TypeScript SDK
 *
 * Official SDK for LangVoice Text-to-Speech API.
 * Supports AI agent integrations with OpenAI, LangChain, AutoGen, and more.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { LangVoiceClient } from 'langvoice-sdk';
 *
 * const client = new LangVoiceClient({ apiKey: 'your-api-key' });
 *
 * const response = await client.generate({
 *   text: 'Hello, world!',
 *   voice: 'heart',
 * });
 *
 * // Save to file (Node.js)
 * import { writeFileSync } from 'fs';
 * writeFileSync('output.mp3', response.audioData);
 * ```
 */

// ============================================
// Client
// ============================================
export {
  LangVoiceClient,
  type LangVoiceClientOptions,
  type GenerateOptions,
  type MultiVoiceOptions,
} from './client';

// ============================================
// Models
// ============================================
export {
  // Classes
  Voice,
  Language,
  GenerateRequest,
  MultiVoiceRequest,
  GenerateResponse,
  VoicesResponse,
  LanguagesResponse,
  // Types
  type VoiceData,
  type LanguageData,
  type GenerateRequestData,
  type MultiVoiceRequestData,
  type GenerateResponseData,
  // Constants
  AMERICAN_VOICES,
  BRITISH_VOICES,
  ALL_VOICES,
  LANGUAGES,
  type VoiceId,
  type LanguageId,
} from './models';

// ============================================
// Exceptions
// ============================================
export {
  LangVoiceError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  APIError,
  isLangVoiceError,
  isAuthenticationError,
  isRateLimitError,
} from './exceptions';
