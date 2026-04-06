const express = require('express');
const path = require('path');
const app = express();

// Security Headers for Google Auth (COOP)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Keep this off unless you have a CORP policy for all images
  next();
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`🚀 Production Frontend Server running on port ${PORT}`);
});
