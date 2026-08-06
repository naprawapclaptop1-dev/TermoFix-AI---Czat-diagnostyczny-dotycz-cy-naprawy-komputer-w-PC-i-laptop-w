import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import React from 'react';

async function run() {
  try {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    const AppMod = await vite.ssrLoadModule('/src/App.tsx');
    console.log("Successfully loaded App.tsx");
    const App = AppMod.default || AppMod.App;
    
    // We can't easily render it if it uses browser globals heavily, but let's try
    // renderToString(React.createElement(App));
    // console.log("Render successful");
  } catch (e) {
    console.error("Error loading app:", e);
  }
  process.exit(0);
}
run();
