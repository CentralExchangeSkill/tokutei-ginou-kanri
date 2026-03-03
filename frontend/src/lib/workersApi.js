export async function createWorker(payload) {
  const response = await fetch('/api/workers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || 'Failed to create worker';
    throw new Error(message);
  }

  return response.json();
}
