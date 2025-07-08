// Polyfills for Node.js compatibility in browser environment

// Global polyfill
if (typeof global === "undefined") {
  (window as any).global = window;
}

// Process polyfill
if (typeof process === "undefined") {
  (window as any).process = { env: {} };
}

// Buffer polyfill (if not already provided)
if (typeof Buffer === "undefined") {
  import("buffer").then(({ Buffer }) => {
    (window as any).Buffer = Buffer;
  });
}

export {};
