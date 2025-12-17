/**
 * Generic/Universal tools for LangVoice TTS
 *
 * Works with any AI agent framework that supports function calling.
 */

import { LangVoiceClient } from '../client';
import {
  TOOL_NAMES,
  ALL_VOICES,
  LANGUAGES,
  type FunctionSchema,
} from './types';

// ============================================
// Types (Specific to generic-tools for backwards compatibility)
// ============================================

export interface ToolResult {
  success: boolean;
  error?: string;
}

export interface TTSToolResult extends ToolResult {
  audioBase64?: string;
  duration?: number;
  charactersProcessed?: number;
}

export interface VoicesToolResult extends ToolResult {
  voices?: Array<{ id: string; name: string }>;
}

export interface LanguagesToolResult extends ToolResult {
  languages?: Array<{ id: string; name: string }>;
}

// ============================================
// LangVoiceToolkit Class
// ============================================

/**
 * Universal toolkit for using LangVoice with any AI framework
 *
 * @example
 * ```typescript
 * import { LangVoiceToolkit } from 'langvoice-sdk/tools';
 *
 * const toolkit = new LangVoiceToolkit({ apiKey: 'your-langvoice-key' });
 *
 * // Direct usage
 * const result = await toolkit.textToSpeech({ text: 'Hello world!' });
 * await toolkit.saveAudio(result, 'output.mp3');
 *
 * // Handle tool calls from any LLM
 * const result = await toolkit.handleToolCall('langvoice_text_to_speech', { text: 'Hello' });
 *
 * // Get schemas for any framework
 * const schemas = toolkit.getFunctionSchemas();
 * ```
 */
export class LangVoiceToolkit {
  private readonly client: LangVoiceClient;

  /** Tool name constants */
  static readonly TOOL_TTS = TOOL_NAMES.TTS;
  static readonly TOOL_MULTI_VOICE = TOOL_NAMES.MULTI_VOICE;
  static readonly TOOL_LIST_VOICES = TOOL_NAMES.LIST_VOICES;
  static readonly TOOL_LIST_LANGUAGES = TOOL_NAMES.LIST_LANGUAGES;

  constructor(options: { apiKey?: string } = {}) {
    this.client = new LangVoiceClient(options);
  }

  /**
   * Get the underlying LangVoice client
   */
  getClient(): LangVoiceClient {
    return this.client;
  }

  // =========================================
  // CORE TOOL FUNCTIONS
  // =========================================

