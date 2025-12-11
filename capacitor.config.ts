import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.markease.app',
  appName: 'MarkEase AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;