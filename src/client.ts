/**
 * Main LangVoice API client
 */

import {
  Voice,
  Language,
  GenerateRequest,
  MultiVoiceRequest,
  VoiceCloningRequest,
  GenerateResponse,
  VoicesResponse,
  LanguagesResponse,
  AMERICAN_VOICES,
  BRITISH_VOICES,
  ALL_VOICES,
  LANGUAGES,
} from './models';

import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  APIError,
} from './exceptions';

// ============================================
// Types
// ============================================

export interface LangVoiceClientOptions {
  /** API key for authentication */
  apiKey?: string;
  /** Base URL for the API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface GenerateOptions {
  /** Text to convert to speech (max 5000 characters) */
  text: string;
  /** Voice ID (e.g., 'heart', 'michael') */
  voice?: string;
  /** Language code (e.g., 'american_english') */
  language?: string;
  /** Speech speed from 0.5 to 2.0 */
  speed?: number;
}

export interface MultiVoiceOptions {
  /** Text with [voice] markers */
  text: string;
  /** Language code for all voices */
  language?: string;
  /** Speech speed from 0.5 to 2.0 */
  speed?: number;
}

export interface VoiceCloningOptions {
  /** Text to convert to speech (max 5000 characters) */
  text: string;
  /** Base64 encoded voice sample audio */
  voiceSampleBase64: string;
  /** Speech speed from 0.5 to 2.0 */
  speed?: number;
}

// ============================================
// Client
// ============================================

