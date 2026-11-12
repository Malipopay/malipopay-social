// Block container startup until Temporal accepts TCP connections.
//
// Why this exists: nestjs-temporal-core's TemporalConnectionFactory tries the
// worker connection exactly once. On failure it logs
//   "Failed to create worker connection, returning null"
// and returns null forever, so the orchestrator boots, reports healthy on its
// /health port and polls no task queue at all. Scheduled posts then pile up in
// QUEUE with nobody to run them, silently. Verified present in 3.2.0 and still
// unfixed in 3.5.1, so upgrading does not help.
//
// docker-compose's `depends_on: condition: service_healthy` does not cover
// this: it only applies to `docker compose up`. When the Docker daemon restarts
// containers via their restart policy (daemon restart, host reboot) it ignores
// dependency order entirely and starts everything at once.
//
// We deliberately give up after WAIT_TIMEOUT_MS rather than blocking forever.
// This process gates the whole container, including nginx and the frontend, so
// a permanently dead Temporal must not take the website down with it.

const net = require('net');

const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const [host, portRaw] = address.split(':');
const port = Number(portRaw) || 7233;

const WAIT_TIMEOUT_MS = Number(process.env.TEMPORAL_WAIT_TIMEOUT_MS) || 180000;
const PROBE_TIMEOUT_MS = 3000;
const RETRY_DELAY_MS = 2000;

const probe = () =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(PROBE_TIMEOUT_MS);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    attempt++;
    if (await probe()) {
      console.log(
        `[wait-for-temporal] ${address} reachable after ${attempt} attempt(s), ` +
          `${Date.now() - startedAt}ms`
      );
      process.exit(0);
    }
    await sleep(RETRY_DELAY_MS);
  }

  // Starting anyway keeps the site up. The orchestrator will come up without
  // workers, which is the pre-existing failure mode, so make it loud.
  console.error(
    `[wait-for-temporal] WARNING: ${address} still unreachable after ` +
      `${WAIT_TIMEOUT_MS}ms. Starting anyway so the frontend stays up, but the ` +
      `orchestrator will have NO Temporal workers and scheduled posts will not ` +
      `publish until it is restarted with Temporal reachable.`
  );
  process.exit(0);
})();
