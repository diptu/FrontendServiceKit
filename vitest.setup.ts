import "@testing-library/jest-dom/vitest";

// jsdom's atob/btoa support varies by version -- core/auth/authService.ts's
// JWT decode relies on window.atob, so this polyfills it defensively rather
// than depending on whatever jsdom happens to ship.
if (typeof globalThis.atob !== "function") {
  globalThis.atob = (data: string) => Buffer.from(data, "base64").toString("latin1");
}

if (typeof globalThis.btoa !== "function") {
  globalThis.btoa = (data: string) => Buffer.from(data, "latin1").toString("base64");
}
