<h1 align="center">🎤 LangVoice JavaScript/TypeScript SDK</h1>

<p align="center">
  <img src="https://i.ibb.co/svWyWcR6/logo.png" alt="LangVoice Logo" width="400"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/langvoice-sdk"><img src="https://img.shields.io/npm/v/langvoice-sdk.svg" alt="npm version"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript 5.0+"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-16+-green.svg" alt="Node.js 16+"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center">
  The official JavaScript/TypeScript SDK for <a href="https://www.langvoice.pro/">LangVoice</a> - Professional Text-to-Speech API with natural-sounding voices, multi-language support, and seamless AI agent integration.
</p>

---

## ✨ Features

- 🗣️ **28+ Natural Voices** - Male and female voices with unique personalities
- 🌍 **9 Languages** - American English, British English, Spanish, French, Hindi, Italian, Japanese, Portuguese, Chinese
- 🎭 **Multi-Voice Synthesis** - Multiple voices in a single audio using bracket notation
- ⚡ **Full TypeScript Support** - Complete type definitions for excellent DX
- 🤖 **AI Agent Integration** - Ready-to-use tools for OpenAI, LangChain, AutoGen, and more
- 🌐 **Universal** - Works in Node.js and browsers
- 📦 **Zero Dependencies** - Lightweight core with optional peer dependencies

---

## 📦 Installation

```bash
npm install langvoice-sdk
```

With optional dependencies for AI integrations:
```bash
# For OpenAI integration
npm install langvoice-sdk openai

# For LangChain integration
npm install langvoice-sdk @langchain/core @langchain/openai
```

---

## 🚀 Quick Start

### Get Your API Key

1. Visit [https://www.langvoice.pro/](https://www.langvoice.pro/)
2. Sign up and get your API key
3. Set it as an environment variable or pass it directly

```bash
export LANGVOICE_API_KEY="your-api-key"
```

---

## 📖 Basic Usage

### Generate Speech

```typescript
import { LangVoiceClient } from 'langvoice-sdk';
import { writeFileSync } from 'fs';

// Initialize client
const client = new LangVoiceClient({ apiKey: 'your-api-key' });
// Or set LANGVOICE_API_KEY environment variable

// Generate speech
const response = await client.generate({
  text: 'Hello, world! Welcome to LangVoice.',
  voice: 'heart',
  language: 'american_english',
  speed: 1.0,
});

// Save to file
writeFileSync('output.mp3', response.audioData);

console.log(`Duration: ${response.duration}s`);
console.log(`Characters: ${response.charactersProcessed}`);
```

### Multi-Voice Generation

Create conversations or podcasts with multiple voices:

```typescript
import { LangVoiceClient } from 'langvoice-sdk';
import { writeFileSync } from 'fs';

const client = new LangVoiceClient({ apiKey: 'your-api-key' });

// Use [voice_name] to switch voices
const response = await client.generateMultiVoice({
  text: '[heart] Welcome to our podcast! [michael] Thanks for having me! [heart] Let\'s get started.',
  language: 'american_english',
});

writeFileSync('podcast.mp3', response.audioData);
```

### Voice Cloning

Clone any voice from an audio sample:

```typescript
import { LangVoiceClient } from 'langvoice-sdk';
import { readFileSync, writeFileSync } from 'fs';

const client = new LangVoiceClient({ apiKey: 'your-api-key' });

// Read your voice sample
const voiceSample = readFileSync('sample.wav');
const voiceSampleBase64 = voiceSample.toString('base64');

// Clone and generate
const response = await client.generateCloned({
  text: 'Hello, this is my cloned voice speaking!',
  voiceSampleBase64: voiceSampleBase64,
  speed: 1.0,
});

writeFileSync('cloned.mp3', response.audioData);
console.log(`Generated in ${response.generationTime}s`);
```

### Simple One-Liner

```typescript
import { LangVoiceClient } from 'langvoice-sdk';
import { writeFileSync } from 'fs';

const client = new LangVoiceClient({ apiKey: 'your-api-key' });

// Simple text-to-speech
const audioBuffer = await client.textToSpeech('Hello!', 'heart');
writeFileSync('simple.mp3', audioBuffer);
```

### List Available Voices

```typescript
import { LangVoiceClient } from 'langvoice-sdk';

const client = new LangVoiceClient({ apiKey: 'your-api-key' });

const voices = await client.listVoices();
for (const voice of voices) {
  console.log(`${voice.id}: ${voice.name}`);
}
```

**Output:**
```
heart: Heart
bella: Bella
michael: Michael
...
```

### List Supported Languages

```typescript
import { LangVoiceClient } from 'langvoice-sdk';

const client = new LangVoiceClient({ apiKey: 'your-api-key' });

const languages = await client.listLanguages();
for (const lang of languages) {
  console.log(`${lang.id}: ${lang.name}`);
}
```

**Output:**
```
american_english: American English
british_english: British English
spanish: Spanish
french: French
hindi: Hindi
italian: Italian
japanese: Japanese
brazilian_portuguese: Brazilian Portuguese
mandarin_chinese: Mandarin Chinese
```

---

## 🤖 AI Agent Integration

LangVoice integrates seamlessly with popular AI agent frameworks.

### OpenAI Function Calling

```typescript
import OpenAI from 'openai';
import { LangVoiceOpenAITools } from 'langvoice-sdk/tools';

// Initialize clients
const openai = new OpenAI({ apiKey: 'your-openai-key' });
const langvoice = new LangVoiceOpenAITools({ apiKey: 'your-langvoice-key' });

// Make request with LangVoice tools
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Generate speech saying: Hello World!' }],
  tools: langvoice.getTools(), // 4 tools available
});

console.log(`Tools available: ${langvoice.getTools().length}`);

// Handle tool calls
if (response.choices[0].message.tool_calls) {
  for (const toolCall of response.choices[0].message.tool_calls) {
    console.log(`🔧 ${toolCall.function.name}`);
    
    const result = await langvoice.handleCall(toolCall);
    
    console.log(`   Success: ${result.success}`);
    console.log(`   Duration: ${result.duration}s`);
    
    // Save audio
    if (await langvoice.saveAudioFromResult(result, 'output.mp3')) {
      console.log('   ✅ Saved to output.mp3');
    }
  }
}
```

### LangChain Integration

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { DynamicTool } from '@langchain/core/tools';
import { LangVoiceLangChainToolkit } from 'langvoice-sdk/tools';

// Initialize toolkit
const toolkit = new LangVoiceLangChainToolkit({ apiKey: 'your-langvoice-key' });

// Get TTS tool
const ttsTool = toolkit.getTTSTool('output.mp3');

// Create LangChain DynamicTool
const tool = new DynamicTool({
  name: 'speak',
  description: 'Generate speech from text',
  func: async (input: string) => await ttsTool.call(input),
});

// Create model and bind tools
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  openAIApiKey: 'your-openai-key',
});

