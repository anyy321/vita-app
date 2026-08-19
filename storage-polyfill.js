// Polyfill for window.storage (Claude-artifact-only API) using browser localStorage.
// Mimics: get(key, shared), set(key, value, shared), delete(key, shared), list(prefix, shared)
if (typeof window !== "undefined" && !window.storage) {
  const PREFIX = "vita-app:";

  window.storage = {
    async get(key) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw === null) return null;
        return { key, value: raw, shared: false };
      } catch (e) {
        return null;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, value);
        return { key, value, shared: false };
      } catch (e) {
        return null;
      }
    },
    async delete(key) {
      try {
        localStorage.removeItem(PREFIX + key);
        return { key, deleted: true, shared: false };
      } catch (e) {
        return null;
      }
    },
    async list(prefix = "") {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(PREFIX + prefix)) {
            keys.push(k.slice(PREFIX.length));
          }
        }
        return { keys, prefix, shared: false };
      } catch (e) {
        return null;
      }
    },
  };
}
