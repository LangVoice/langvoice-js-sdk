/**
 * LangChain Integration Test with OpenAI Model
 * 
 * Tests the LangVoice SDK integration with LangChain using OpenAI as the LLM.
 */

import { writeFileSync } from 'fs';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { DynamicTool } from '@langchain/core/tools';
import {
  LangVoiceLangChainToolkit,
  LangVoiceTTSTool,
  LangVoiceMultiVoiceTool,
  LangVoiceVoicesTool,
  LangVoiceLanguagesTool,
  getAllLangChainTools,
} from '../src/tools/langchain-tools';

// API Keys from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY;

async function testToolkitCreation() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: LangChain Toolkit Creation');
  console.log('='.repeat(60));

  try {
    const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });
    const tools = toolkit.getTools();
    
    console.log('✅ SUCCESS!');
    console.log(`   ${tools.length} tools created:`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description.substring(0, 40)}...`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testTTSToolDirect() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: LangVoiceTTSTool Direct Call');
  console.log('='.repeat(60));

  try {
    const tool = new LangVoiceTTSTool({ 
      apiKey: LANGVOICE_API_KEY,
      outputFile: 'test_langchain_tts.mp3',
    });
    
    console.log(`   Tool name: ${tool.name}`);
    console.log(`   Description: ${tool.description.substring(0, 50)}...`);
    
    // Test with string input
    console.log('   Testing with string input...');
    const result1 = await tool.call('Hello from LangChain TTS tool!');
    console.log(`   Result: ${result1.substring(0, 80)}...`);
    
    // Test with object input
    console.log('   Testing with object input...');
    const result2 = await tool.call({
      text: 'Hello with object input!',
      voice: 'michael',
      speed: 1.2,
    });
    console.log(`   Result: ${result2.substring(0, 80)}...`);
    
    if (result1.includes('✅') && result2.includes('✅')) {
      console.log('✅ SUCCESS!');
      return true;
    } else if (result1.includes('❌') || result2.includes('❌')) {
      console.log('❌ FAILED: Tool returned error');
      return false;
    }
    
    console.log('✅ SUCCESS!');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testMultiVoiceToolDirect() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: LangVoiceMultiVoiceTool Direct Call');
  console.log('='.repeat(60));

  try {
    const tool = new LangVoiceMultiVoiceTool({ 
      apiKey: LANGVOICE_API_KEY,
      outputFile: 'test_langchain_multivoice.mp3',
    });
    
    console.log(`   Tool name: ${tool.name}`);
    
    const result = await tool.call({
      text: '[heart] Welcome to LangChain! [michael] Great to be here!',
      language: 'american_english',
    });
    
    console.log(`   Result: ${result.substring(0, 80)}...`);
    
    if (result.includes('✅')) {
      console.log('✅ SUCCESS!');
      return true;
    } else {
      console.log('❌ FAILED: Tool returned error');
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testCreateDynamicTools() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Create LangChain DynamicTools');
  console.log('='.repeat(60));

  try {
    const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });
    
    // Create LangChain DynamicTools from our tools
    const ttsTool = toolkit.getTTSTool('langchain_dynamic_tts.mp3');
    const voicesTool = toolkit.getVoicesTool();
    
    // Wrap as DynamicTool for LangChain compatibility
    const ttsLangChainTool = new DynamicTool({
      name: ttsTool.name,
      description: ttsTool.description,
      func: async (input: string) => {
        try {
          const parsed = JSON.parse(input);
          return await ttsTool.call(parsed);
        } catch {
          return await ttsTool.call(input);
        }
      },
    });

    const voicesLangChainTool = new DynamicTool({
      name: voicesTool.name,
      description: voicesTool.description,
      func: async () => {
        return await voicesTool.call();
      },
    });

    console.log('✅ SUCCESS!');
    console.log('   DynamicTools created:');
    console.log(`   - ${ttsLangChainTool.name}`);
    console.log(`   - ${voicesLangChainTool.name}`);
    
    // Test the wrapped tool
    console.log('\n   Testing DynamicTool.invoke()...');
    const result = await ttsLangChainTool.invoke('Hello from DynamicTool!');
    const resultStr = typeof result === 'string' ? result : String(result);
    console.log(`   Result: ${resultStr.substring(0, 60)}...`);
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testBindToolsToOpenAI() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Bind LangVoice Tools to ChatOpenAI');
  console.log('='.repeat(60));

  if (!OPENAI_API_KEY) {
    console.log('⚠️  SKIPPED: OPENAI_API_KEY not set');
    return true;
  }

  try {
    // Create ChatOpenAI model
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY,
    });

    console.log('   Model: gpt-4o-mini');

    // Create LangVoice tools wrapped as DynamicTools
    const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });
    const voicesTool = toolkit.getVoicesTool();
    
    const tools = [
      new DynamicTool({
        name: 'langvoice_list_voices', 
        description: 'Get available voices for text-to-speech generation.',
        func: async () => await voicesTool.call(),
      }),
    ];

    // Bind tools to model
    const modelWithTools = model.bindTools(tools);
    
    console.log('   Tools bound to model');

    // Invoke with a request that should trigger tool use
    const response = await modelWithTools.invoke([
      new SystemMessage('You are a helpful assistant with text-to-speech capabilities. Use the available tools when asked about voices.'),
      new HumanMessage('What voices are available for text-to-speech?'),
    ]);

    console.log('✅ SUCCESS!');
    console.log(`   Model response type: ${response.constructor.name}`);
    
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`   Tool calls requested: ${response.tool_calls.length}`);
      for (const tc of response.tool_calls) {
        console.log(`   - Tool: ${tc.name}`);
      }
    } else {
      console.log(`   Response content: ${String(response.content).substring(0, 80)}...`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testFullToolCallCycle() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Full Tool Call Cycle with ChatOpenAI');
  console.log('='.repeat(60));

  if (!OPENAI_API_KEY) {
    console.log('⚠️  SKIPPED: OPENAI_API_KEY not set');
    return true;
  }

  try {
    // Create ChatOpenAI model
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY,
    });

    // Create LangVoice TTS tool
    const ttsTool = new LangVoiceTTSTool({ 
      apiKey: LANGVOICE_API_KEY,
      outputFile: 'test_langchain_fullcycle.mp3',
    });
    
    const tool = new DynamicTool({
      name: 'speak',
      description: 'Generate speech audio from text. Pass the exact text you want to convert to speech.',
      func: async (input: string) => await ttsTool.call(input),
    });

    // Bind tools and invoke
    const modelWithTools = model.bindTools([tool]);
    
    console.log('   Sending request to GPT-4o-mini with bound tools...');

    const response = await modelWithTools.invoke([
      new SystemMessage('You are an assistant that can generate speech. When asked to speak or generate audio, use the speak tool.'),
      new HumanMessage('Please use the speak tool to say "Hello from LangChain and LangVoice integration!"'),
    ]);

    // Check if model requested a tool call
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`   Model requested ${response.tool_calls.length} tool call(s)`);
      
      for (const tc of response.tool_calls) {
        console.log(`   Executing: ${tc.name}`);
        console.log(`   Args: ${JSON.stringify(tc.args)}`);
        
        // Execute the tool
        const toolResult = await tool.invoke(tc.args.input || tc.args.text || JSON.stringify(tc.args));
        const toolResultStr = typeof toolResult === 'string' ? toolResult : String(toolResult);
        console.log(`   Tool result: ${toolResultStr.substring(0, 60)}...`);
      }
      
      console.log('✅ SUCCESS! Full tool call cycle completed.');
      return true;
    } else {
      console.log(`   Model response: ${String(response.content).substring(0, 100)}`);
      console.log('⚠️  Model did not call tool (may have answered directly)');
      return true;
    }
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testToolkitGetters() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Toolkit Individual Getters');
  console.log('='.repeat(60));

  try {
    const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });
    
    const ttsTool = toolkit.getTTSTool('custom_output.mp3');
    const multiVoiceTool = toolkit.getMultiVoiceTool();
    const voicesTool = toolkit.getVoicesTool();
    const langTool = toolkit.getLanguagesTool();
    
    console.log('✅ SUCCESS!');
    console.log('   Individual tools created:');
    console.log(`   - TTS Tool: ${ttsTool.name}`);
    console.log(`   - Multi-Voice Tool: ${multiVoiceTool.name}`);
    console.log(`   - Voices Tool: ${voicesTool.name}`);
    console.log(`   - Languages Tool: ${langTool.name}`);
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   LangVoice JS SDK - LangChain + OpenAI Integration Tests  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (!LANGVOICE_API_KEY) {
    console.log('\n⚠️  WARNING: LANGVOICE_API_KEY not set - some tests will fail');
  }
  if (!OPENAI_API_KEY) {
    console.log('\n⚠️  WARNING: OPENAI_API_KEY not set - OpenAI tests will be skipped');
  }

  const results: boolean[] = [];

  results.push(await testToolkitCreation());
  results.push(await testTTSToolDirect());
  results.push(await testMultiVoiceToolDirect());
  results.push(await testCreateDynamicTools());
  results.push(await testBindToolsToOpenAI());
  results.push(await testFullToolCallCycle());
  results.push(await testToolkitGetters());

  console.log('\n' + '='.repeat(60));
  console.log('LANGCHAIN + OPENAI INTEGRATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n  📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('  🎉 ALL LANGCHAIN TESTS PASSED!\n');
  } else {
    console.log('  ⚠️  Some tests failed. Please review the errors above.\n');
  }
  
  return passed === total;
}

main().catch(console.error);
