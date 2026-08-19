import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser for JSON / base64 image uploads
app.use(express.json({ limit: '25mb' }));

// Lazy Supabase client initialization
let supabaseClient = null;
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// API endpoint: Supabase Storage status check
app.get('/api/storage/status', (req, res) => {
  const isConfigured = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
  res.json({
    configured: isConfigured,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'webzonebw-snapshots'
  });
});

// API endpoint: Upload snapshot or asset to Supabase Storage
app.post('/api/storage/upload', async (req, res) => {
  try {
    const { image, fileName, metadata } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.json({
        success: false,
        fallback: true,
        message: 'Supabase storage is not configured yet. Fallback to local storage.',
      });
    }

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'webzonebw-snapshots';

    // Parse base64 data
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const contentType = matches ? matches[1] : 'image/png';
    const base64Data = matches ? matches[2] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    const generatedFileName = fileName || `webzonebw_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const filePath = `captures/${generatedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase upload warning:', uploadError.message);
      return res.status(500).json({
        success: false,
        error: uploadError.message,
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return res.json({
      success: true,
      url: publicUrlData?.publicUrl || null,
      path: filePath,
      fileName: generatedFileName,
      message: 'Snapshot uploaded to Supabase Storage successfully!',
    });
  } catch (err) {
    console.error('Storage upload error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown error occurred during upload.',
    });
  }
});

// Serve static assets and html files
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Explicit route for WEBZONE ER / Halloween studio
app.get(['/halloween', '/halloween/', '/er', '/er/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'halloween', 'index.html'));
});

// Route fallback for client navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WEBZONEBW server running on http://0.0.0.0:${PORT}`);
});
