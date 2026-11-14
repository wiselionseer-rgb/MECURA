const CLOUD_FALLBACK_ORIGINS = [
  'https://ais-pre-uw3xxontgc5pttbz5n35tf-93183907716.us-east5.run.app',
  'https://ais-dev-uw3xxontgc5pttbz5n35tf-93183907716.us-east5.run.app',
];

/**
 * Calls a backend API route on the current origin first, and if the server
 * returns a gateway/unavailable error (502, 503, 504, 404 HTML) or network failure,
 * automatically falls back to the active Cloud Run backend.
 */
export async function fetchApi(path: string, options?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let primaryResponse: Response | null = null;

  try {
    primaryResponse = await fetch(normalizedPath, options);
    const contentType = primaryResponse.headers.get('content-type') || '';
    const isGatewayOrHtmlError =
      primaryResponse.status === 502 ||
      primaryResponse.status === 503 ||
      primaryResponse.status === 504 ||
      ( !primaryResponse.ok && contentType.includes('text/html') );

    if (!isGatewayOrHtmlError) {
      return primaryResponse;
    }
  } catch (err) {
    // Primary origin network error; proceed to cloud fallback
  }

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  for (const baseOrigin of CLOUD_FALLBACK_ORIGINS) {
    if (baseOrigin === currentOrigin) continue;
    try {
      const fallbackRes = await fetch(`${baseOrigin}${normalizedPath}`, {
        ...options,
        mode: 'cors',
      });
      if (fallbackRes.ok || fallbackRes.headers.get('content-type')?.includes('application/json')) {
        return fallbackRes;
      }
    } catch {
      // Try next fallback origin
    }
  }

  if (primaryResponse) {
    return primaryResponse;
  }
  throw new Error('Falha de conexão com o servidor de pagamentos.');
}