const modelWithTools = model.bindTools([tool]);

// Invoke
const response = await modelWithTools.invoke([
  new SystemMessage('You can generate speech using the speak tool.'),
  new HumanMessage('Say hello to the world!'),
]);

// Handle tool calls
if (response.tool_calls && response.tool_calls.length > 0) {
  for (const tc of response.tool_calls) {
    const result = await tool.invoke(tc.args.input);
    console.log('Audio generated and saved!');
  }
}
```

### AutoGen Integration

```typescript
import { LangVoiceAutoGenTools } from 'langvoice-sdk/tools';

// Initialize toolkit
const tools = new LangVoiceAutoGenTools({
  apiKey: 'your-langvoice-key',
  autoSave: true,
  outputFile: 'output.mp3',
});

// Get function definitions for AutoGen config
const functionDefs = tools.getFunctionDefinitions();
console.log(`Functions: ${functionDefs.map(f => f.name).join(', ')}`);

// Get function map for registration
const functionMap = tools.getFunctionMap();

// Handle function calls
const result = await tools.handleFunctionCall({
  name: 'langvoice_text_to_speech',
  arguments: { text: 'Hello from AutoGen!', voice: 'heart' },
});

console.log(result); // Audio saved to output.mp3
```

### Generic/Universal Toolkit

Works with ANY AI framework (LlamaIndex, Semantic Kernel, Haystack, custom frameworks):

```typescript
import { LangVoiceToolkit } from 'langvoice-sdk/tools';

// Initialize toolkit
const toolkit = new LangVoiceToolkit({ apiKey: 'your-langvoice-key' });

// Direct usage
const result = await toolkit.textToSpeech({
  text: 'Hello from LangVoice!',
  voice: 'heart',
  language: 'american_english',
});
await toolkit.saveAudio(result, 'output.mp3');
console.log(`Duration: ${result.duration}s`);

// Multi-voice
const multiResult = await toolkit.multiVoiceSpeech({
  text: '[heart] Hello! [michael] Hi there!',
});
await toolkit.saveAudio(multiResult, 'conversation.mp3');

// List resources
const voicesResult = await toolkit.listVoices();
const languagesResult = await toolkit.listLanguages();

// Handle tool calls from any LLM
const result2 = await toolkit.handleToolCall('langvoice_text_to_speech', {
  text: 'Hello!',
  voice: 'nova',
});

