/**
 * Tests for LangVoice SDK
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LangVoiceClient } from '../src/client';
import { LangVoiceToolkit } from '../src/tools/generic-tools';
import { AuthenticationError, ValidationError } from '../src/exceptions';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LangVoiceClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw AuthenticationError when no API key provided', () => {
      // Clear env
      const originalEnv = process.env.LANGVOICE_API_KEY;
      delete process.env.LANGVOICE_API_KEY;

      expect(() => new LangVoiceClient()).toThrow(AuthenticationError);

      // Restore
      if (originalEnv) {
        process.env.LANGVOICE_API_KEY = originalEnv;
      }
    });

    it('should create client with API key', () => {
      const client = new LangVoiceClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
    });

    it('should use default base URL', () => {
      const client = new LangVoiceClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
    });
  });

  describe('generate', () => {
    it('should generate speech successfully', async () => {
      const mockAudioData = new ArrayBuffer(100);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioData),
        headers: new Headers({
          'X-Audio-Duration': '2.5s',
          'X-Characters-Processed': '100',
        }),
      });

      const client = new LangVoiceClient({ apiKey: 'test-key' });
      const response = await client.generate({
        text: 'Hello world',
        voice: 'heart',
      });

      expect(response.audioData).toBeDefined();
      expect(response.duration).toBe(2.5);
      expect(response.charactersProcessed).toBe(100);
    });

    it('should throw ValidationError for empty text', async () => {
      const client = new LangVoiceClient({ apiKey: 'test-key' });

      await expect(
        client.generate({ text: '' })
      ).rejects.toThrow('Text is required');
    });

    it('should throw ValidationError for text too long', async () => {
      const client = new LangVoiceClient({ apiKey: 'test-key' });

      await expect(
        client.generate({ text: 'a'.repeat(5001) })
      ).rejects.toThrow('Text must be 5000 characters or less');
    });
  });

  describe('listVoices', () => {
    it('should return list of voices', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            voices: [
              { id: 'heart', name: 'Heart' },
              { id: 'michael', name: 'Michael' },
            ],
          }),
        headers: new Headers(),
      });

      const client = new LangVoiceClient({ apiKey: 'test-key' });
      const voices = await client.listVoices();

      expect(voices).toHaveLength(2);
      expect(voices[0].id).toBe('heart');
    });
  });
});

describe('LangVoiceToolkit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create toolkit with API key', () => {
    const toolkit = new LangVoiceToolkit({ apiKey: 'test-key' });
    expect(toolkit).toBeDefined();
  });

  it('should return function schemas', () => {
    const toolkit = new LangVoiceToolkit({ apiKey: 'test-key' });
    const schemas = toolkit.getFunctionSchemas();

    expect(schemas).toHaveLength(4);
    expect(schemas[0].name).toBe('langvoice_text_to_speech');
  });

  it('should return OpenAI tools format', () => {
    const toolkit = new LangVoiceToolkit({ apiKey: 'test-key' });
    const tools = toolkit.getOpenAITools();

    expect(tools).toHaveLength(4);
    expect(tools[0].type).toBe('function');
    expect(tools[0].function.name).toBe('langvoice_text_to_speech');
  });
});
