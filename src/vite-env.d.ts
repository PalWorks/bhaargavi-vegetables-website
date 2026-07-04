/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPS_SCRIPT_URL: string;
  readonly VITE_GOOGLE_PLACE_ID: string;
  readonly VITE_ANALYTICS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
