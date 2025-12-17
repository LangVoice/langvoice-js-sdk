/**
 * Data models for LangVoice SDK
 */

// ============================================
// Type Definitions
// ============================================

export interface VoiceData {
  id: string;
  name: string;
  gender?: string;
  language?: string;
  description?: string;
}

export interface LanguageData {
  id: string;
  name: string;
  voices?: string[];
}

export interface GenerateRequestData {
  text: string;
  voice: string;
  language: string;
  speed: number;
}

export interface MultiVoiceRequestData {
  text: string;
  language: string;
  speed: number;
}

export interface GenerateResponseData {
  audioData: Buffer | ArrayBuffer;
  duration?: number;
  generationTime?: number;
  charactersProcessed?: number;
}

// ============================================
// Classes
// ============================================

/**
 * Voice model
 */
export class Voice implements VoiceData {
  public readonly id: string;
  public readonly name: string;
  public readonly gender?: string;
  public readonly language?: string;
  public readonly description?: string;

  constructor(data: VoiceData) {
    this.id = data.id;
    this.name = data.name;
    this.gender = data.gender;
    this.language = data.language;
    this.description = data.description;
  }

  toJSON(): VoiceData {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      language: this.language,
      description: this.description,
    };
  }
}

/**
 * Language model
 */
export class Language implements LanguageData {
  public readonly id: string;
  public readonly name: string;
  public readonly voices?: string[];

  constructor(data: LanguageData) {
    this.id = data.id;
    this.name = data.name;
    this.voices = data.voices;
  }

  toJSON(): LanguageData {
    return {
      id: this.id,
      name: this.name,
      voices: this.voices,
    };
  }
}

/**
 * Generate request model
 */
export class GenerateRequest implements GenerateRequestData {
  public readonly text: string;
  public readonly voice: string;
  public readonly language: string;
  public readonly speed: number;

  constructor(data: Partial<GenerateRequestData> & { text: string }) {
    if (!data.text || data.text.length === 0) {
      throw new Error('Text is required');
    }
    if (data.text.length > 5000) {
      throw new Error('Text must be 5000 characters or less');
    }

    this.text = data.text;
    this.voice = data.voice || 'heart';
    this.language = data.language || 'american_english';
    this.speed = data.speed ?? 1.0;

    if (this.speed < 0.5 || this.speed > 2.0) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
  }

  toJSON(): GenerateRequestData {
    return {
      text: this.text,
      voice: this.voice,
      language: this.language,
      speed: this.speed,
    };
  }
}

/**
 * Multi-voice request model
 */
export class MultiVoiceRequest implements MultiVoiceRequestData {
  public readonly text: string;
  public readonly language: string;
  public readonly speed: number;

  constructor(data: Partial<MultiVoiceRequestData> & { text: string }) {
    if (!data.text || data.text.length === 0) {
      throw new Error('Text is required');
    }
    if (data.text.length > 5000) {
      throw new Error('Text must be 5000 characters or less');
    }

    this.text = data.text;
    this.language = data.language || 'american_english';
    this.speed = data.speed ?? 1.0;

    if (this.speed < 0.5 || this.speed > 2.0) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
  }

  toJSON(): MultiVoiceRequestData {
    return {
      text: this.text,
      language: this.language,
      speed: this.speed,
    };
  }
}

/**
 * Generate response model
 */
export class GenerateResponse implements GenerateResponseData {
  public readonly audioData: Buffer;
  public readonly duration?: number;
  public readonly generationTime?: number;
  public readonly charactersProcessed?: number;

  constructor(data: GenerateResponseData) {
    this.audioData = Buffer.isBuffer(data.audioData)
      ? data.audioData
      : Buffer.from(data.audioData);
    this.duration = data.duration;
    this.generationTime = data.generationTime;
    this.charactersProcessed = data.charactersProcessed;
  }

  /**
   * Get audio as base64 string
   */
  toBase64(): string {
    return this.audioData.toString('base64');
  }

  /**
   * Get audio as Uint8Array (for browser compatibility)
   */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this.audioData);
  }

  /**
   * Get audio as ArrayBuffer (for browser compatibility)
   */
  toArrayBuffer(): ArrayBuffer {
    const buffer = this.audioData.buffer.slice(
      this.audioData.byteOffset,
      this.audioData.byteOffset + this.audioData.byteLength
    );
    return buffer as ArrayBuffer;
  }
}

/**
 * Voices response model
 */
export class VoicesResponse {
  public readonly voices: Voice[];

  constructor(data: { voices: VoiceData[] }) {
    this.voices = data.voices.map((v) => new Voice(v));
  }
}

/**
 * Languages response model
 */
export class LanguagesResponse {
  public readonly languages: Language[];

  constructor(data: { languages: LanguageData[] }) {
    this.languages = data.languages.map((l) => new Language(l));
  }
}

// ============================================
// Constants
// ============================================

export const AMERICAN_VOICES = [
  'heart',
  'bella',
  'nicole',
  'sarah',
  'nova',
  'sky',
  'jessica',
  'river',
  'michael',
  'fenrir',
  'eric',
  'liam',
  'onyx',
  'adam',
] as const;

export const BRITISH_VOICES = [
  'emma',
  'isabella',
  'alice',
  'lily',
  'george',
  'fable',
  'lewis',
  'daniel',
] as const;

export const ALL_VOICES = [...AMERICAN_VOICES, ...BRITISH_VOICES] as const;

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
