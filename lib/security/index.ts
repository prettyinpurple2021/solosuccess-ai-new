/**
 * Security utilities index
 * Central export for all security-related functionality
 */

// Encryption
export {
  encrypt,
  decrypt,
  hash,
  verifyHash,
  generateSecureToken,
  generateSecureRandomString,
  FieldEncryption,
  maskSensitiveData,
  maskEmail,
  maskCreditCard,
  secureCompare,
  generateHmac,
  verifyHmac,
} from './encryption';

// File encryption
export {
  encryptFile,
  decryptFile,
  createEncryptionStream,
  createDecryptionStream,
  encryptFileStream,
  decryptFileStream,
  calculateChecksum,
  verifyChecksum,
  secureDelete,
} from './file-encryption';

// Monitoring
export {
  SecurityEventType,
  SecurityEventSeverity,
  logSecurityEvent,
  getSecurityEvents,
  getSecurityStats,
  clearOldSecurityEvents,
  detectAnomalies,
  exportSecurityEvents,
  cleanupSuspiciousPatterns,
} from './monitoring';

export type { SecurityEvent } from './monitoring';

// Alerts
export {
  processSecurityAlert,
  getAlertRules,
  addAlertRule,
  updateAlertRule,
  deleteAlertRule,
  clearRecentAlerts,
} from './alerts';

export type { AlertChannel, AlertRule } from './alerts';

// Sentry
export {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
} from './sentry';
