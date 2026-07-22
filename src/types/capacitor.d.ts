interface CapacitorPlugin {
  addListener(eventName: string, listenerFunc: () => void): void;
  exitApp(): void;
}

interface CapacitorPlugins {
  App: CapacitorPlugin;
}

interface Capacitor {
  Plugins: CapacitorPlugins;
}

declare global {
  interface Window {
    Capacitor?: Capacitor;
  }
}