// Get OpenAI-compatible schemas for any framework
const schemas = toolkit.getFunctionSchemas();
const openaiTools = toolkit.getOpenAITools();
```

---

## 🎤 Available Voices

### Female Voices
| ID | Name | Accent |
|----|------|--------|
| heart | Heart | American |
| bella | Bella | American |
| nicole | Nicole | American |
| sarah | Sarah | American |
| nova | Nova | American |
| sky | Sky | American |
| jessica | Jessica | American |
| river | River | American |
| aoede | Aoede | American |
| kore | Kore | American |
| alloy | Alloy | American |
| emma | Emma | British |
| isabella | Isabella | British |
| alice | Alice | British |
| lily | Lily | British |

### Male Voices
| ID | Name | Accent |
|----|------|--------|
| michael | Michael | American |
| fenrir | Fenrir | American |
| eric | Eric | American |
| liam | Liam | American |
| onyx | Onyx | American |
| adam | Adam | American |
| puck | Puck | American |
| echo | Echo | American |
| santa | Santa | American |
| george | George | British |
| fable | Fable | British |
| lewis | Lewis | British |
| daniel | Daniel | British |

---

## 🌍 Supported Languages

| ID | Name |
|----|------|
| american_english | American English |
| british_english | British English |
| spanish | Spanish |
| french | French |
| hindi | Hindi |
| italian | Italian |
| japanese | Japanese |
| brazilian_portuguese | Brazilian Portuguese |
| mandarin_chinese | Mandarin Chinese |

---

## 🔧 API Reference

### LangVoiceClient

```typescript
const client = new LangVoiceClient({
  apiKey: 'your-key',     // Or use LANGVOICE_API_KEY env var
  baseUrl: undefined,     // Custom API URL (optional)
  timeout: 60000,         // Request timeout in ms
});
```

### Methods

| Method | Description |
|--------|-------------|
| `generate(options)` | Generate speech from text |
| `generateMultiVoice(options)` | Multi-voice generation |
| `listVoices()` | Get available voices |
| `listLanguages()` | Get supported languages |
| `textToSpeech(text, voice, language, speed)` | Simple TTS (returns Buffer) |

### GenerateResponse

```typescript
response.audioData          // Buffer - MP3 audio data
response.duration           // number - Duration in seconds
response.generationTime     // number - Generation time
response.charactersProcessed // number - Characters processed

// Utility methods
response.toBase64()         // string - Base64 encoded audio
response.toUint8Array()     // Uint8Array - For browser compatibility
response.toArrayBuffer()    // ArrayBuffer - For browser compatibility
```

---

## 🛠️ AI Tools Reference

### Available Tools

All AI integrations provide these 4 tools:

| Tool Name | Description |
|-----------|-------------|
| `langvoice_text_to_speech` | Convert text to speech |
| `langvoice_multi_voice_speech` | Multi-voice generation |
| `langvoice_list_voices` | List available voices |
| `langvoice_list_languages` | List supported languages |

### Toolkit Classes

| Framework | Class | Import |
|-----------|-------|--------|
| OpenAI | `LangVoiceOpenAITools` | `import { LangVoiceOpenAITools } from 'langvoice-sdk/tools'` |
| LangChain | `LangVoiceLangChainToolkit` | `import { LangVoiceLangChainToolkit } from 'langvoice-sdk/tools'` |
| AutoGen | `LangVoiceAutoGenTools` | `import { LangVoiceAutoGenTools } from 'langvoice-sdk/tools'` |
| Generic | `LangVoiceToolkit` | `import { LangVoiceToolkit } from 'langvoice-sdk/tools'` |

---

## 📁 Examples

Check the `examples/` directory for complete working examples:

- `basic-usage.ts` - Basic TTS and multi-voice generation
- `example-openai.ts` - OpenAI function calling integration
- `example-langchain.ts` - LangChain agent integration
- `example-autogen.ts` - Microsoft AutoGen integration
- `example-generic.ts` - Universal/generic usage

### Running Examples

```bash
# Set API keys
export LANGVOICE_API_KEY="your-langvoice-key"
export OPENAI_API_KEY="your-openai-key"

# Run an example
npx tsx examples/basic-usage.ts
```

---

## 🔗 Links

- **Website**: [https://www.langvoice.pro/](https://www.langvoice.pro/)
- **Get API Key**: [https://www.langvoice.pro/](https://www.langvoice.pro/)
- **API Documentation**: [https://www.langvoice.pro/docs](https://www.langvoice.pro/docs)
- **GitHub**: [https://github.com/LangVoice/langvoice-js-sdk](https://github.com/LangVoice/langvoice-js-sdk)
- **npm**: [https://www.npmjs.com/package/langvoice-sdk](https://www.npmjs.com/package/langvoice-sdk)
- **LinkedIn**: [https://www.linkedin.com/company/langvoice](https://www.linkedin.com/company/langvoice)
- **Email**: langvoice.official@gmail.com

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? We'd love to hear from you!

- **GitHub Issues**: [https://github.com/LangVoice/langvoice-js-sdk/issues](https://github.com/LangVoice/langvoice-js-sdk/issues)
- **Email**: langvoice.official@gmail.com

When reporting bugs, please include:
- Node.js version
- SDK version (`npm list langvoice-sdk`)
- Error message and stack trace
- Minimal code to reproduce the issue

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ by <a href="https://www.langvoice.pro/">LangVoice</a>
</p>

<p align="center">
  <a href="https://www.langvoice.pro/">Website</a> •
  <a href="https://github.com/LangVoice/langvoice-js-sdk">GitHub</a> •
  <a href="https://www.npmjs.com/package/langvoice-sdk">npm</a> •
  <a href="https://www.linkedin.com/company/langvoice">LinkedIn</a>
</p>