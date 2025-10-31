/// <reference types="vite/client" />

interface ImportMetaEnv {
  // --- Firebase Configuration ---
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;

  // --- Hedera Configuration ---
  readonly VITE_HEDERA_OPERATOR_ID: string;
  readonly VITE_HEDERA_OPERATOR_KEY: string;

  // --- Google Gemini API ---
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
