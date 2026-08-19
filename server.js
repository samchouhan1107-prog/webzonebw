import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser for JSON / base64 image requests
app.use(express.json({ limit: '25mb' }));

// Serve static assets and html files
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Explicit route for WEBZONE ER / Halloween studio
app.get(['/halloween', '/halloween/', '/er', '/er/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'halloween', 'index.html'));
});

// Explicit routes for 404 and Maintenance Center
app.get(['/404', '/404.html', '/maintenance', '/maintenance.html', '/status'], (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Route fallback for client navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WEBZONEBW server running on http://0.0.0.0:${PORT}`);
});

