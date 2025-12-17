/**
 * LangVoice SDK - OpenAI Integration Example
 */

import OpenAI from 'openai';
import { writeFileSync } from 'fs';
import { LangVoiceOpenAITools } from 'langvoice-sdk/tools';

// Set your API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key';
const LANGVOICE_API_KEY = process.env.LANGVOICE_API_KEY || 'your-langvoice-api-key';

async function main() {
  // Initialize clients
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const langvoice = new LangVoiceOpenAITools({ apiKey: LANGVOICE_API_KEY });

  console.log('=' .repeat(50));
  console.log('OpenAI + LangVoice Integration');
  console.log('=' .repeat(50));

  // Make request with LangVoice tools
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: 'Generate speech saying: Hello! Welcome to LangVoice SDK.',
      },
    ],
    tools: langvoice.getTools(),
  });

  console.log(`OpenAI Response: ${response.choices[0].message.content || '(tool call)'}`);
  console.log(`Tool Calls: ${response.choices[0].message.tool_calls?.length || 0}`);

  // Handle tool calls
  if (response.choices[0].message.tool_calls) {
    for (const toolCall of response.choices[0].message.tool_calls) {
      console.log(`\n🔧 Tool: ${toolCall.function.name}`);
      console.log(`   Arguments: ${toolCall.function.arguments}`);

      // Handle tool call - API key already configured!
      const result = await langvoice.handleCall(toolCall);

      console.log(`\n📊 Result:`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Duration: ${result.duration} seconds`);
      console.log(`   Characters: ${result.charactersProcessed}`);

      // Save audio to file
      if (await langvoice.saveAudioFromResult(result, 'output.mp3')) {
        console.log(`\n✅ Audio saved to output.mp3`);
      }
    }
  } else {
    console.log('\n❌ No tool calls were made by the model.');
  }
}

main().catch(console.error);
