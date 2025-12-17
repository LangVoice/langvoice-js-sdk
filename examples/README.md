# LangVoice SDK - Examples

This directory contains examples for using the LangVoice JavaScript/TypeScript SDK.

## 🚀 Quick Start

```bash
# Install dependencies
npm install langvoice-sdk

# Set your API key
export LANGVOICE_API_KEY="your-api-key"

# Run examples
npx ts-node examples/basic-usage.ts
```

## 📁 Examples

| File | Description | Dependencies |
|------|-------------|--------------|
| `basic-usage.ts` | Basic TTS generation, multi-voice, listing resources | None |
| `example-openai.ts` | OpenAI function calling integration | `openai` |
| `example-langchain.ts` | LangChain agent integration | `@langchain/core`, `@langchain/openai` |
| `example-autogen.ts` | AutoGen-style function calling | None |
| `example-generic.ts` | Universal toolkit for any framework | None |

## 🔧 Running Examples

```bash
# Basic usage
npx ts-node examples/basic-usage.ts

# OpenAI integration (requires OPENAI_API_KEY)
export OPENAI_API_KEY="your-openai-key"
npx ts-node examples/example-openai.ts

# LangChain integration (requires additional packages)
npm install @langchain/core @langchain/openai langchain
npx ts-node examples/example-langchain.ts

# AutoGen-style integration
npx ts-node examples/example-autogen.ts

# Generic toolkit
npx ts-node examples/example-generic.ts
```

## 📦 Optional Dependencies

```bash
# For OpenAI examples
npm install openai

# For LangChain examples
npm install @langchain/core @langchain/openai langchain
```

## 🎯 Which Example Should I Use?

- **Just want TTS?** → `basic-usage.ts`
- **Using OpenAI GPT?** → `example-openai.ts`
- **Using LangChain agents?** → `example-langchain.ts`
- **Using AutoGen agents?** → `example-autogen.ts`
- **Building custom integration?** → `example-generic.ts`