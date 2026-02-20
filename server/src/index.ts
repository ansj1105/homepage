import "dotenv/config";
import { createApp } from "./app";
import { closePool, ensureConnection, seedDatabaseIfNeeded } from "./db";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const warmupDatabase = async () => {
  const maxAttempts = 40;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await ensureConnection();
      await seedDatabaseIfNeeded();
      // eslint-disable-next-line no-console
      console.log("Database warmup completed.");
      return;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Database warmup attempt ${attempt}/${maxAttempts} failed:`, error);
      await sleep(2000);
    }
  }
  // eslint-disable-next-line no-console
  console.error("Database warmup skipped after max retries. Server will continue running.");
};

const bootstrap = async () => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SH backend listening on http://localhost:${port}`);
  });

  void warmupDatabase();
};

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Server bootstrap failed:", error);
  process.exit(1);
});

const shutdown = async () => {
  await closePool();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
