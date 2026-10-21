const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = (input, init) => {
  if (typeof window !== 'undefined') {
    const url = new URL(input instanceof Request ? input.url : input, window.location.href);
    if (url.origin === window.location.origin) return originalFetch(input, init);
  }
  throw new Error('Network access is not allowed in tests');
};
