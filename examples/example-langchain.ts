/**
 * LangVoice SDK - LangChain Integration Example
 *
 * This example demonstrates how to use LangVoice with LangChain agents.
 *
 * Prerequisites:
 *   npm install langvoice-sdk @langchain/core @langchain/openai langchain
 *
 * Run:
 *   npx ts-node examples/example-langchain.ts
 */

import { writeFileSync } from 'fs';
import {
  LangVoiceLangChainToolkit,
  LangVoiceTTSTool,
  LangVoiceVoicesTool,
} from 'langvoice-sdk/tools';

// API Keys
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY || 'your-langvoice-api-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key';

// ============================================
// Example 1: Basic Tool Usage
// ============================================

async function basicToolUsage() {
  console.log('='.repeat(60));
  console.log('Example 1: Basic LangChain Tool Usage');
  console.log('='.repeat(60));

  // Create individual tools
  const ttsTool = new LangVoiceTTSTool({
    apiKey: LANGVOICE_API_KEY,
    outputFile: 'langchain_output.mp3',
  });

  // Call the tool directly
  const result = await ttsTool.call({
    text: 'Hello from LangChain! This is a test of the LangVoice integration.',
    voice: 'heart',
    language: 'american_english',
    speed: 1.0,
  });

  console.log(`\n📢 TTS Tool Result:\n${result}`);
}

// ============================================
// Example 2: Using the Toolkit
// ============================================

async function toolkitUsage() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: LangVoice Toolkit');
  console.log('='.repeat(60));

  // Create toolkit with all tools
  const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });

  // Get all tools
  const tools = toolkit.getTools();
  console.log(`\n📦 Available tools: ${tools.map((t) => t.name).join(', ')}`);

  // Use the voices tool
  const voicesTool = toolkit.getVoicesTool();
  const voicesResult = await voicesTool.call({});
  console.log(`\n🎤 ${voicesResult}`);

  // Use the languages tool
  const languagesTool = toolkit.getLanguagesTool();
  const languagesResult = await languagesTool.call({});
  console.log(`\n🌍 ${languagesResult}`);

  // Use TTS tool with custom output
  const ttsTool = toolkit.getTTSTool('toolkit_output.mp3');
  const ttsResult = await ttsTool.call({
    text: 'This audio was generated using the LangVoice toolkit!',
    voice: 'michael',
  });
  console.log(`\n🔊 ${ttsResult}`);
}

// ============================================
// Example 3: Multi-Voice Tool
// ============================================

async function multiVoiceExample() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 3: Multi-Voice Generation');
  console.log('='.repeat(60));

  const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });
  const multiVoiceTool = toolkit.getMultiVoiceTool();

  const result = await multiVoiceTool.call({
    text: '[heart] Welcome to our podcast about AI! [michael] Thanks for having me. [heart] Let\'s dive into today\'s topic. [michael] I\'m excited to discuss this!',
    language: 'american_english',
    speed: 1.0,
  });

  console.log(`\n🎭 Multi-Voice Result:\n${result}`);
}

// ============================================
// Example 4: With LangChain Agent (requires @langchain/openai)
// ============================================

async function agentExample() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 4: LangChain Agent Integration');
  console.log('='.repeat(60));

  try {
    // Dynamic imports for optional dependencies
    const { ChatOpenAI } = await import('@langchain/openai');
    const { AgentExecutor, createOpenAIFunctionsAgent } = await import('langchain/agents');
    const { ChatPromptTemplate, MessagesPlaceholder } = await import('@langchain/core/prompts');

    // Create LangVoice toolkit
    const toolkit = new LangVoiceLangChainToolkit({ apiKey: LANGVOICE_API_KEY });
    const tools = toolkit.getTools();

    // Create LLM
    const llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY,
    });

    // Create prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant that can generate speech using LangVoice TTS. When asked to generate speech, use the available tools.'],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    // Create agent
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools: tools as any, // Type cast for compatibility
      prompt,
    });

    // Create executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools: tools as any,
      verbose: true,
    });

    // Run agent
    console.log('\n🤖 Running agent...\n');
    const result = await agentExecutor.invoke({
      input: 'Generate speech saying "Hello! I am an AI assistant powered by LangVoice." using the heart voice.',
    });

    console.log(`\n✅ Agent Result: ${result.output}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      console.log('\n⚠️  LangChain agent example requires additional dependencies:');
      console.log('   npm install @langchain/openai langchain');
      console.log('\n   Skipping agent example...');
    } else {
      throw error;
    }
  }
}

// ============================================
// Example 5: String Input (Simple Usage)
// ============================================

async function simpleStringInput() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 5: Simple String Input');
  console.log('='.repeat(60));

  const ttsTool = new LangVoiceTTSTool({
    apiKey: LANGVOICE_API_KEY,
    outputFile: 'simple_string.mp3',
  });

  // Tools accept simple string input
  const result = await ttsTool.call('This is a simple string input test!');
  console.log(`\n📢 Result: ${result}`);
}

// ============================================
// Example 6: Error Handling
// ============================================

async function errorHandlingExample() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 6: Error Handling');
  console.log('='.repeat(60));

  const ttsTool = new LangVoiceTTSTool({
    apiKey: 'invalid-api-key', // Intentionally invalid
    outputFile: 'error_test.mp3',
  });

  // The tool handles errors gracefully
  const result = await ttsTool.call({
    text: 'This should fail gracefully.',
  });

  console.log(`\n⚠️  Result (expected error): ${result}`);
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n🎤 LangVoice SDK - LangChain Integration Examples\n');

  try {
    await basicToolUsage();
    await toolkitUsage();
    await multiVoiceExample();
    await simpleStringInput();
    
    // Agent example (may skip if dependencies not installed)
    await agentExample();
    
    // Uncomment to test error handling
    // await errorHandlingExample();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();
