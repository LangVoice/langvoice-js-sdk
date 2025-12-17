/**
 * LangVoice SDK - AutoGen Integration Example
 *
 * This example demonstrates how to use LangVoice with Microsoft AutoGen
 * multi-agent framework.
 *
 * Note: AutoGen is a Python framework, but this shows how to use the
 * LangVoice tools in a way compatible with AutoGen-style function calling.
 * For actual AutoGen usage, use the Python SDK.
 *
 * This example shows:
 * 1. Getting function definitions for agent configuration
 * 2. Handling function calls
 * 3. Building multi-agent workflows with TTS capabilities
 *
 * Run:
 *   npx ts-node examples/example-autogen.ts
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import {
  LangVoiceAutoGenTools,
  createAutoGenTools,
  getAutoGenFunctionDefinitions,
} from 'langvoice-sdk/tools';

// API Key
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY || 'your-langvoice-api-key';

// Output directory
const OUTPUT_DIR = './autogen_output';

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================
// Example 1: Basic Setup and Function Definitions
// ============================================

async function basicSetup() {
  console.log('='.repeat(60));
  console.log('Example 1: Basic Setup & Function Definitions');
  console.log('='.repeat(60));

  // Create tools instance
  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
    autoSave: true,
    outputFile: `${OUTPUT_DIR}/basic_output.mp3`,
  });

  // Get function definitions (these would go in AutoGen agent config)
  const functionDefs = langvoiceTools.getFunctionDefinitions();

  console.log('\n📋 Function Definitions for AutoGen:');
  console.log('-'.repeat(40));

  for (const func of functionDefs) {
    console.log(`\n  📌 ${func.name}`);
    console.log(`     ${func.description.substring(0, 70)}...`);
    console.log(`     Required params: ${func.parameters.required.join(', ') || 'none'}`);
  }

  // Get function map (for registering with agents)
  const functionMap = langvoiceTools.getFunctionMap();
  console.log(`\n📦 Function Map Keys: ${Object.keys(functionMap).join(', ')}`);
}

// ============================================
// Example 2: Handling Function Calls
// ============================================

async function handleFunctionCalls() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: Handling Function Calls');
  console.log('='.repeat(60));

  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
    autoSave: true,
    outputFile: `${OUTPUT_DIR}/function_call.mp3`,
  });

  // Simulate a function call from AutoGen
  const functionCall = {
    name: 'langvoice_text_to_speech',
    arguments: {
      text: 'Hello! This is a test of the AutoGen integration with LangVoice.',
      voice: 'heart',
      language: 'american_english',
      speed: 1.0,
      output_file: `${OUTPUT_DIR}/autogen_tts.mp3`,
    },
  };

  console.log('\n🔧 Simulated Function Call:');
  console.log(JSON.stringify(functionCall, null, 2));

  // Handle the function call
  const result = await langvoiceTools.handleFunctionCall(functionCall);
  const parsedResult = JSON.parse(result);

  console.log('\n📊 Function Call Result:');
  console.log(JSON.stringify(parsedResult, null, 2));
}

// ============================================
// Example 3: Multi-Voice with AutoGen
// ============================================

async function multiVoiceAutoGen() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 3: Multi-Voice Generation');
  console.log('='.repeat(60));

  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
    autoSave: true,
  });

  // Multi-voice function call
  const functionCall = {
    name: 'langvoice_multi_voice_speech',
    arguments: {
      text: '[heart] Welcome to the AutoGen demo! [michael] Thanks for joining us. [heart] Let me explain how this works. [michael] It\'s actually pretty simple!',
      language: 'american_english',
      speed: 1.0,
      output_file: `${OUTPUT_DIR}/multi_voice.mp3`,
    },
  };

  console.log('\n🎭 Multi-Voice Function Call...');

  const result = await langvoiceTools.handleFunctionCall(functionCall);
  const parsedResult = JSON.parse(result);

  console.log('\n📊 Result:');
  console.log(`   Success: ${parsedResult.success}`);
  console.log(`   Duration: ${parsedResult.duration}s`);
  if (parsedResult.outputFile) {
    console.log(`   Output: ${parsedResult.outputFile}`);
  }
}

// ============================================
// Example 4: Listing Resources
// ============================================

async function listResources() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 4: Listing Voices and Languages');
  console.log('='.repeat(60));

  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
  });

  // List voices
  console.log('\n🎤 Calling list_voices function...');
  const voicesResult = await langvoiceTools.handleFunctionCall({
    name: 'langvoice_list_voices',
    arguments: {},
  });
  const voices = JSON.parse(voicesResult);

  if (voices.success) {
    console.log(`   Found ${voices.count} voices:`);
    for (const voice of voices.voices.slice(0, 5)) {
      console.log(`   - ${voice.id}: ${voice.name}`);
    }
    console.log(`   ... and ${voices.count - 5} more`);
  }

  // List languages
  console.log('\n🌍 Calling list_languages function...');
  const languagesResult = await langvoiceTools.handleFunctionCall({
    name: 'langvoice_list_languages',
    arguments: {},
  });
  const languages = JSON.parse(languagesResult);

  if (languages.success) {
    console.log(`   Found ${languages.count} languages:`);
    for (const lang of languages.languages) {
      console.log(`   - ${lang.id}: ${lang.name}`);
    }
  }
}

// ============================================
// Example 5: Using Function Map Directly
// ============================================

async function usingFunctionMap() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 5: Using Function Map Directly');
  console.log('='.repeat(60));

  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
    autoSave: true,
  });

  // Get the function map
  const functionMap = langvoiceTools.getFunctionMap();

  // Call functions directly through the map
  console.log('\n📞 Calling TTS function via function map...');

  const ttsHandler = functionMap['langvoice_text_to_speech'];
  const result = await ttsHandler({
    text: 'This call was made directly through the function map!',
    voice: 'michael',
    output_file: `${OUTPUT_DIR}/function_map.mp3`,
  });

  const parsedResult = JSON.parse(result);
  console.log(`   Success: ${parsedResult.success}`);
  console.log(`   Duration: ${parsedResult.duration}s`);
}

// ============================================
// Example 6: Direct Methods (Non-Tool Usage)
// ============================================

async function directMethods() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 6: Direct Methods (Non-Tool Usage)');
  console.log('='.repeat(60));

  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
  });

  // Generate speech directly
  console.log('\n🔊 Generating speech directly...');

  const result = await langvoiceTools.generateSpeech({
    text: 'This was generated using the direct method, not as a tool call.',
    voice: 'bella',
    language: 'american_english',
    speed: 1.1,
  });

  if (result.success) {
    console.log(`   ✅ Success! Duration: ${result.duration}s`);

    // Save audio
    const saved = await langvoiceTools.saveAudio(result, `${OUTPUT_DIR}/direct_method.mp3`);
    if (saved) {
      console.log(`   📁 Saved to: ${OUTPUT_DIR}/direct_method.mp3`);
    }
  } else {
    console.log(`   ❌ Error: ${result.error}`);
  }
}

// ============================================
// Example 7: Simulated AutoGen Agent Workflow
// ============================================

async function simulatedAgentWorkflow() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 7: Simulated AutoGen Agent Workflow');
  console.log('='.repeat(60));

  const langvoiceTools = new LangVoiceAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
    autoSave: true,
  });

  // Simulate an agent conversation that uses TTS
  console.log('\n🤖 Simulating multi-agent conversation with TTS...\n');

  const conversation = [
    {
      agent: 'User',
      message: 'Can you create an audio greeting for our podcast?',
    },
    {
      agent: 'Assistant',
      message: 'I\'ll create a greeting using multiple voices. Let me generate that for you.',
      functionCall: {
        name: 'langvoice_multi_voice_speech',
        arguments: {
          text: '[heart] Welcome to Tech Talk podcast! [michael] I\'m your host, and today we have an amazing show for you!',
          output_file: `${OUTPUT_DIR}/podcast_intro.mp3`,
        },
      },
    },
    {
      agent: 'User',
      message: 'What voices are available?',
    },
    {
      agent: 'Assistant',
      message: 'Let me check the available voices.',
      functionCall: {
        name: 'langvoice_list_voices',
        arguments: {},
      },
    },
  ];

  for (const turn of conversation) {
    console.log(`  [${turn.agent}]: ${turn.message}`);

    if ('functionCall' in turn && turn.functionCall) {
      console.log(`  📞 Function Call: ${turn.functionCall.name}`);
      const result = await langvoiceTools.handleFunctionCall(turn.functionCall);
      const parsed = JSON.parse(result);

      if (parsed.success) {
        if (parsed.duration) {
          console.log(`  ✅ Generated ${parsed.duration}s of audio`);
        } else if (parsed.voices) {
          console.log(`  ✅ Found ${parsed.count} voices`);
        }
      }
    }
    console.log('');
  }
}

// ============================================
// Example 8: Factory Function Usage
// ============================================

async function factoryFunctionUsage() {
  console.log('='.repeat(60));
  console.log('Example 8: Factory Function Usage');
  console.log('='.repeat(60));

  // Use factory function
  const langvoiceTools = createAutoGenTools({
    apiKey: LANGVOICE_API_KEY,
    autoSave: false,
  });

  // Get function definitions without creating tools
  const functionDefs = getAutoGenFunctionDefinitions();
  console.log(`\n📋 Got ${functionDefs.length} function definitions via factory`);

  // Generate speech
  const result = await langvoiceTools.generateSpeech({
    text: 'Created using the factory function!',
  });

  if (result.success) {
    console.log(`✅ Generated ${result.duration}s of audio`);
    console.log(`📊 Characters processed: ${result.charactersProcessed}`);
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n🎤 LangVoice SDK - AutoGen Integration Examples\n');
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  try {
    await basicSetup();
    await handleFunctionCalls();
    await multiVoiceAutoGen();
    await listResources();
    await usingFunctionMap();
    await directMethods();
    await simulatedAgentWorkflow();
    await factoryFunctionUsage();

    console.log('='.repeat(60));
    console.log('✅ All AutoGen examples completed!');
    console.log(`📁 Check ${OUTPUT_DIR}/ for generated audio files`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();
