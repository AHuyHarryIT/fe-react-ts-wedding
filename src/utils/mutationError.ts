/**
 * Safely extract an error message from a mutation error.
 * TanStack Query v5 defaults `TError` to `{}`, which has no `.message` property.
 * This helper uses a runtime `instanceof` check instead of a type assertion.
 */
export function getMutationError(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  return null;
}
