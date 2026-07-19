import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unibeat.music',
  appName: 'UniBeat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'music.163.com',
      '*.music.126.net',
      '*.music.163.com',
      'api.qrserver.com',
      '*',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#0A0E1A',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      backgroundColor: '#0A0E1A',
      style: 'Dark',
    },
  },
};

export default config;
