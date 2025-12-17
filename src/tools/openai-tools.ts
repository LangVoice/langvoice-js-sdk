/**
 * OpenAI function calling tools for LangVoice
 */

import { LangVoiceClient } from '../client';
import {
  TOOL_NAMES,
  ALL_VOICES,
  LANGUAGES,
  type OpenAIToolDefinition as BaseOpenAIToolDefinition,
  type OpenAIToolCall as BaseOpenAIToolCall,
} from './types';

// ============================================
// Types (Re-export for backwards compatibility)
// ============================================

export type OpenAIToolDefinition = BaseOpenAIToolDefinition;
export type OpenAIToolCall = BaseOpenAIToolCall;

export interface ToolCallResult {
  success: boolean;
  audioBase64?: string;
  duration?: number;
  charactersProcessed?: number;
  voices?: Array<{ id: string; name: string }>;
  languages?: Array<{ id: string; name: string }>;
  error?: string;
}

// ============================================
// Tool Definitions
// ============================================

export const LANGVOICE_TTS_TOOL: OpenAIToolDefinition = {
  type: 'function',
  function: {
    name: TOOL_NAMES.TTS,
    description:
      'Convert text to natural-sounding speech audio using LangVoice TTS API. Returns base64-encoded MP3 audio.',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to convert to speech. Maximum 5000 characters.',
        },
        voice: {
          type: 'string',
          description: 'Voice ID to use for speech generation.',
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
      },
      required: ['text'],
    },
  },
};

export const LANGVOICE_MULTI_VOICE_TOOL: OpenAIToolDefinition = {
  type: 'function',
  function: {
    name: TOOL_NAMES.MULTI_VOICE,
    description:
      'Generate speech with multiple voices using bracket notation. Use [voice_name] to switch voices in the text.',
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
};

export const LANGVOICE_LIST_VOICES_TOOL: OpenAIToolDefinition = {
  type: 'function',
  function: {
    name: TOOL_NAMES.LIST_VOICES,
    description: 'Get a list of all available voices for text-to-speech generation.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

export const LANGVOICE_LIST_LANGUAGES_TOOL: OpenAIToolDefinition = {
  type: 'function',
  function: {
    name: TOOL_NAMES.LIST_LANGUAGES,
    description: 'Get a list of all supported languages for text-to-speech generation.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

// ============================================
// Functions
// ============================================

/**
 * Get all LangVoice tools formatted for OpenAI function calling
 */
export function getOpenAITools(): OpenAIToolDefinition[] {
  return [
    LANGVOICE_TTS_TOOL,
    LANGVOICE_MULTI_VOICE_TOOL,
    LANGVOICE_LIST_VOICES_TOOL,
    LANGVOICE_LIST_LANGUAGES_TOOL,
  ];
}

/**
 * Handle an OpenAI tool call for LangVoice functions
 */
export async function handleOpenAIToolCall(
  toolName: string,
  args: Record<string, unknown>,
  apiKey?: string
): Promise<string> {
  const client = new LangVoiceClient({ apiKey });

  try {
    let result: ToolCallResult;

    switch (toolName) {
      case TOOL_NAMES.TTS: {
        const response = await client.generate({
          text: args.text as string,
          voice: (args.voice as string) || 'heart',
          language: (args.language as string) || 'american_english',
          speed: (args.speed as number) || 1.0,
        });
        result = {
          success: true,
          audioBase64: response.toBase64(),
          duration: response.duration,
          charactersProcessed: response.charactersProcessed,
        };
        break;
      }

      case TOOL_NAMES.MULTI_VOICE: {
        const response = await client.generateMultiVoice({
          text: args.text as string,
          language: (args.language as string) || 'american_english',
          speed: (args.speed as number) || 1.0,
        });
        result = {
          success: true,
          audioBase64: response.toBase64(),
          duration: response.duration,
        };
        break;
      }

      case TOOL_NAMES.LIST_VOICES: {
        const voices = await client.listVoices();
        result = {
          success: true,
          voices: voices.map((v) => ({ id: v.id, name: v.name })),
        };
        break;
      }

      case TOOL_NAMES.LIST_LANGUAGES: {
        const languages = await client.listLanguages();
        result = {
          success: true,
          languages: languages.map((l) => ({ id: l.id, name: l.name })),
        };
        break;
      }

      default:
        result = { success: false, error: `Unknown tool: ${toolName}` };
    }

    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ============================================
// LangVoiceOpenAITools Class
// ============================================

/**
 * Helper class for integrating LangVoice with OpenAI function calling
 *
 * @example
 * ```typescript
 * import OpenAI from 'openai';
 * import { LangVoiceOpenAITools } from 'langvoice-sdk/tools';
 *
 * const openai = new OpenAI();
 * const langvoice = new LangVoiceOpenAITools({ apiKey: 'your-langvoice-key' });
 *
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Generate speech saying hello' }],
 *   tools: langvoice.getTools(),
 * });
 *
 * if (response.choices[0].message.tool_calls) {
 *   for (const toolCall of response.choices[0].message.tool_calls) {
 *     const result = await langvoice.handleCall(toolCall);
 *     console.log(result);
 *   }
 * }
 * ```
 */
export class LangVoiceOpenAITools {
  private readonly client: LangVoiceClient;

  constructor(options: { apiKey?: string } = {}) {
    this.client = new LangVoiceClient(options);
  }

  /**
   * Get tool definitions for OpenAI
   */
  getTools(): OpenAIToolDefinition[] {
    return getOpenAITools();
  }

  /**
   * Handle an OpenAI tool call object
   */
  async handleCall(toolCall: OpenAIToolCall): Promise<ToolCallResult> {
    const args = JSON.parse(toolCall.function.arguments);
    const resultJson = await handleOpenAIToolCall(
      toolCall.function.name,
      args,
      this.client.getApiKey()
    );
    return JSON.parse(resultJson);
  }

  /**
   * Save audio from a tool call result to a file (Node.js only)
   */
  async saveAudioFromResult(
    result: ToolCallResult,
    outputPath: string
  ): Promise<boolean> {
    if (!result.success || !result.audioBase64) {
      return false;
    }

    try {
      // Dynamic import for Node.js fs module
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
  getAudioBuffer(result: ToolCallResult): Buffer | null {
    if (!result.success || !result.audioBase64) {
      return null;
    }
    return Buffer.from(result.audioBase64, 'base64');
  }
}
