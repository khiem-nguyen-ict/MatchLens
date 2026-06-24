// Configuration for MatchLens Chrome Extension
// Copy this file to config.local.js and fill in your values
// config.local.js is gitignored and should NOT be committed

const CONFIG = {
  SUPABASE_PUBLISHABLE_KEY: "YOUR_SUPABASE_PUBLISHABLE_KEY_HERE",
};

// Export for use in service worker
self.CONFIG = CONFIG;