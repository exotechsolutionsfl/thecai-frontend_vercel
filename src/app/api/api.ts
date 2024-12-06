const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://thecai-backend-d97aad1e3385.herokuapp.com';

if (!API_BASE_URL) {
  console.error('NEXT_PUBLIC_API_BASE_URL is not set in the environment variables');
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = 30000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const url = new URL(endpoint, API_BASE_URL).toString();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`API Fetch Error: Request timed out after ${timeout}ms`);
        throw new Error(`Request timed out after ${timeout}ms`);
      } else {
        console.error('API Fetch Error:', error.message);
        throw error;
      }
    } else {
      console.error('API Fetch Error: An unknown error occurred');
      throw new Error('An unknown error occurred');
    }
  }
}