/**
 * AutoGen tools for LangVoice TTS
 *
 * Provides integration with Microsoft AutoGen framework for multi-agent systems.
 *
 * @example
 * ```typescript
 * import { LangVoiceAutoGenTools } from 'langvoice-sdk/tools';
 *
 * const tools = new LangVoiceAutoGenTools({ apiKey: 'your-api-key' });
 *
 * // Get function definitions for AutoGen agent
 * const functionDefs = tools.getFunctionDefinitions();
 *
 * // Register with AutoGen agent
 * const functionMap = tools.getFunctionMap();
 * ```
 */

import { LangVoiceClient } from '../client';
import {
  type TTSResult,
  type TTSInput,
  type MultiVoiceInput,
  type AutoGenFunctionDef,
  type AutoGenFunctionCall,
  TOOL_NAMES,
  ALL_VOICES,
  LANGUAGES,
} from './types';

// ============================================
// Types
// ============================================

export interface AutoGenToolOptions {
  /** LangVoice API key */
  apiKey?: string;
  /** Default output file path for audio */
  outputFile?: string;
  /** Whether to automatically save audio files */
  autoSave?: boolean;
}

export type FunctionHandler = (args: Record<string, unknown>) => Promise<string>;

export interface FunctionMap {
  [key: string]: FunctionHandler;
}

// ============================================
// Function Definitions
// ============================================

const TTS_FUNCTION_DEF: AutoGenFunctionDef = {
  name: TOOL_NAMES.TTS,
  description:
    'Convert text to natural-sounding speech audio using LangVoice TTS API. ' +
    'Returns information about the generated audio including duration and a success status. ' +
    'The audio is saved to a file if outputFile is configured.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The text to convert to speech. Maximum 5000 characters.',
      },
      voice: {
        type: 'string',
        description: 'Voice ID to use. Available voices include: heart, bella, michael, emma, etc.',
        enum: [...ALL_VOICES],
        default: 'heart',
      },
      language: {
        type: 'string',
        description: 'Language code for the speech.',
        enum: [...LANGUAGES],
        default: 'american_english',
      },
      speed: {
        type: 'number',
        description: 'Speech speed from 0.5 (slow) to 2.0 (fast). Default is 1.0.',
        minimum: 0.5,
        maximum: 2.0,
        default: 1.0,
      },
      output_file: {
        type: 'string',
        description: 'Optional file path to save the audio. Defaults to output.mp3.',
      },
    },
    required: ['text'],
  },
};

const MULTI_VOICE_FUNCTION_DEF: AutoGenFunctionDef = {
  name: TOOL_NAMES.MULTI_VOICE,
  description:
    'Generate speech with multiple voices in a single audio file. ' +
    "Use bracket notation to switch voices: '[heart] Hello! [michael] Hi there!' " +
    'All voices will use the same language and speed settings.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description:
          "Text with voice markers. Use [voice_name] to switch voices. " +
          "Example: '[heart] Welcome to the show! [michael] Thanks for having me!'",
      },
      language: {
        type: 'string',
        description: 'Language code for all voices in the audio.',
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
      output_file: {
        type: 'string',
        description: 'Optional file path to save the audio.',
      },
    },
    required: ['text'],
  },
};