/**
 * LangVoice API client for text-to-speech generation
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
export class LangVoiceClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /** Available American voices */
  static readonly AMERICAN_VOICES = AMERICAN_VOICES;
  /** Available British voices */
  static readonly BRITISH_VOICES = BRITISH_VOICES;
  /** All available voices */
  static readonly ALL_VOICES = ALL_VOICES;
  /** Supported languages */
  static readonly LANGUAGES = LANGUAGES;

  constructor(options: LangVoiceClientOptions = {}) {
    this.apiKey = options.apiKey || this.getEnvApiKey();

    if (!this.apiKey) {
      throw new AuthenticationError(
        'API key is required. Pass apiKey in options or set LANGVOICE_API_KEY environment variable.'
      );
    }

    this.baseUrl = options.baseUrl || 'https://www.langvoice.pro/api';
    this.timeout = options.timeout || 60000;
  }

  /**
   * Get API key from environment variable
   */
  private getEnvApiKey(): string {
    // Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env.LANGVOICE_API_KEY || '';
    }
    return '';
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ data: T; headers: Headers }> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      await this.handleResponseErrors(response);

      return {
        data: (await response.json()) as T,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }

      throw error;
    }
  }

  /**
   * Make HTTP request for binary data
   */
  private async requestBinary(
    method: 'POST',
    endpoint: string,
    body: object
  ): Promise<{ data: ArrayBuffer; headers: Headers }> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      await this.handleResponseErrors(response);

      return {
        data: await response.arrayBuffer(),
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }

      throw error;
    }
  }

  /**
   * Handle API response errors
   */
  private async handleResponseErrors(response: Response): Promise<void> {
    if (response.ok) return;

    let errorMessage: string;

    try {
      const errorData = (await response.json()) as { error?: string };
      errorMessage = errorData.error || `API error: ${response.status}`;
    } catch {
      errorMessage = response.statusText || `API error: ${response.status}`;
    }

    switch (response.status) {
      case 401:
        throw new AuthenticationError(errorMessage);
      case 429:
        throw new RateLimitError(errorMessage);
      case 400:
        throw new ValidationError(errorMessage);
      default:
        throw new APIError(errorMessage, response.status);
    }
  }

  /**
   * Parse float header value
   */
  private parseFloatHeader(value: string | null): number | undefined {
    if (!value) return undefined;
    const parsed = parseFloat(value.replace('s', ''));
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Parse int header value
   */
  private parseIntHeader(value: string | null): number | undefined {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Generate speech from text
   *
   * @param options - Generation options
   * @returns GenerateResponse with audio data and metadata
   *
   * @example
   * ```typescript
   * const response = await client.generate({
   *   text: 'Hello world!',
   *   voice: 'heart',
   *   language: 'american_english',
   *   speed: 1.0,
   * });
   *
   * console.log(`Duration: ${response.duration}s`);
   * ```
   */
  async generate(options: GenerateOptions): Promise<GenerateResponse> {
    const request = new GenerateRequest({
      text: options.text,
      voice: options.voice,
      language: options.language,
      speed: options.speed,
    });

    const { data, headers } = await this.requestBinary(
      'POST',
      '/tts/generate',
      request.toJSON()
    );

    return new GenerateResponse({
      audioData: data,
      duration: this.parseFloatHeader(headers.get('X-Audio-Duration')),
      generationTime: this.parseFloatHeader(headers.get('X-Generation-Time')),
      charactersProcessed: this.parseIntHeader(headers.get('X-Characters-Processed')),
    });
  }

  /**
   * Generate speech with multiple voices
   *
   * @param options - Multi-voice options
   * @returns GenerateResponse with audio data and metadata
   *
   * @example
   * ```typescript
   * const response = await client.generateMultiVoice({
   *   text: '[heart] Hello! [michael] Hi there!',
   *   language: 'american_english',
   * });
   * ```
   */
  async generateMultiVoice(options: MultiVoiceOptions): Promise<GenerateResponse> {
    const request = new MultiVoiceRequest({
      text: options.text,
      language: options.language,
      speed: options.speed,
    });

    const { data, headers } = await this.requestBinary(
      'POST',
      '/tts/multi-voice-text',
      request.toJSON()
    );

    return new GenerateResponse({
      audioData: data,
      duration: this.parseFloatHeader(headers.get('X-Audio-Duration')),
      generationTime: this.parseFloatHeader(headers.get('X-Generation-Time')),
      charactersProcessed: this.parseIntHeader(headers.get('X-Characters-Processed')),
    });
  }

  /**
   * Generate speech using a cloned voice from provided audio sample
   *
   * @param options - Voice cloning options
   * @returns GenerateResponse with audio data and metadata
   *
   * @example
   * ```typescript
   * // Convert audio file to base64 first
   * const fs = require('fs');
   * const audioBuffer = fs.readFileSync('voice_sample.wav');
   * const base64Audio = audioBuffer.toString('base64');
   *
   * const response = await client.generateCloned({
   *   text: 'Hello, this is my cloned voice!',
   *   voiceSampleBase64: base64Audio,
   *   speed: 1.0,
   * });
   * ```
   */
  async generateCloned(options: VoiceCloningOptions): Promise<GenerateResponse> {
    const request = new VoiceCloningRequest({
      text: options.text,
      voice_sample_base64: options.voiceSampleBase64,
      speed: options.speed,
    });

    const { data, headers } = await this.requestBinary(
      'POST',
      '/tts/generate-cloned',
      request.toJSON()
    );

    return new GenerateResponse({
      audioData: data,
      duration: this.parseFloatHeader(headers.get('X-Audio-Duration')),
      generationTime: this.parseFloatHeader(headers.get('X-Generation-Time')),
      charactersProcessed: this.parseIntHeader(headers.get('X-Characters-Processed')),
    });
  }

  /**
   * Get all available voices
   *
   * @returns Array of Voice objects
   *
   * @example
   * ```typescript
   * const voices = await client.listVoices();
   * voices.forEach(v => console.log(`${v.id}: ${v.name}`));
   * ```
   */
  async listVoices(): Promise<Voice[]> {
    const { data } = await this.request<{ voices: Voice[] }>('GET', '/tts/voices');
    return new VoicesResponse(data).voices;
  }

  /**
   * Get all supported languages
   *
   * @returns Array of Language objects
   *
   * @example
   * ```typescript
   * const languages = await client.listLanguages();
   * languages.forEach(l => console.log(`${l.id}: ${l.name}`));
   * ```
   */
  async listLanguages(): Promise<Language[]> {
    const { data } = await this.request<{ languages: Language[] }>('GET', '/tts/languages');
    return new LanguagesResponse(data).languages;
  }

  /**
   * Simple method to convert text to speech and return audio buffer
   *
   * @param text - Text to convert
   * @param voice - Voice ID
   * @param language - Language code
   * @param speed - Speech speed
   * @returns Audio data as Buffer
   *
   * @example
   * ```typescript
   * const audioBuffer = await client.textToSpeech('Hello!', 'heart');
   * ```
   */
  async textToSpeech(
    text: string,
    voice: string = 'heart',
    language: string = 'american_english',
    speed: number = 1.0
  ): Promise<Buffer> {
    const response = await this.generate({ text, voice, language, speed });
    return response.audioData;
  }

  /**
   * Get the API key (useful for passing to tools)
   */
  getApiKey(): string {
    return this.apiKey;
  }
}
