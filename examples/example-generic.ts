/**
 * LangVoice SDK - Generic/Universal Integration Example
 */

import { writeFileSync } from 'fs';
import { LangVoiceToolkit } from 'langvoice-sdk/tools';

// Set your API key
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY || 'your-langvoice-api-key';

async function basicUsage() {
  console.log('=' .repeat(50));
  console.log('Basic TTS Generation');
  console.log('=' .repeat(50));

  const toolkit = new LangVoiceToolkit({ apiKey: LANGVOICE_API_KEY });

  // Generate speech
  const result = await toolkit.textToSpeech({
    text: 'Hello! This is a test of the LangVoice SDK.',
    voice: 'heart',
    language: 'american_english',
    speed: 1.0,
  });

  if (result.success) {
    console.log(`✅ Success!`);
    console.log(`   Duration: ${result.duration} seconds`);
    console.log(`   Characters: ${result.charactersProcessed}`);

    // Save to file
    await toolkit.saveAudio(result, 'output.mp3');
    console.log(`   Saved to: output.mp3`);
  } else {
    console.log(`❌ Error: ${result.error}`);
  }
}

async function multiVoiceExample() {
  console.log('\n' + '=' .repeat(50));
  console.log('Multi-Voice Generation');
  console.log('=' .repeat(50));

  const toolkit = new LangVoiceToolkit({ apiKey: LANGVOICE_API_KEY });

  const result = await toolkit.multiVoiceSpeech({
    text: '[heart] Hello! Welcome to our podcast. [michael] Thanks for having me!',
    language: 'american_english',
  });

  if (result.success) {
    console.log(`✅ Multi-voice speech generated!`);
    console.log(`   Duration: ${result.duration} seconds`);
    await toolkit.saveAudio(result, 'multi_voice.mp3');
    console.log(`   Saved to: multi_voice.mp3`);
  }
}

async function listResources() {
  console.log('\n' + '=' .repeat(50));
  console.log('Available Voices');
  console.log('=' .repeat(50));

  const toolkit = new LangVoiceToolkit({ apiKey: LANGVOICE_API_KEY });

  const voicesResult = await toolkit.listVoices();
  if (voicesResult.success && voicesResult.voices) {
    for (const voice of voicesResult.voices) {
      console.log(`  - ${voice.id}: ${voice.name}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('Supported Languages');
  console.log('=' .repeat(50));

  const languagesResult = await toolkit.listLanguages();
  if (languagesResult.success && languagesResult.languages) {
    for (const lang of languagesResult.languages) {
      console.log(`  - ${lang.id}: ${lang.name}`);
    }
  }
}

async function handleToolCallsExample() {
  console.log('\n' + '=' .repeat(50));
  console.log('Handling Tool Calls');
  console.log('=' .repeat(50));

  const toolkit = new LangVoiceToolkit({ apiKey: LANGVOICE_API_KEY });

  // Simulate a tool call from an LLM
  const toolName = 'langvoice_text_to_speech';
  const args = {
    text: 'This simulates a tool call from any LLM!',
    voice: 'michael',
  };

  // Handle the tool call
  const result = await toolkit.handleToolCall(toolName, args);

  if (result.success && 'duration' in result) {
    console.log(`✅ Tool call handled successfully!`);
    console.log(`   Duration: ${result.duration} seconds`);
    await toolkit.saveAudio(result as any, 'tool_call.mp3');
    console.log(`   Saved to: tool_call.mp3`);
  }
}

async function getSchemasExample() {
  console.log('\n' + '=' .repeat(50));
  console.log('Function Schemas (for any framework)');
  console.log('=' .repeat(50));

  const toolkit = new LangVoiceToolkit({ apiKey: LANGVOICE_API_KEY });

  const schemas = toolkit.getFunctionSchemas();
  for (const schema of schemas) {
    console.log(`\n  📌 ${schema.name}`);
    console.log(`     ${schema.description.substring(0, 60)}...`);
  }
}

async function main() {
  try {
    await basicUsage();
    await multiVoiceExample();
    await listResources();
    await handleToolCallsExample();
    await getSchemasExample();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
