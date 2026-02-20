import "dotenv/config";
import { createApp } from "./app";
import { closePool, ensureConnection, seedDatabaseIfNeeded } from "./db";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

const bootstrap = async () => {
  await ensureConnection();
  await seedDatabaseIfNeeded();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SH backend listening on http://localhost:${port}`);
  });
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
