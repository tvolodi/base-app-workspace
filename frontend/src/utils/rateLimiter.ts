/**
 * Client-side rate limiter to prevent API abuse
 * Implements a sliding window algorithm to track requests
 */

import React from 'react';

class RateLimiter {
  maxRequests: number;
  windowMs: number;
  requests: number[];

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if a request can be made based on rate limiting rules
   * @returns {boolean} True if request can proceed, false if rate limit exceeded
   */
  canMakeRequest() {
    const now = Date.now();
    
    // Remove requests outside the current time window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if we've exceeded the limit
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request timestamp
    this.requests.push(now);
    return true;
  }

  /**
   * Get the number of requests made in the current window
   * @returns {number} Number of requests
   */
  getRequestCount() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length;
  }

  /**
   * Get remaining requests in the current window
   * @returns {number} Number of remaining requests
   */
  getRemainingRequests() {
    return Math.max(0, this.maxRequests - this.getRequestCount());
  }

  /**
   * Get time until the rate limit resets (in ms)
   * @returns {number} Milliseconds until reset
   */
  getTimeUntilReset() {
    if (this.requests.length === 0) {
      return 0;
    }
    
    const now = Date.now();
    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest + this.windowMs;
    
    return Math.max(0, resetTime - now);
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = [];
  }
}

/**
 * Global rate limiters for different operations
 */

// General API requests: 60 requests per minute
export const apiRateLimiter = new RateLimiter(60, 60000);

// Login attempts: 5 attempts per 5 minutes
export const loginRateLimiter = new RateLimiter(5, 300000);

// Registration attempts: 3 attempts per hour
export const registerRateLimiter = new RateLimiter(3, 3600000);

// Profile updates: 10 updates per minute
export const profileRateLimiter = new RateLimiter(10, 60000);

// Search requests: 30 requests per minute
export const searchRateLimiter = new RateLimiter(30, 60000);

/**
 * Middleware function to check rate limiting before making a request
 * @param {RateLimiter} limiter - The rate limiter to use
 * @param {string} operationName - Name of the operation for error messages
 * @throws {Error} If rate limit is exceeded
 */
export const checkRateLimit = (limiter, operationName = 'operation') => {
  if (!limiter.canMakeRequest()) {
    const remaining = limiter.getRemainingRequests();
    const resetTime = Math.ceil(limiter.getTimeUntilReset() / 1000);
    
    throw new Error(
      `Rate limit exceeded for ${operationName}. ` +
      `Please try again in ${resetTime} seconds. ` +
      `(${remaining} requests remaining)`
    );
  }
};

/**
 * HOC to add rate limiting to async functions
 * @param {Function} fn - The async function to wrap
 * @param {RateLimiter} limiter - The rate limiter to use
 * @param {string} operationName - Name of the operation
 * @returns {Function} Wrapped function with rate limiting
 */
export const withRateLimit = (fn, limiter, operationName) => {
  return async (...args) => {
    checkRateLimit(limiter, operationName);
    return await fn(...args);
  };
};

/**
 * React hook for rate limiting with state
 * @param {RateLimiter} limiter - The rate limiter to use
 * @returns {Object} Rate limit state and check function
 */
export const useRateLimit = (limiter) => {
  const [isLimited, setIsLimited] = React.useState(false);
  const [remaining, setRemaining] = React.useState(limiter.maxRequests);
  const [resetIn, setResetIn] = React.useState(0);

  const updateState = () => {
    setRemaining(limiter.getRemainingRequests());
    setResetIn(Math.ceil(limiter.getTimeUntilReset() / 1000));
    setIsLimited(limiter.getRequestCount() >= limiter.maxRequests);
  };

  const checkLimit = () => {
    const canProceed = limiter.canMakeRequest();
    updateState();
    return canProceed;
  };

  React.useEffect(() => {
    // Update state every second
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [limiter]);

  return {
    isLimited,
    remaining,
    resetIn,
    checkLimit,
  };
};

export default RateLimiter;
