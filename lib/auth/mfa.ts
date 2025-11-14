import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate MFA secret and QR code for TOTP
 */
export async function generateMfaSecret(email: string): Promise<{
  secret: string;
  qrCode: string;
}> {
  const secret = speakeasy.generateSecret({
    name: `SoloSuccess AI (${email})`,
    issuer: 'SoloSuccess AI',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32,
    qrCode,
  };
}

/**
 * Verify TOTP code
 */
export function verifyMfaCode(secret: string, code: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 2, // Allow 2 time steps before/after for clock drift
  });
}

/**
 * Verify recovery code
 */
export function verifyRecoveryCode(
  storedCodes: string[],
  providedCode: string
): { valid: boolean; remainingCodes: string[] } {
  const codeIndex = storedCodes.indexOf(providedCode.toUpperCase());
  
  if (codeIndex === -1) {
    return { valid: false, remainingCodes: storedCodes };
  }

  // Remove used code
  const remainingCodes = storedCodes.filter((_, index) => index !== codeIndex);
  
  return { valid: true, remainingCodes };
}
