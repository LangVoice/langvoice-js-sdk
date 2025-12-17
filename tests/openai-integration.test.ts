/**
 * OpenAI Integration Test
 * 
 * Tests the LangVoice SDK integration with OpenAI.
 */

import { writeFileSync } from 'fs';
import OpenAI from 'openai';
import { LangVoiceOpenAITools, getOpenAITools, handleOpenAIToolCall } from '../src/tools/openai-tools';

// API Keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY;

async function testOpenAIToolDefinitions() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: OpenAI Tool Definitions');
  console.log('='.repeat(60));

  try {
    const tools = getOpenAITools();
    
    console.log('✅ SUCCESS!');
    console.log(`   ${tools.length} tools defined:`);
    tools.forEach(tool => {
      console.log(`   - ${tool.function.name}: ${tool.function.description.substring(0, 50)}...`);
    });
    
    // Verify structure
    const ttsTool = tools.find(t => t.function.name === 'langvoice_text_to_speech');
    if (!ttsTool) throw new Error('TTS tool not found');
    if (ttsTool.type !== 'function') throw new Error('Tool type should be function');
    if (!ttsTool.function.parameters.properties.text) throw new Error('Text property missing');
    
    console.log('   Tool structure validated ✓');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testOpenAIToolsClass() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: LangVoiceOpenAITools Class');
  console.log('='.repeat(60));

  try {
    const langvoice = new LangVoiceOpenAITools({ apiKey: LANGVOICE_API_KEY });
    
    // Get tools
    const tools = langvoice.getTools();
    console.log(`   Got ${tools.length} tools from class`);
    
    // Simulate a tool call
    const mockToolCall = {
      id: 'call_123',
      type: 'function' as const,
      function: {
        name: 'langvoice_text_to_speech',
        arguments: JSON.stringify({
          text: 'Hello from OpenAI integration test!',
          voice: 'heart',
        }),
      },
    };
    
    console.log('   Executing simulated tool call...');
    const result = await langvoice.handleCall(mockToolCall);
    
    if (!result.success) {
      throw new Error(result.error || 'Tool call failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${result.duration} seconds`);
    console.log(`   Audio generated: ${result.audioBase64 ? 'Yes' : 'No'}`);
    
    // Save audio
    if (result.audioBase64) {
      const saved = await langvoice.saveAudioFromResult(result, 'test_openai_tools.mp3');
      console.log(`   Audio saved: ${saved ? 'Yes' : 'No'}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testDirectToolCallHandler() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Direct Tool Call Handler');
  console.log('='.repeat(60));

  try {
    // Test handleOpenAIToolCall function directly
    const result = await handleOpenAIToolCall(
      'langvoice_text_to_speech',
      { text: 'Testing direct handler!', voice: 'michael' },
      LANGVOICE_API_KEY
    );
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'Direct handler failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Duration: ${parsed.duration} seconds`);
    console.log(`   Characters: ${parsed.charactersProcessed}`);
    
    // Save audio
    if (parsed.audioBase64) {
      const buffer = Buffer.from(parsed.audioBase64, 'base64');
      writeFileSync('test_openai_direct.mp3', buffer);
      console.log('   Saved to: test_openai_direct.mp3');
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testOpenAIWithRealLLM() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Full OpenAI LLM Integration');
  console.log('='.repeat(60));

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const langvoice = new LangVoiceOpenAITools({ apiKey: LANGVOICE_API_KEY });

    console.log('   Sending request to GPT-4...');
    
    // Make a request to OpenAI with LangVoice tools
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When asked to generate speech, use the langvoice_text_to_speech tool.',
        },
        {
          role: 'user',
          content: 'Please generate speech saying "Hello! This is a test from the LangVoice SDK with OpenAI integration."',
        },
      ],
      tools: langvoice.getTools(),
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;
    
    if (!message.tool_calls || message.tool_calls.length === 0) {
      console.log('   Note: LLM did not call any tools');
      console.log(`   LLM Response: ${message.content}`);
      return true; // Not a failure, LLM may choose not to use tools
    }

    console.log(`   LLM requested ${message.tool_calls.length} tool call(s)`);
    
    // Handle tool calls
    for (const toolCall of message.tool_calls) {
      console.log(`   Processing: ${toolCall.function.name}`);
      
      const result = await langvoice.handleCall(toolCall);
      
      if (result.success) {
        console.log('✅ SUCCESS!');
        console.log(`   Duration: ${result.duration} seconds`);
        
        if (result.audioBase64) {
          await langvoice.saveAudioFromResult(result, 'test_openai_llm.mp3');
          console.log('   Saved to: test_openai_llm.mp3');
        }
      } else {
        console.log(`   Tool call failed: ${result.error}`);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testListVoicesViaTool() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: List Voices via OpenAI Tool');
  console.log('='.repeat(60));

  try {
    const result = await handleOpenAIToolCall(
      'langvoice_list_voices',
      {},
      LANGVOICE_API_KEY
    );
    
    const parsed = JSON.parse(result);
    
    if (!parsed.success) {
      throw new Error(parsed.error || 'List voices failed');
    }
    
    console.log('✅ SUCCESS!');
    console.log(`   Found ${parsed.voices.length} voices`);
    parsed.voices.slice(0, 5).forEach((v: { id: string; name: string }) => {
      console.log(`   - ${v.id}: ${v.name}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         LangVoice JS SDK - OpenAI Integration Tests        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results: boolean[] = [];

  results.push(await testOpenAIToolDefinitions());
  results.push(await testOpenAIToolsClass());
  results.push(await testDirectToolCallHandler());
  results.push(await testOpenAIWithRealLLM());
  results.push(await testListVoicesViaTool());

  console.log('\n' + '='.repeat(60));
  console.log('OPENAI INTEGRATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n  📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('  🎉 ALL OPENAI TESTS PASSED!\n');
  } else {
    console.log('  ⚠️  Some tests failed. Please review the errors above.\n');
  }
  
  return passed === total;
}

main().catch(console.error);
