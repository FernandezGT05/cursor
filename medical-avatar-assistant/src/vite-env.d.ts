/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_BEY_API_KEY: string;
  readonly VITE_BEY_AGENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
