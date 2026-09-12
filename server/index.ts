import 'dotenv/config';
import express from 'express';
import {
  createUploadSignature,
  destroyCloudinaryImage,
  getCloudinaryCredentials,
  isConfigured,
} from './media/cloudinary';
import { requireAdmin } from './middleware/admin';
import usersRouter from './routes/users';
import paystackRouter from './routes/paystack';

const app = express();
app.use(express.json({ limit: '1mb' }));

/**
 * Public config endpoint. Returns whether Cloudinary is configured plus the
 * non-secret identifiers. Never returns the API secret.
 */
app.get('/api/media/config', (_req, res) => {
  const { cloudName, apiKey } = getCloudinaryCredentials();
  res.json({
    configured: isConfigured(),
    cloudName: cloudName || '',
    apiKey: apiKey || '',
  });
});

/**
 * Admin-only: issue a short-lived signature for a direct client-side upload.
 * The browser uploads straight to Cloudinary; the secret stays on this server.
 */
app.post('/api/media/sign', requireAdmin, (_req, res) => {
  try {
    res.json(createUploadSignature());
  } catch (err) {
    res.status(503).json({ error: err instanceof Error ? err.message : 'Cloudinary unavailable' });
  }
});

/**
 * Admin-only: destroy a Cloudinary asset by public_id (done server-side).
 */
app.post('/api/media/destroy', requireAdmin, async (req, res) => {
  const publicId = req.body?.publicId;
  if (!publicId || typeof publicId !== 'string') {
    res.status(400).json({ error: 'publicId is required' });
    return;
  }
  try {
    const result = await destroyCloudinaryImage(publicId);
    res.json({ result: result.result || 'ok', publicId });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Cloudinary destroy failed' });
  }
});

// Admin user management (Firebase Authentication via the Admin SDK).
app.use('/api/admin/users', usersRouter);

// Paystack payment verification (public key on client, secret key here).
app.use('/api/paystack', paystackRouter);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Media server listening on http://localhost:${port}`);
});
