import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.naprawapc.termofixai',
  appName: 'TermoFix AI',
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
