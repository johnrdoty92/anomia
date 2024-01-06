declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    CLIENT_URL: string;
    DATABASE_URL: string;
  }
}