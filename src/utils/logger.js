/**
 * Mission LiFE Safe Logger
 * Suppresses debug and sensitive operational logging in production builds
 * to prevent user data, telemetry, and credentials leaks.
 */

const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

export const logger = {
  log: (...args) => {
    if (!isProd) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (!isProd) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    if (!isProd) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (!isProd) {
      console.error(...args);
    }
  },
  debug: (...args) => {
    if (!isProd) {
      console.debug(...args);
    }
  }
};

export default logger;