  /**
   * Convert text to speech
   */
  async textToSpeech(params: {
    text: string;
    voice?: string;
    language?: string;
    speed?: number;
  }): Promise<TTSToolResult> {
    try {
      const response = await this.client.generate({
        text: params.text,
        voice: params.voice || 'heart',
        language: params.language || 'american_english',
        speed: params.speed || 1.0,
      });

      return {
        success: true,
        audioBase64: response.toBase64(),
        duration: response.duration,
        charactersProcessed: response.charactersProcessed,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate speech with multiple voices
   */
  async multiVoiceSpeech(params: {
    text: string;
    language?: string;
    speed?: number;
  }): Promise<TTSToolResult> {
    try {
      const response = await this.client.generateMultiVoice({
        text: params.text,
        language: params.language || 'american_english',
        speed: params.speed || 1.0,
      });

      return {
        success: true,
        audioBase64: response.toBase64(),
        duration: response.duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available voices
   */
  async listVoices(): Promise<VoicesToolResult> {
    try {
      const voices = await this.client.listVoices();
      return {
        success: true,
        voices: voices.map((v) => ({ id: v.id, name: v.name })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get supported languages
   */
  async listLanguages(): Promise<LanguagesToolResult> {
    try {
      const languages = await this.client.listLanguages();
      return {
        success: true,
        languages: languages.map((l) => ({ id: l.id, name: l.name })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // =========================================
  // TOOL CALL HANDLER
  // =========================================

  /**
   * Handle a tool call by name
   */
  async handleToolCall(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<ToolResult | TTSToolResult | VoicesToolResult | LanguagesToolResult> {
    switch (toolName) {
      case TOOL_NAMES.TTS:
        return this.textToSpeech({
          text: args.text as string,
          voice: args.voice as string | undefined,
          language: args.language as string | undefined,
          speed: args.speed as number | undefined,
        });

      case TOOL_NAMES.MULTI_VOICE:
        return this.multiVoiceSpeech({
          text: args.text as string,
          language: args.language as string | undefined,
          speed: args.speed as number | undefined,
        });

      case TOOL_NAMES.LIST_VOICES:
        return this.listVoices();

      case TOOL_NAMES.LIST_LANGUAGES:
        return this.listLanguages();

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  }

  /**
   * Handle tool call and return JSON string result
   */
  async handleToolCallJson(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<string> {
    const result = await this.handleToolCall(toolName, args);
    return JSON.stringify(result);
  }

  // =========================================
  // FUNCTION SCHEMAS
  // =========================================

  /**
   * Get OpenAI-compatible function schemas
   */
  getFunctionSchemas(): FunctionSchema[] {
    return [
      {
        name: TOOL_NAMES.TTS,
        description: 'Convert text to natural-sounding speech audio using LangVoice TTS API.',
        parameters: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text to convert to speech. Maximum 5000 characters.',
            },
            voice: {
              type: 'string',
              description: "Voice ID (e.g., 'heart', 'michael', 'emma').",
              enum: [...ALL_VOICES],
              default: 'heart',
            },
            language: {
              type: 'string',
              description: 'Language code.',
              enum: [...LANGUAGES],
              default: 'american_english',
            },
            speed: {
              type: 'number',
              description: 'Speech speed from 0.5 (slow) to 2.0 (fast).',
              minimum: 0.5,
              maximum: 2.0,
              default: 1.0,
            },
          },
          required: ['text'],
        },
      },
      {
        name: TOOL_NAMES.MULTI_VOICE,
        description:
          'Generate speech with multiple voices using bracket notation. Use [voice_name] to switch voices.',
        parameters: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: "Text with voice markers. Example: '[heart] Hello! [michael] Hi there!'",
            },
            language: {
              type: 'string',
              description: 'Language code for all voices.',
              enum: [...LANGUAGES],
              default: 'american_english',
            },
            speed: {
              type: 'number',
              description: 'Speech speed from 0.5 to 2.0.',
              minimum: 0.5,
              maximum: 2.0,
              default: 1.0,
            },
          },
          required: ['text'],
        },
      },
      {
        name: TOOL_NAMES.LIST_VOICES,
        description: 'Get a list of all available voices for text-to-speech generation.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: TOOL_NAMES.LIST_LANGUAGES,
        description: 'Get a list of all supported languages for text-to-speech generation.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ];
  }

  /**
   * Get tools in OpenAI function calling format
   */
  getOpenAITools(): Array<{ type: 'function'; function: FunctionSchema }> {
    return this.getFunctionSchemas().map((schema) => ({
      type: 'function' as const,
      function: schema,
    }));
  }

  // =========================================
  // UTILITY METHODS
  // =========================================

  /**
   * Save audio from result to file (Node.js only)
   */
  async saveAudio(result: TTSToolResult, outputPath: string): Promise<boolean> {
    if (!result.success || !result.audioBase64) {
      return false;
    }

    try {
      const fs = await import('fs');
      const audioBuffer = Buffer.from(result.audioBase64, 'base64');
      fs.writeFileSync(outputPath, audioBuffer);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get audio buffer from result
   */
  getAudioBuffer(result: TTSToolResult): Buffer | null {
    if (!result.success || !result.audioBase64) {
      return null;
    }
    return Buffer.from(result.audioBase64, 'base64');
  }

  /**
   * Get audio as Uint8Array (for browser compatibility)
   */
  getAudioUint8Array(result: TTSToolResult): Uint8Array | null {
    const buffer = this.getAudioBuffer(result);
    return buffer ? new Uint8Array(buffer) : null;
  }
}

/**
 * Create a LangVoice toolkit instance
 */
export function createLangVoiceToolkit(apiKey?: string): LangVoiceToolkit {
  return new LangVoiceToolkit({ apiKey });
}
