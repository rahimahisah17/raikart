import { Router } from 'express';
import { verifyPaystackTransaction, initializePaystackTransaction } from '../services/paystack';

/**
 * Paystack payment verification API.
 *
 * The client opens the Paystack Inline popup with the PUBLIC key, then sends
 * the resulting reference here. This route verifies the transaction against
 * Paystack using the SECRET key (which never leaves the server), and rejects
 * any mismatch so an order is only recorded after a real, successful charge.
 */

const router = Router();

// POST /api/paystack/initialize — start a transaction and return the hosted
// checkout URL for the redirect flow.
router.post('/initialize', async (req, res) => {
  const { email, amount, reference, callbackUrl, metadata } = req.body || {};

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'email (string) is required' });
    return;
  }
  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ error: 'amount (kobo, number) is required' });
    return;
  }
  if (!reference || typeof reference !== 'string') {
    res.status(400).json({ error: 'reference (string) is required' });
    return;
  }

  try {
    const init = await initializePaystackTransaction({
      email,
      amount,
      reference,
      callbackUrl: typeof callbackUrl === 'string' ? callbackUrl : undefined,
      metadata,
    });
    res.json({ success: true, ...init });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Paystack initialization failed',
    });
  }
});

// POST /api/paystack/verify — verify a transaction by reference.
router.post('/verify', async (req, res) => {
  const reference = req.body?.reference;
  const expectedAmount = req.body?.amount; // optional, in kobo

  if (!reference || typeof reference !== 'string') {
    res.status(400).json({ error: 'reference (string) is required' });
    return;
  }

  try {
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== 'success') {
      res.status(400).json({ error: 'Payment was not successful', verification });
      return;
    }

    // Guard against tampering: the amount actually charged must match what the
    // storefront expected (only enforced when the client sends an amount).
    if (typeof expectedAmount === 'number' && verification.amount !== expectedAmount) {
      res.status(400).json({ error: 'Amount mismatch', verification });
      return;
    }

    res.json({ success: true, verification });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Verification failed' });
  }
});

export default router;
