import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hati2.cloud',
  appName: 'Hati2 Cloud',
  webDir: 'out',
  server: {
    // For development: Use your local network IP
    // url: 'http://192.168.0.108:3000',
    // For production: Vercel deployment
    url: 'https://hati-2-cloud.vercel.app',
    cleartext: true // Allow HTTP for development
  },
  android: {
    allowMixedContent: true
  }
};

export default config;

