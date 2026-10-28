import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: 'EasyApply',
    description: 'Local-first job application tracker for LinkedIn',
    version: '0.1.0',
    permissions: ['storage', 'tabs'],
    host_permissions: [
      'https://www.linkedin.com/*',
      'https://api.openai.com/*',
      'https://api.anthropic.com/*',
      'https://generativelanguage.googleapis.com/*',
      'https://raw.githubusercontent.com/*',
    ],
  },
});
