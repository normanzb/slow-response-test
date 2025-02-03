const express = require('express');

const delay = (timeout) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeout);
});

const app = express();

app.get('/slow-response', async (req, res) => {
  await delay(3000);

  res.status(200);
  res.setHeader('Content-Type', 'text/plain');

  res.addListener('close', () => {
    console.log('Client disconnected');
  });

  res.flushHeaders();

  console.log('Sending data');

  for (let i = 0; i < 100; i++) {
    res.write(`Chunk ${i}\n`);
    await delay(1000);
  }

  res.end('\nDone.');
});

app.listen(3999, () => {
  console.log('Server running on http://localhost:3999');
});