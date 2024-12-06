export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://thecai-backend-d97aad1e3385.herokuapp.com';
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
}