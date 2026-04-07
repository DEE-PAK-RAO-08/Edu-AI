import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers for Google Auth (COOP)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Routing (Express 5 compatible catch-all)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5173;
const DIST_PATH = path.join(__dirname, 'dist');

console.log(`📂 Serving static files from: ${DIST_PATH}`);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Frontend Server ready on port ${PORT}`);
});
