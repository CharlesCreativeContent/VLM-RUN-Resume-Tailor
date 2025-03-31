export async function fetchWithError<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options?.headers || {}),
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText,
    }));

    throw new Error(errorData.message || "An error occurred");
  }

  return response.json();
}
