export class AdminApiError extends Error {
  status?: number;
  isTableMissing?: boolean;

  constructor(message: string, options?: { status?: number; isTableMissing?: boolean }) {
    super(message);
    this.name = 'AdminApiError';
    this.status = options?.status;
    this.isTableMissing = options?.isTableMissing;
  }
}

export interface AdminRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  passkey?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  requireSuccessFlag?: boolean;
  fallbackErrorMessage?: string;
}

interface JsonEnvelopeCandidate {
  success?: unknown;
  error?: unknown;
  isTableMissing?: unknown;
}

export async function requestAdminJson<TResponse>(
  url: string,
  options: AdminRequestOptions = {}
): Promise<TResponse> {
  const {
    method = 'GET',
    passkey,
    body,
    headers = {},
    signal,
    requireSuccessFlag = true,
    fallbackErrorMessage = 'Request failed',
  } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestHeaders: Record<string, string> = { ...headers };

  if (passkey) {
    requestHeaders['x-admin-passkey'] = passkey;
  }

  let requestBody: BodyInit | undefined;
  if (isFormData) {
    requestBody = body;
  } else if (body !== undefined) {
    if (!requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  let parsedJson: unknown;
  try {
    parsedJson = await response.json();
  } catch {
    if (!response.ok) {
      throw new AdminApiError(fallbackErrorMessage, { status: response.status });
    }
    throw new AdminApiError('Invalid JSON response from server', { status: response.status });
  }

  const envelope =
    typeof parsedJson === 'object' && parsedJson !== null
      ? (parsedJson as JsonEnvelopeCandidate)
      : null;

  const hasExplicitFailure = requireSuccessFlag ? envelope?.success !== true : false;

  if (!response.ok || hasExplicitFailure) {
    const serverMessage =
      typeof envelope?.error === 'string' && envelope.error.trim().length > 0
        ? envelope.error
        : fallbackErrorMessage;

    throw new AdminApiError(serverMessage, {
      status: response.status,
      isTableMissing: Boolean(envelope?.isTableMissing),
    });
  }

  return parsedJson as TResponse;
}

