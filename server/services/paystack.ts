import 'dotenv/config';

/**
 * Paystack server integration.
 *
 * The Paystack SECRET key (sk_test_…/sk_live_…) must NEVER reach the browser.
 * It lives here, server-side, and is used to verify transactions via Paystack's
 * REST API. The browser only ever receives the PUBLIC key (pk_test_…/pk_live_…)
 * through VITE_PAYSTACK_PUBLIC_KEY.
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE = 'https://api.paystack.co';

export function isPaystackConfigured(): boolean {
  return Boolean(PAYSTACK_SECRET_KEY);
}

export interface PaystackVerification {
  reference: string;
  amount: number; // in kobo (minor unit)
  currency: string;
  channel: string;
  status: string;
  paidAt: string;
  gatewayResponse: string;
}

export interface PaystackInitialization {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/**
 * Initialize a transaction against Paystack's API and return the hosted
 * checkout URL. Used for the redirect flow: the browser is sent to Paystack's
 * secure hosted page (no inline iframe), and Paystack redirects back to the
 * callback_url with the transaction reference once payment completes.
 */
export async function initializePaystackTransaction(params: {
  email: string;
  amount: number; // in kobo (minor unit)
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitialization> {
  if (!isPaystackConfigured()) {
    throw new Error('Paystack is not configured (set PAYSTACK_SECRET_KEY in .env)');
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      currency: 'NGN',
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };

  if (!res.ok || !data.status || !data.data) {
    throw new Error(data.message || 'Paystack initialization failed');
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

/**
 * Verify a transaction reference against Paystack's API using the secret key.
 * Throws when Paystack is unconfigured or the transaction cannot be verified.
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerification> {
  if (!isPaystackConfigured()) {
    throw new Error('Paystack is not configured (set PAYSTACK_SECRET_KEY in .env)');
  }

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
  );

  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      channel: string;
      paid_at: string;
      gateway_response: string;
    };
  };

  if (!res.ok || !data.status || !data.data) {
    throw new Error(data.message || 'Paystack verification failed');
  }

  return {
    reference: data.data.reference,
    amount: data.data.amount,
    currency: data.data.currency,
    channel: data.data.channel,
    status: data.data.status,
    paidAt: data.data.paid_at,
    gatewayResponse: data.data.gateway_response,
  };
}
