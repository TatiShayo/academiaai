// Global setup for Vitest
const store: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = String(value);
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k in store) delete store[k];
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() {
    return Object.keys(store).length;
  },
};

const g = globalThis as Record<string, unknown>;

if (typeof g.window === "undefined") {
  g.window = globalThis;
}

if (typeof g.localStorage === "undefined") {
  g.localStorage = localStorageMock;
}

export {};
