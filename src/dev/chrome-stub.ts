// Stubs chrome APIs so the popup UI works in a normal browser tab during dev.
// chrome.runtime.sendMessage → immediately returns a mock response
// chrome.storage.local       → backed by localStorage

const STORAGE_KEY = "__chrome_storage__";

function readStore(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}
function writeStore(data: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

(window as any).chrome = {
  runtime: {
    sendMessage(_msg: unknown, cb: (res: unknown) => void) {
      // Simulate a short delay then return empty results so the UI doesn't hang
      setTimeout(() => cb({ results: [] }), 800);
    },
  },
  storage: {
    local: {
      async get(key: string) {
        return { [key]: readStore()[key] };
      },
      async set(items: Record<string, unknown>) {
        writeStore({ ...readStore(), ...items });
      },
      async remove(key: string) {
        const data = readStore();
        delete data[key];
        writeStore(data);
      },
    },
  },
};
