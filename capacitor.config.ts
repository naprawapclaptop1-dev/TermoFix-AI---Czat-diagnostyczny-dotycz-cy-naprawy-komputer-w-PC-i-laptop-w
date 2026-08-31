import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.naprawapclaptop.boardviewproai2026',
  appName: 'BoardView PRO AI 2026',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#020617'
  }
};

export default config;
