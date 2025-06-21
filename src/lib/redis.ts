import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });

export const redis = (async () => {
  if (!client.isOpen) await client.connect();
  return client;
})();
