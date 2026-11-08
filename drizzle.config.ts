import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Uses the DATABASE_URL from .env
    url: process.env.DATABASE_URL!
  }
};

export default config;
