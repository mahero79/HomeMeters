import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.homemeterspro.app',
  appName: 'Home Meters Pro',
  webDir: 'www',
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: 'http',
    cleartext: true,
    hostname: 'localhost'
  }
};
export default config;
