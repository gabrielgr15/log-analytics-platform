// src/index.ts

import express from 'express';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(authMiddleware);
app.post('/v1/logs', (req, res) => {
  res.status(202).json({ message: 'Request received. Processing...' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
