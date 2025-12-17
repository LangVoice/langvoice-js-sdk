/**
 * Real API Integration Test
 * 
 * Run this to verify the SDK works correctly with the LangVoice API.
 */

import { writeFileSync } from 'fs';
import { LangVoiceClient } from '../src/client';
import { LangVoiceToolkit } from '../src/tools/generic-tools';

// Use the API key from environment variable
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY;

async function testBasicGeneration() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Basic TTS Generation');
  console.log('='.repeat(60));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  try {
    const response = await client.generate({
      text: 'Hello! This is a test of the LangVoice JavaScript SDK.',
      voice: 'heart',
      language: 'american_english',
      speed: 1.0,
    });

    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${response.duration} seconds`);
    console.log(`   Characters Processed: ${response.charactersProcessed}`);
    console.log(`   Audio Size: ${response.audioData.length} bytes`);

    // Save the audio file
    writeFileSync('test_output_basic.mp3', response.audioData);
    console.log('   Saved to: test_output_basic.mp3');
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testMultiVoice() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Multi-Voice Generation');
  console.log('='.repeat(60));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  try {
    const response = await client.generateMultiVoice({
      text: '[heart] Hello! Welcome to LangVoice. [michael] Thanks for testing the SDK!',
      language: 'american_english',
    });

    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${response.duration} seconds`);
    console.log(`   Audio Size: ${response.audioData.length} bytes`);

    writeFileSync('test_output_multivoice.mp3', response.audioData);
    console.log('   Saved to: test_output_multivoice.mp3');
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testListVoices() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: List Voices');
  console.log('='.repeat(60));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  try {
    const voices = await client.listVoices();

    console.log('✅ SUCCESS!');
    console.log(`   Found ${voices.length} voices:`);
    voices.slice(0, 5).forEach(v => {
      console.log(`   - ${v.id}: ${v.name}`);
    });
    if (voices.length > 5) {
      console.log(`   ... and ${voices.length - 5} more`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testListLanguages() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: List Languages');
  console.log('='.repeat(60));

  const client = new LangVoiceClient({ apiKey: LANGVOICE_API_KEY });

  try {
    const languages = await client.listLanguages();

    console.log('✅ SUCCESS!');
    console.log(`   Found ${languages.length} languages:`);
    languages.forEach(l => {
      console.log(`   - ${l.id}: ${l.name}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testToolkit() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: LangVoiceToolkit');
  console.log('='.repeat(60));

  const toolkit = new LangVoiceToolkit({ apiKey: LANGVOICE_API_KEY });

  try {
    // Test TTS via toolkit
    const result = await toolkit.textToSpeech({
      text: 'Hello from the toolkit!',
      voice: 'michael',
    });

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${result.duration} seconds`);
    console.log(`   Audio Base64 length: ${result.audioBase64?.length}`);

    // Save audio
    if (result.audioBase64) {
      const buffer = Buffer.from(result.audioBase64, 'base64');
      writeFileSync('test_output_toolkit.mp3', buffer);
      console.log('   Saved to: test_output_toolkit.mp3');
    }

    // Test function schemas
    const schemas = toolkit.getFunctionSchemas();
    console.log(`   Function schemas: ${schemas.length} tools available`);
    schemas.forEach(s => console.log(`   - ${s.name}`));
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         LangVoice JS SDK - Integration Tests               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results: boolean[] = [];

  results.push(await testBasicGeneration());
  results.push(await testMultiVoice());
  results.push(await testListVoices());
  results.push(await testListLanguages());
  results.push(await testToolkit());

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n  📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('  🎉 ALL TESTS PASSED! SDK is ready for publishing!\n');
    process.exit(0);
  } else {
    console.log('  ⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

main().catch(console.error);
