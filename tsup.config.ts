import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'tools/index': 'src/tools/index.ts',
    'tools/types': 'src/tools/types.ts',
    'tools/openai-tools': 'src/tools/openai-tools.ts',
    'tools/langchain-tools': 'src/tools/langchain-tools.ts',
    'tools/autogen-tools': 'src/tools/autogen-tools.ts',
    'tools/generic-tools': 'src/tools/generic-tools.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['openai', '@langchain/core'],
});
