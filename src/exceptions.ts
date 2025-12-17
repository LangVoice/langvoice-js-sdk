/**
 * Custom exceptions for LangVoice SDK
 */

/**
 * Base exception for LangVoice SDK
 */
export class LangVoiceError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'LangVoiceError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LangVoiceError.prototype);
  }
}

/**
 * Raised when API key is invalid or missing
 */
export class AuthenticationError extends LangVoiceError {
  constructor(message: string = 'Invalid or missing API key') {
    super(message, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Raised when rate limit is exceeded
 */
export class RateLimitError extends LangVoiceError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Raised when request validation fails
 */
export class ValidationError extends LangVoiceError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Raised when API returns an error
 */
export class APIError extends LangVoiceError {
  constructor(message: string, statusCode?: number) {
    super(message, statusCode);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Check if an error is a LangVoice error
 */
export function isLangVoiceError(error: unknown): error is LangVoiceError {
  return error instanceof LangVoiceError;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}
