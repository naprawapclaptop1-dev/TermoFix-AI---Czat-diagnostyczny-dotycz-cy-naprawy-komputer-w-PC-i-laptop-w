import fs from 'fs';
import { createServer } from 'vite';

async function run() {
  try {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    const module = await vite.ssrLoadModule('/src/main.tsx');
    console.log("Successfully loaded main.tsx");
  } catch (e) {
    console.error("Error loading app:", e);
  }
  process.exit(0);
}
run();
