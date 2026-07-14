export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? '/api';

export const FSENSE_API_BASE_URL =
  process.env.NEXT_PUBLIC_FSENSE_API_URL ?? '/fsense-api';

type QueryValue = string | number | string[] | undefined;

type RequestOptions = {
  baseUrl?: string;
  params?: Record<string, QueryValue>;
};

function buildUrl(path: string, options?: RequestOptions) {
  const configuredBaseUrl = options?.baseUrl ?? API_BASE_URL;
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

  const baseUrl = configuredBaseUrl.startsWith('http')
    ? configuredBaseUrl
    : `${origin}${configuredBaseUrl}`;

  const url = new URL(`${baseUrl}${path}`);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item) {
            url.searchParams.append(key, item);
          }
        });

        return;
      }

      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}
export async function apiGet<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

  const response = await fetch(buildUrl(path, options), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Erro na requisição ${path}: ${response.status} - ${errorText}`,
    );
  }

  return response.json();
}
