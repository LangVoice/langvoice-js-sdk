/**
 * LangChain tools for LangVoice TTS
 */

import { LangVoiceClient } from '../client';
import { TOOL_NAMES } from './types';

// ============================================
// Types
// ============================================

interface ToolInput {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

interface MultiVoiceInput {
  text: string;
  language?: string;
  speed?: number;
}

// ============================================
// Base Tool Class (Compatible with LangChain)
// ============================================

/**
 * Base class for LangVoice tools
 * Can be used standalone or with LangChain
 */
abstract class BaseLangVoiceTool {
  abstract name: string;
  abstract description: string;
  protected client: LangVoiceClient;
  protected outputFile?: string;

  constructor(options: { apiKey?: string; outputFile?: string } = {}) {
    this.client = new LangVoiceClient({ apiKey: options.apiKey });
    this.outputFile = options.outputFile;
  }

  abstract call(input: unknown): Promise<string>;

  /**
   * Make this tool compatible with LangChain
   */
  async invoke(input: unknown): Promise<string> {
    return this.call(input);
  }
}

// ============================================
// Tool Implementations
// ============================================

/**
 * LangChain-compatible tool for text-to-speech generation
 */
export class LangVoiceTTSTool extends BaseLangVoiceTool {
  name = TOOL_NAMES.TTS;
  description =
    'Convert text to natural-sounding speech audio using LangVoice TTS. ' +
    'Saves audio to output.mp3 and returns confirmation with duration.';

  constructor(options: { apiKey?: string; outputFile?: string } = {}) {
    super(options);
    this.outputFile = options.outputFile || 'output.mp3';
  }

  async call(input: ToolInput | string): Promise<string> {
    try {
      const params: ToolInput = typeof input === 'string' ? { text: input } : input;

      const response = await this.client.generate({
        text: params.text,
        voice: params.voice || 'heart',
        language: params.language || 'american_english',
        speed: params.speed || 1.0,
      });

      if (this.outputFile) {
        try {
          const fs = await import('fs');
          fs.writeFileSync(this.outputFile, response.audioData);
          return (
            `✅ Speech generated and saved to ${this.outputFile}! ` +
            `Duration: ${response.duration}s, ` +
            `Characters: ${response.charactersProcessed}`
          );
        } catch {
          return (
            `✅ Speech generated! Duration: ${response.duration}s. ` +
            `Audio (base64): ${response.toBase64().substring(0, 100)}...`
          );
        }
      }

      return (
        `✅ Speech generated! Duration: ${response.duration}s. ` +
        `Audio (base64): ${response.toBase64().substring(0, 100)}...`
      );
    } catch (error) {
      return `❌ Error generating speech: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * LangChain-compatible tool for multi-voice speech generation
 */
export class LangVoiceMultiVoiceTool extends BaseLangVoiceTool {
  name = TOOL_NAMES.MULTI_VOICE;
  description =
    'Generate speech with multiple voices using bracket notation. ' +
    "Use [voice_name] to switch voices. Example: '[heart] Hello! [michael] Hi there!'";

  async call(input: MultiVoiceInput | string): Promise<string> {
    try {
      const params: MultiVoiceInput = typeof input === 'string' ? { text: input } : input;

      const response = await this.client.generateMultiVoice({
        text: params.text,
        language: params.language || 'american_english',
        speed: params.speed || 1.0,
      });

      if (this.outputFile) {
        try {
          const fs = await import('fs');
          fs.writeFileSync(this.outputFile, response.audioData);
          return (
            `✅ Multi-voice speech generated and saved to ${this.outputFile}! ` +
            `Duration: ${response.duration}s`
          );
        } catch {
          return (
            `✅ Multi-voice speech generated! Duration: ${response.duration}s. ` +
            `Audio available in base64 format.`
          );
        }
      }

      return (
        `✅ Multi-voice speech generated! Duration: ${response.duration}s. ` +
        `Audio available in base64 format.`
      );
    } catch (error) {
      return `❌ Error generating multi-voice speech: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * LangChain-compatible tool for listing voices
 */
export class LangVoiceVoicesTool extends BaseLangVoiceTool {
  name = TOOL_NAMES.LIST_VOICES;
  description = 'Get a list of all available voices for text-to-speech generation.';

  async call(): Promise<string> {
    try {
      const voices = await this.client.listVoices();
      const voiceList = voices.map((v) => `${v.id} (${v.name})`).join(', ');
      return `Available voices: ${voiceList}`;
    } catch (error) {
      return `Error listing voices: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * LangChain-compatible tool for listing languages
 */
export class LangVoiceLanguagesTool extends BaseLangVoiceTool {
  name = TOOL_NAMES.LIST_LANGUAGES;
  description = 'Get a list of all supported languages for text-to-speech generation.';

  async call(): Promise<string> {
    try {
      const languages = await this.client.listLanguages();
      const langList = languages.map((l) => `${l.id} (${l.name})`).join(', ');
      return `Supported languages: ${langList}`;
    } catch (error) {
      return `Error listing languages: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

// ============================================
// Toolkit Class
// ============================================

/**
 * Convenience class for using LangVoice with LangChain
 *
 * @example
 * ```typescript
 * import { LangVoiceLangChainToolkit } from 'langvoice-sdk/tools';
 *
 * const toolkit = new LangVoiceLangChainToolkit({ apiKey: 'your-langvoice-key' });
 * const tools = toolkit.getTools();
 *
 * // Use with LangChain agent
 * ```
 */
export class LangVoiceLangChainToolkit {
  private readonly apiKey?: string;

  constructor(options: { apiKey?: string } = {}) {
    this.apiKey = options.apiKey;
  }

  /**
   * Get all LangVoice tools
   */
  getTools(): BaseLangVoiceTool[] {
    return [
      new LangVoiceTTSTool({ apiKey: this.apiKey }),
      new LangVoiceMultiVoiceTool({ apiKey: this.apiKey }),
      new LangVoiceVoicesTool({ apiKey: this.apiKey }),
      new LangVoiceLanguagesTool({ apiKey: this.apiKey }),
    ];
  }

  /**
   * Get the text-to-speech tool
   */
  getTTSTool(outputFile?: string): LangVoiceTTSTool {
    return new LangVoiceTTSTool({ apiKey: this.apiKey, outputFile });
  }

  /**
   * Get the multi-voice tool
   */
  getMultiVoiceTool(outputFile?: string): LangVoiceMultiVoiceTool {
    return new LangVoiceMultiVoiceTool({ apiKey: this.apiKey, outputFile });
  }

  /**
   * Get the list voices tool
   */
  getVoicesTool(): LangVoiceVoicesTool {
    return new LangVoiceVoicesTool({ apiKey: this.apiKey });
  }

  /**
   * Get the list languages tool
   */
  getLanguagesTool(): LangVoiceLanguagesTool {
    return new LangVoiceLanguagesTool({ apiKey: this.apiKey });
  }
}

/**
 * Get all LangChain tools
 */
export function getAllLangChainTools(apiKey?: string): BaseLangVoiceTool[] {
  return new LangVoiceLangChainToolkit({ apiKey }).getTools();
}
