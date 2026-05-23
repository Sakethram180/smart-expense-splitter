export async function applyInstability<T>(
  payload: T,
  options?: {
    allowDuplicate?: boolean;
    allowEmpty?: boolean;
  }
) {
  const randomness = Math.random();

  if (randomness < 0.18) {
    const delay = 700 + Math.floor(Math.random() * 1500);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (randomness >= 0.18 && randomness < 0.28) {
    throw new Error("We hit a temporary sync issue. Please try again.");
  }

  if (Array.isArray(payload) && options?.allowEmpty && randomness >= 0.28 && randomness < 0.35) {
    return [] as T;
  }

  if (Array.isArray(payload) && options?.allowDuplicate && randomness >= 0.35 && randomness < 0.42) {
    return [...payload, payload[0]].filter(Boolean) as T;
  }

  return payload;
}
