import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.homemeters.app',
  appName: 'Home Meters',
  webDir: 'www',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  server: {
    androidScheme: 'http',
    cleartext: true,
    hostname: 'localhost'
  }
};
export default config;