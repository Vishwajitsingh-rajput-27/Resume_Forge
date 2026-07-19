import validator from 'validator';

/**
 * Keep every authentication path on the same canonical email representation.
 * This matches the normalization previously performed by express-validator,
 * including Gmail aliases, while also making model-level writes consistent.
 */
export const normalizeAccountEmail = (value: string): string => {
  const trimmed = value.trim();
  const normalized = validator.normalizeEmail(trimmed);

  return (normalized || trimmed).toLowerCase();
};
