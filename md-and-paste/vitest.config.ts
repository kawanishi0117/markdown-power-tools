import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // vscode モジュールをモックに差し替え
      vscode: './src/__mocks__/vscode.ts',
    },
  },
});
