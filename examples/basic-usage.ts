/**
 * LangVoice SDK - Basic Usage Example
 */

import { writeFileSync } from 'fs';
import { LangVoiceClient } from 'langvoice-sdk';

// Set your API key
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY || 'your-langvoice-api-key';

async function basicGeneration() {
  console.log('=' .repeat(50));
  console.log('Basic TTS Generation');
  console.log('=' .repeat(50));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  // Generate speech
  const response = await client.generate({
    text: 'Hello! This is a test of the LangVoice SDK.',
    voice: 'heart',
    language: 'american_english',
    speed: 1.0,
  });

  console.log(`✅ Success!`);
  console.log(`   Duration: ${response.duration} seconds`);
  console.log(`   Characters: ${response.charactersProcessed}`);

  // Save to file
  writeFileSync('output.mp3', response.audioData);
  console.log(`   Saved to: output.mp3`);
}

async function multiVoiceGeneration() {
  console.log('\n' + '=' .repeat(50));
  console.log('Multi-Voice Generation');
  console.log('=' .repeat(50));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  const response = await client.generateMultiVoice({
    text: '[heart] Hello! Welcome to our podcast. [michael] Thanks for having me!',
    language: 'american_english',
  });

  console.log(`✅ Multi-voice speech generated!`);
  console.log(`   Duration: ${response.duration} seconds`);

  writeFileSync('multi_voice.mp3', response.audioData);
  console.log(`   Saved to: multi_voice.mp3`);
}

async function listResources() {
  console.log('\n' + '=' .repeat(50));
  console.log('Available Voices');
  console.log('=' .repeat(50));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  const voices = await client.listVoices();
  for (const voice of voices) {
    console.log(`  - ${voice.id}: ${voice.name}`);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('Supported Languages');
  console.log('=' .repeat(50));

  const languages = await client.listLanguages();
  for (const lang of languages) {
    console.log(`  - ${lang.id}: ${lang.name}`);
  }
}

async function simpleUsage() {
  console.log('\n' + '=' .repeat(50));
  console.log('Simple Text-to-Speech');
  console.log('=' .repeat(50));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  // Simple one-liner
  const audioBuffer = await client.textToSpeech('Hello, world!', 'michael');
  
  writeFileSync('simple.mp3', audioBuffer);
  console.log(`✅ Saved to: simple.mp3`);
}

async function main() {
  try {
    await basicGeneration();
    await multiVoiceGeneration();
    await listResources();
    await simpleUsage();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
