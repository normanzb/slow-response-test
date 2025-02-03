// const { fetch: nodeFetch } = require('undici');

// global.fetch = () => {
//   throw new Error('Fetch is not allowed');
// };

// console.log(111, fetch.toString());

async function benchmarkFetch() {
  const startTime = performance.now();

  try {
    const response = await fetch('http://localhost:3999/slow-response', {
      signal: AbortSignal.timeout(6000),
    });

    const fetchedTime = performance.now();

    console.log('Fetched time:', fetchedTime - startTime);

    const text = await response.text();

    console.log(text);

    const respondedTime = performance.now()

    console.log('Responded time:', respondedTime - fetchedTime);
  } catch (error) {
    console.error('Error during fetch:', error.message);
  }
}

// Run the benchmark
benchmarkFetch();