/**
 * POST /api/oauth/token
 *
 * Server-side token exchange for providers that require a client_secret
 * (Google, OneDrive). The secret is stored as a Cloudflare Pages secret
 * and never sent to the browser.
 *
 * Body: { provider, code, code_verifier, redirect_uri }
 *   or: { provider, refresh_token }
 *
 * Set secrets with:
 *   npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name writer
 *   npx wrangler pages secret put ONEDRIVE_CLIENT_SECRET --project-name writer
 */

// Provider configs — client IDs are public, embedded in the HTML.
// Client secrets come from environment (Cloudflare Pages secrets).
const PROVIDERS = {
  'google-drive': {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    secretEnv: 'GOOGLE_CLIENT_SECRET',
  },
  'onedrive': {
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    secretEnv: 'ONEDRIVE_CLIENT_SECRET',
  },
};

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { provider, code, code_verifier, redirect_uri, refresh_token, client_id } = body;
  const p = PROVIDERS[provider];
  if (!p) return json({ error: 'Unsupported provider' }, 400);

  const clientSecret = env[p.secretEnv];
  if (!clientSecret) return json({ error: `${p.secretEnv} not configured` }, 500);

  const params = new URLSearchParams();
  params.set('client_id', client_id);
  params.set('client_secret', clientSecret);

  if (refresh_token) {
    // Refresh flow
    params.set('refresh_token', refresh_token);
    params.set('grant_type', 'refresh_token');
  } else {
    // Initial code exchange
    params.set('code', code);
    params.set('code_verifier', code_verifier);
    params.set('redirect_uri', redirect_uri);
    params.set('grant_type', 'authorization_code');
  }

  const res = await fetch(p.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    },
  });
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
