import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic root route
app.get('/', (_, res) => {
  res.send('Test server is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});
