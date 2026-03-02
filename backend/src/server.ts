import { app } from "./app";
import { connectToDatabase } from "./config/db";
import { env } from "./config/env";

async function start() {
  try {
    await connectToDatabase();
    app.listen(env.port, () => {
      console.log(`[server] Listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("[server] Failed to start", error);
    process.exit(1);
  }
}

void start();