const LIST_VOICES_FUNCTION_DEF: AutoGenFunctionDef = {
  name: TOOL_NAMES.LIST_VOICES,
  description:
    'Get a list of all available voices for text-to-speech generation. ' +
    'Returns voice IDs and names that can be used with the TTS functions.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

const LIST_LANGUAGES_FUNCTION_DEF: AutoGenFunctionDef = {
  name: TOOL_NAMES.LIST_LANGUAGES,
  description:
    'Get a list of all supported languages for text-to-speech generation. ' +
    'Returns language codes and names.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

// ============================================
// LangVoiceAutoGenTools Class
// ============================================

/**
 * AutoGen integration for LangVoice TTS
 *
 * Provides function definitions and handlers compatible with Microsoft AutoGen
 * multi-agent framework.
 *
 * @example
 * ```typescript
 * import { LangVoiceAutoGenTools } from 'langvoice-sdk/tools';
 *
 * const langvoiceTools = new LangVoiceAutoGenTools({
 *   apiKey: 'your-api-key',
 *   autoSave: true,
 *   outputFile: 'speech.mp3',
 * });
 *
 * // Get function definitions for the agent config
 * const functions = langvoiceTools.getFunctionDefinitions();
 *
 * // Get the function map for registration
 * const functionMap = langvoiceTools.getFunctionMap();
 *
 * // Or handle calls manually
 * const result = await langvoiceTools.handleFunctionCall({
 *   name: 'langvoice_text_to_speech',
 *   arguments: { text: 'Hello world!' },
 * });
 * ```
 */
export class LangVoiceAutoGenTools {
  private readonly client: LangVoiceClient;
  private readonly outputFile: string;
  private readonly autoSave: boolean;

  constructor(options: AutoGenToolOptions = {}) {
    this.client = new LangVoiceClient({ apiKey: options.apiKey });
    this.outputFile = options.outputFile || 'output.mp3';
    this.autoSave = options.autoSave ?? true;
  }

  /**
   * Get the underlying LangVoice client
   */
  getClient(): LangVoiceClient {
    return this.client;
  }

  // =========================================
  // FUNCTION DEFINITIONS
  // =========================================

  /**
   * Get all function definitions for AutoGen agent configuration
   */
  getFunctionDefinitions(): AutoGenFunctionDef[] {
    return [
      TTS_FUNCTION_DEF,
      MULTI_VOICE_FUNCTION_DEF,
      LIST_VOICES_FUNCTION_DEF,
      LIST_LANGUAGES_FUNCTION_DEF,
    ];
  }

  /**
   * Get function definition by name
   */
  getFunctionDefinition(name: string): AutoGenFunctionDef | undefined {
    return this.getFunctionDefinitions().find((f) => f.name === name);
  }

  /**
   * Get the TTS function definition only
   */
  getTTSFunctionDef(): AutoGenFunctionDef {
    return TTS_FUNCTION_DEF;
  }

  /**
   * Get the multi-voice function definition only
   */
  getMultiVoiceFunctionDef(): AutoGenFunctionDef {
    return MULTI_VOICE_FUNCTION_DEF;
  }

  // =========================================
  // FUNCTION MAP (for AutoGen registration)
  // =========================================

  /**
   * Get a map of function names to handlers
   *
   * Use this to register functions with AutoGen agents:
   * ```typescript
   * const functionMap = tools.getFunctionMap();
   * // Register with AutoGen agent
   * ```
   */
  getFunctionMap(): FunctionMap {
    return {
      [TOOL_NAMES.TTS]: (args) => this.textToSpeechHandler(args),
      [TOOL_NAMES.MULTI_VOICE]: (args) => this.multiVoiceHandler(args),
      [TOOL_NAMES.LIST_VOICES]: () => this.listVoicesHandler(),
      [TOOL_NAMES.LIST_LANGUAGES]: () => this.listLanguagesHandler(),
    };
  }

  // =========================================
  // FUNCTION HANDLERS
  // =========================================

  /**
   * Handle text-to-speech function call
   */
  private async textToSpeechHandler(args: Record<string, unknown>): Promise<string> {
    try {
      const response = await this.client.generate({
        text: args.text as string,
        voice: (args.voice as string) || 'heart',
        language: (args.language as string) || 'american_english',
        speed: (args.speed as number) || 1.0,
      });

      const outputPath = (args.output_file as string) || this.outputFile;

      if (this.autoSave) {
        try {
          const fs = await import('fs');
          fs.writeFileSync(outputPath, response.audioData);
          return JSON.stringify({
            success: true,
            message: `Speech generated and saved to ${outputPath}`,
            duration: response.duration,
            charactersProcessed: response.charactersProcessed,
            outputFile: outputPath,
          });
        } catch (fsError) {
          return JSON.stringify({
            success: true,
            message: 'Speech generated (file save not available in this environment)',
            duration: response.duration,
            charactersProcessed: response.charactersProcessed,
            audioBase64Preview: response.toBase64().substring(0, 100) + '...',
          });
        }
      }

      return JSON.stringify({
        success: true,
        duration: response.duration,
        charactersProcessed: response.charactersProcessed,
        audioBase64: response.toBase64(),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle multi-voice function call
   */
  private async multiVoiceHandler(args: Record<string, unknown>): Promise<string> {
    try {
      const response = await this.client.generateMultiVoice({
        text: args.text as string,
        language: (args.language as string) || 'american_english',
        speed: (args.speed as number) || 1.0,
      });

      const outputPath = (args.output_file as string) || this.outputFile;

      if (this.autoSave) {
        try {
          const fs = await import('fs');
          fs.writeFileSync(outputPath, response.audioData);
          return JSON.stringify({
            success: true,
            message: `Multi-voice speech generated and saved to ${outputPath}`,
            duration: response.duration,
            outputFile: outputPath,
          });
        } catch {
          return JSON.stringify({
            success: true,
            message: 'Multi-voice speech generated',
            duration: response.duration,
          });
        }
      }

      return JSON.stringify({
        success: true,
        duration: response.duration,
        audioBase64: response.toBase64(),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle list voices function call
   */
  private async listVoicesHandler(): Promise<string> {
    try {
      const voices = await this.client.listVoices();
      return JSON.stringify({
        success: true,
        voices: voices.map((v) => ({ id: v.id, name: v.name })),
        count: voices.length,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle list languages function call
   */
  private async listLanguagesHandler(): Promise<string> {
    try {
      const languages = await this.client.listLanguages();
      return JSON.stringify({
        success: true,
        languages: languages.map((l) => ({ id: l.id, name: l.name })),
        count: languages.length,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // =========================================
  // GENERIC FUNCTION CALL HANDLER
  // =========================================

  /**
   * Handle a function call from AutoGen
   *
   * @param call - The function call object
   * @returns JSON string result
   */
  async handleFunctionCall(call: AutoGenFunctionCall): Promise<string> {
    const args =
      typeof call.arguments === 'string'
        ? JSON.parse(call.arguments)
        : call.arguments;

    const functionMap = this.getFunctionMap();
    const handler = functionMap[call.name];

    if (!handler) {
      return JSON.stringify({
        success: false,
        error: `Unknown function: ${call.name}`,
      });
    }

    return handler(args);
  }

  // =========================================
  // DIRECT METHODS
  // =========================================

  /**
   * Generate speech directly (not as a tool call)
   */
  async generateSpeech(input: TTSInput): Promise<TTSResult> {
    try {
      const response = await this.client.generate({
        text: input.text,
        voice: input.voice || 'heart',
        language: input.language || 'american_english',
        speed: input.speed || 1.0,
      });

      return {
        success: true,
        audioBase64: response.toBase64(),
        audioBuffer: response.audioData,
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
   * Generate multi-voice speech directly
   */
  async generateMultiVoice(input: MultiVoiceInput): Promise<TTSResult> {
    try {
      const response = await this.client.generateMultiVoice({
        text: input.text,
        language: input.language || 'american_english',
        speed: input.speed || 1.0,
      });

      return {
        success: true,
        audioBase64: response.toBase64(),
        audioBuffer: response.audioData,
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
   * Save audio result to file
   */
  async saveAudio(result: TTSResult, outputPath?: string): Promise<boolean> {
    if (!result.success || !result.audioBase64) {
      return false;
    }

    try {
      const fs = await import('fs');
      const audioBuffer = Buffer.from(result.audioBase64, 'base64');
      fs.writeFileSync(outputPath || this.outputFile, audioBuffer);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create LangVoice AutoGen tools instance
 */
export function createAutoGenTools(options?: AutoGenToolOptions): LangVoiceAutoGenTools {
  return new LangVoiceAutoGenTools(options);
}

/**
 * Get function definitions for AutoGen (without creating full tools instance)
 */
export function getAutoGenFunctionDefinitions(): AutoGenFunctionDef[] {
  return [
    TTS_FUNCTION_DEF,
    MULTI_VOICE_FUNCTION_DEF,
    LIST_VOICES_FUNCTION_DEF,
    LIST_LANGUAGES_FUNCTION_DEF,
  ];
}
