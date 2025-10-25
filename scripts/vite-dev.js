#!/usr/bin/env node
// Small wrapper to ensure Node's Web Crypto is available as globalThis.crypto
// before starting Vite's dev server. This prevents errors like:
// "TypeError: crypto$2.getRandomValues is not a function" when Vite
// expects a browser-style crypto API.

import { webcrypto } from 'node:crypto';

// Ensure a browser-like getRandomValues is available.
// Some Node versions already expose globalThis.crypto (readonly getter),
// others don't. Try a safe augmentation strategy:
try {
  if (typeof globalThis.crypto === 'undefined') {
    // No global crypto object — define it.
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
      enumerable: false,
      writable: false,
    });
  } else if (typeof globalThis.crypto.getRandomValues !== 'function') {
    // crypto exists but missing getRandomValues — try to attach it.
    try {
      // If the object is extensible, this will succeed.
      globalThis.crypto.getRandomValues = webcrypto.getRandomValues;
    } catch (attachErr) {
      // As a last resort, create a small proxy object and replace the property
      // only if it's configurable.
      try {
        const origDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
        if (!origDescriptor || origDescriptor.configurable) {
          Object.defineProperty(globalThis, 'crypto', {
            value: webcrypto,
            configurable: true,
            enumerable: false,
            writable: false,
          });
        } else {
          console.warn('globalThis.crypto exists and is not configurable; could not attach getRandomValues.');
        }
      } catch (dErr) {
        console.warn('Could not define globalThis.crypto:', dErr);
      }
    }
  }
} catch (err) {
  // Defensive: if setting globalThis.crypto fails (eg. getter-only), proceed and let
  // Vite fail with the original error; surface a helpful message.
  console.warn('Warning: failed to polyfill globalThis.crypto, continuing — error may persist.', err);
}

import { createServer } from 'vite';

async function start() {
  try {
    const server = await createServer();
    await server.listen();
    server.printUrls();
  } catch (err) {
    console.error('Failed to start Vite dev server:', err);
    process.exit(1);
  }
}

start();
