/**
 * =========================================================================
 * Tasty Nest - Firebase & Cloud Integration Configuration
 * =========================================================================
 * Connects your Tasty Nest website to Firebase Firestore (for live multi-user recipes)
 * and Google Drive via Google Apps Script (for < 1MB compressed media storage).
 *
 * NOTE: You can paste your keys directly below OR save them easily inside the
 * Tasty Nest Admin Control Center -> "Cloud & Drive Settings" modal.
 * =========================================================================
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCiTva3bKWkK3qDNe7lDmV-vngfSkIfRdQ",
  authDomain: "tasty-nest-app.firebaseapp.com",
  projectId: "tasty-nest-app",
  storageBucket: "tasty-nest-app.firebasestorage.app",
  messagingSenderId: "242233457387",
  appId: "1:242233457387:web:c0dc43565b75077afbdcae"
};

// User's deployed Google Apps Script Web App URL for Google Drive uploads
const DEFAULT_GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxRMh_3_-YmF2GqdyT7z6UfmNvX8ybcregXgZvv5z1luo9XmPXGLX-MZz8IXcnLy68k/exec";

const TastyConfig = {
  storageKey: "tasty_cloud_config_v1",

  /**
   * Retrieves active config (local storage override or defaults)
   */
  getConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedFb = parsed.firebase || {};
        // If stored config has dummy/placeholder apiKey, use new real DEFAULT_FIREBASE_CONFIG
        const isDummy = !storedFb.apiKey || storedFb.apiKey.includes("PASTE_YOUR") || (storedFb.projectId && storedFb.projectId.includes("demo"));
        const storedGas = parsed.googleAppsScriptUrl || '';
        const isGasDummy = !storedGas || storedGas.includes("YOUR_GOOGLE_APPS_SCRIPT");
        return {
          firebase: isDummy ? { ...DEFAULT_FIREBASE_CONFIG } : { ...DEFAULT_FIREBASE_CONFIG, ...storedFb },
          googleAppsScriptUrl: isGasDummy ? DEFAULT_GOOGLE_APPS_SCRIPT_URL : storedGas
        };
      }
    } catch (e) {
      console.warn("[TastyConfig] Error reading config from localStorage", e);
    }

    return {
      firebase: { ...DEFAULT_FIREBASE_CONFIG },
      googleAppsScriptUrl: DEFAULT_GOOGLE_APPS_SCRIPT_URL
    };
  },

  /**
   * Saves updated Firebase & Google Apps Script configuration
   */
  saveConfig(newConfig) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(newConfig));
      console.log("[TastyConfig] Cloud settings successfully saved to localStorage");
      // Re-initialize Firebase with updated config
      return this.initFirebase();
    } catch (e) {
      console.error("[TastyConfig] Failed to save config:", e);
      throw e;
    }
  },

  /**
   * Checks if Firebase is configured with real credentials (not placeholders)
   */
  isFirebaseConfigured() {
    const config = this.getConfig();
    const fb = config.firebase;
    return !!(
      fb &&
      fb.apiKey &&
      !fb.apiKey.includes("PASTE_YOUR") &&
      fb.projectId &&
      !fb.projectId.includes("demo")
    );
  },

  /**
   * Checks if Google Apps Script URL is configured with real URL
   */
  isGoogleDriveConfigured() {
    const url = this.getGoogleAppsScriptUrl();
    return !!(
      url &&
      url.startsWith("https://script.google.com/macros/s/") &&
      !url.includes("YOUR_GOOGLE_APPS_SCRIPT")
    );
  },

  getGoogleAppsScriptUrl() {
    const config = this.getConfig();
    return (config.googleAppsScriptUrl || '').trim();
  },

  /**
   * Initializes Firebase App & Firestore
   */
  initFirebase() {
    if (this._initialized && window.db_firestore) {
      return true;
    }

    if (typeof firebase === 'undefined') {
      console.warn("[TastyConfig] Firebase SDK is not loaded yet.");
      return false;
    }

    const config = this.getConfig();
    const fb = config.firebase;

    if (!this.isFirebaseConfigured()) {
      console.info("[TastyConfig] Firebase is in Offline/IndexedDB mode. To sync recipes across all users, configure Firebase in Admin Control Center -> Cloud Settings.");
      window.isFirestoreActive = false;
      return false;
    }

    try {
      // Check if already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(fb);
      } else {
        // App already exists
      }

      window.db_firestore = firebase.firestore();
      if (typeof firebase.storage === 'function') {
        window.firebase_storage = firebase.storage();
      }
      window.isFirestoreActive = true;
      this._initialized = true;
      console.log("[TastyConfig] 🔥 Firebase Firestore & Storage connected successfully! Project ID:", fb.projectId);
      return true;
    } catch (err) {
      console.error("[TastyConfig] Error initializing Firebase:", err);
      window.isFirestoreActive = false;
      return false;
    }
  }
};

window.TastyConfig = TastyConfig;

// Initialize on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    TastyConfig.initFirebase();
  });
}
