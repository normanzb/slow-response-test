// must be the first import
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// const { fetch: nodeFetch } = require('undici');

// global.fetch = () => {
//   throw new Error('Fetch is not allowed');
// };

// console.log(111, fetch.toString());

Sentry.init({
  dsn: "abcd",
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ["error"],
    }),
    Sentry.rewriteFramesIntegration({
      root: resolve(dirname(fileURLToPath(import.meta.url)), "../../"),
    }),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: "development",
  debug: true,
  enabled: true,
});


class TimeoutError extends Error {
  name = "TimedTimeoutError";
  constructor() {
    super("Timed out");
  }
}

const timeoutError = new TimeoutError();

/**
 * Make a promise timeout after a given number of milliseconds.
 * @param promise - The promise to timeout.
 * @param timeoutInMs - The number of milliseconds to wait before timing out.
 * @returns The result of the promise or a TimeoutError if the promise times out.
 */
function timeout(
  promise,
  timeoutInMs
) {
  const timerAbortController = new AbortController();
  return Promise.race([
    promise.then((v) => {
      timerAbortController.abort();
      return v;
    }),
    delay(timeoutInMs, timerAbortController.signal).then(
      () => timeoutError
    ),
  ]);
}

const serverUrl = process.env.API_ORIGIN ?? 'http://localhost:3999';

async function benchmarkFetch() {
  const startTime = performance.now();

  try {
    const response = await fetch(serverUrl + '/slow-response', {
      signal: AbortSignal.timeout(6000),
    });

    const fetchedTime = performance.now();

    console.log('Fetched time:', fetchedTime - startTime);

    const text = await response.text();

    console.log(text);

    const respondedTime = performance.now()

    console.log('Responded time:', respondedTime - fetchedTime);
  } catch (error) {
    console.log('Error during fetch:', error.message);
  }
}

async function benchmarkFetchWithTimeout() {
  const result = await timeout(benchmarkFetch(), 1000 * 10);

  if (result instanceof TimeoutError) {
    console.log('Timeout found!');
    return;
  }

  return result;
}

async function loop() {
  while (true) {
    await benchmarkFetchWithTimeout();
    await delay(80);
  }
}

async function main() {
  void loop();
  void loop();
  void loop();
}

main();