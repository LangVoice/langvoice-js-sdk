/**
 * AutoGen Integration Test
 * 
 * Tests the LangVoice SDK integration with AutoGen-style function calling.
 */

import { writeFileSync } from 'fs';
import {
  LangVoiceAutoGenTools,
  createAutoGenTools,
  getAutoGenFunctionDefinitions,
} from '../src/tools/autogen-tools';

// API Keys from environment variables
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY;

async function testFunctionDefinitions() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: AutoGen Function Definitions');
  console.log('='.repeat(60));

  try {
    const definitions = getAutoGenFunctionDefinitions();
    
    console.log('✅ SUCCESS!');
    console.log(`   ${definitions.length} function definitions:`);
    definitions.forEach(def => {
      console.log(`   - ${def.name}: ${def.description.substring(0, 40)}...`);
    });
    
    // Verify structure
    const ttsDef = definitions.find(d => d.name === 'langvoice_text_to_speech');
    if (!ttsDef) throw new Error('TTS definition not found');
    if (!ttsDef.parameters.properties.text) throw new Error('Text property missing');
    if (ttsDef.parameters.required[0] !== 'text') throw new Error('text should be required');
    
    console.log('   Function structure validated ✓');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testAutoGenToolsClass() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: LangVoiceAutoGenTools Class');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({
      apiKey: LANGVOICE_API_KEY,
      autoSave: true,
      outputFile: 'test_autogen_class.mp3',
    });
    
    // Get function definitions
    const defs = tools.getFunctionDefinitions();
    console.log(`   Got ${defs.length} function definitions`);
    
    // Get function map
    const functionMap = tools.getFunctionMap();
    const functionNames = Object.keys(functionMap);
    console.log(`   Function map has ${functionNames.length} handlers:`);
    functionNames.forEach(name => console.log(`   - ${name}`));
    
    // Get individual definitions
    const ttsDef = tools.getTTSFunctionDef();
    const multiVoiceDef = tools.getMultiVoiceFunctionDef();
    console.log(`\n   Individual definitions:`);
    console.log(`   - TTS: ${ttsDef.name}`);
    console.log(`   - Multi-voice: ${multiVoiceDef.name}`);
    
    console.log('✅ SUCCESS!');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testHandleFunctionCall() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Handle Function Call - TTS');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({
      apiKey: LANGVOICE_API_KEY,
      autoSave: true,
      outputFile: 'test_autogen_tts.mp3',
    });
    
    console.log('   Calling langvoice_text_to_speech...');
    
    const result = await tools.handleFunctionCall({
      name: 'langvoice_text_to_speech',
      arguments: {
        text: 'Hello from AutoGen integration test!',
        voice: 'heart',
      },
    });
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'Function call failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${parsed.duration} seconds`);
    console.log(`   Characters: ${parsed.charactersProcessed}`);
    console.log(`   Output file: ${parsed.outputFile || 'N/A'}`);
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testHandleMultiVoiceCall() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Handle Function Call - Multi-Voice');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({
      apiKey: LANGVOICE_API_KEY,
      autoSave: true,
      outputFile: 'test_autogen_multivoice.mp3',
    });
    
    console.log('   Calling langvoice_multi_voice_speech...');
    
    const result = await tools.handleFunctionCall({
      name: 'langvoice_multi_voice_speech',
      arguments: {
        text: '[heart] Hello from AutoGen! [michael] Nice to meet you!',
        language: 'american_english',
      },
    });
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'Function call failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${parsed.duration} seconds`);
    console.log(`   Output file: ${parsed.outputFile || 'N/A'}`);
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testListVoicesCall() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Handle Function Call - List Voices');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({ apiKey: LANGVOICE_API_KEY });
    
    console.log('   Calling langvoice_list_voices...');
    
    const result = await tools.handleFunctionCall({
      name: 'langvoice_list_voices',
      arguments: {},
    });
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'Function call failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Found ${parsed.count} voices`);
    parsed.voices.slice(0, 5).forEach((v: { id: string; name: string }) => {
      console.log(`   - ${v.id}: ${v.name}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testListLanguagesCall() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Handle Function Call - List Languages');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({ apiKey: LANGVOICE_API_KEY });
    
    console.log('   Calling langvoice_list_languages...');
    
    const result = await tools.handleFunctionCall({
      name: 'langvoice_list_languages',
      arguments: {},
    });
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'Function call failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Found ${parsed.count} languages:`);
    parsed.languages.forEach((l: { id: string; name: string }) => {
      console.log(`   - ${l.id}: ${l.name}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testDirectMethods() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Direct Methods (generateSpeech, saveAudio)');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({ apiKey: LANGVOICE_API_KEY });
    
    // Test generateSpeech
    console.log('   Calling generateSpeech...');
    const result = await tools.generateSpeech({
      text: 'Testing direct method!',
      voice: 'michael',
    });
    
    if (!result.success) {
      throw new Error(result.error || 'generateSpeech failed');
    }
    
    console.log(`   Duration: ${result.duration} seconds`);
    console.log(`   Audio buffer size: ${result.audioBuffer?.length} bytes`);
    
    // Test saveAudio
    console.log('   Saving audio...');
    const saved = await tools.saveAudio(result, 'test_autogen_direct.mp3');
    console.log(`   Saved: ${saved ? 'Yes' : 'No'}`);
    
    console.log('✅ SUCCESS!');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testCreateAutoGenToolsFactory() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 8: Factory Function (createAutoGenTools)');
  console.log('='.repeat(60));

  try {
    const tools = createAutoGenTools({ apiKey: LANGVOICE_API_KEY });
    
    console.log('   Created tools via factory function');
    
    const client = tools.getClient();
    console.log(`   Got client: ${client ? 'Yes' : 'No'}`);
    
    const defs = tools.getFunctionDefinitions();
    console.log(`   Function definitions: ${defs.length}`);
    
    console.log('✅ SUCCESS!');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testFunctionMapExecution() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 9: Function Map Direct Execution');
  console.log('='.repeat(60));

  try {
    const tools = new LangVoiceAutoGenTools({
      apiKey: LANGVOICE_API_KEY,
      autoSave: false, // Don't auto-save for this test
    });
    
    const functionMap = tools.getFunctionMap();
    
    console.log('   Executing TTS via function map...');
    
    // Call the function directly from the map
    const result = await functionMap['langvoice_text_to_speech']({
      text: 'Hello via function map!',
      voice: 'nova',
    });
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'Function map execution failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${parsed.duration} seconds`);
    console.log(`   Has audioBase64: ${parsed.audioBase64 ? 'Yes' : 'No'}`);
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        LangVoice JS SDK - AutoGen Integration Tests        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (!LANGVOICE_API_KEY) {
    console.log('\n⚠️  WARNING: LANGVOICE_API_KEY not set - tests will fail');
  }

  const results: boolean[] = [];

  results.push(await testFunctionDefinitions());
  results.push(await testAutoGenToolsClass());
  results.push(await testHandleFunctionCall());
  results.push(await testHandleMultiVoiceCall());
  results.push(await testListVoicesCall());
  results.push(await testListLanguagesCall());
  results.push(await testDirectMethods());
  results.push(await testCreateAutoGenToolsFactory());
  results.push(await testFunctionMapExecution());

  console.log('\n' + '='.repeat(60));
  console.log('AUTOGEN INTEGRATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n  📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('  🎉 ALL AUTOGEN TESTS PASSED!\n');
  } else {
    console.log('  ⚠️  Some tests failed. Please review the errors above.\n');
  }
  
  return passed === total;
}

main().catch(console.error);
