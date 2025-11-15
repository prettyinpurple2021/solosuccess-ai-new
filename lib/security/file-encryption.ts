import crypto from 'crypto';
import { Readable, Transform } from 'stream';

/**
 * File encryption utilities
 * Provides streaming encryption/decryption for large files
 */

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

/**
 * Get file encryption key from environment
 */
function getFileEncryptionKey(): Buffer {
  const key = process.env.FILE_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('FILE_ENCRYPTION_KEY environment variable is not set');
  }
  return crypto.scryptSync(key, 'file-salt', 32);
}

/**
 * Encrypt file buffer
 */
export function encryptFile(buffer: Buffer): Buffer {
  try {
    const key = getFileEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    // Prepend IV to encrypted data
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
}

/**
 * Decrypt file buffer
 */
export function decryptFile(encryptedBuffer: Buffer): Buffer {
  try {
    const key = getFileEncryptionKey();

    // Extract IV from beginning of buffer
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const encrypted = encryptedBuffer.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted;
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
}

/**
 * Create encryption stream for large files
 */
export function createEncryptionStream(): {
  stream: Transform;
  iv: Buffer;
} {
  const key = getFileEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  return {
    stream: cipher,
    iv,
  };
}

/**
 * Create decryption stream for large files
 */
export function createDecryptionStream(iv: Buffer): Transform {
  const key = getFileEncryptionKey();
  return crypto.createDecipheriv(ALGORITHM, key, iv);
}

/**
 * Encrypt file stream
 */
export async function encryptFileStream(
  inputStream: Readable,
  outputStream: NodeJS.WritableStream
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { stream: cipher, iv } = createEncryptionStream();

    // Write IV first
    outputStream.write(iv);

    inputStream
      .pipe(cipher)
      .pipe(outputStream)
      .on('finish', resolve)
      .on('error', reject);
  });
}

/**
 * Decrypt file stream
 */
export async function decryptFileStream(
  inputStream: Readable,
  outputStream: NodeJS.WritableStream
): Promise<void> {
  return new Promise((resolve, reject) => {
    let iv: Buffer | null = null;
    let ivBuffer = Buffer.alloc(0);

    const transform = new Transform({
      transform(chunk: Buffer, encoding, callback) {
        if (!iv) {
          // Collect IV from first chunk(s)
          ivBuffer = Buffer.concat([ivBuffer, chunk]);

          if (ivBuffer.length >= IV_LENGTH) {
            iv = ivBuffer.slice(0, IV_LENGTH);
            const remaining = ivBuffer.slice(IV_LENGTH);

            // Create decipher with IV
            const decipher = createDecryptionStream(iv);

            // Pipe remaining data through decipher
            if (remaining.length > 0) {
              this.push(decipher.update(remaining));
            }

            // Store decipher for subsequent chunks
            (this as any).decipher = decipher;
          }

          callback();
        } else {
          // Decrypt subsequent chunks
          const decipher = (this as any).decipher;
          this.push(decipher.update(chunk));
          callback();
        }
      },
      flush(callback) {
        const decipher = (this as any).decipher;
        if (decipher) {
          this.push(decipher.final());
        }
        callback();
      },
    });

    inputStream
      .pipe(transform)
      .pipe(outputStream)
      .on('finish', resolve)
      .on('error', reject);
  });
}

/**
 * Calculate file checksum
 */
export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Verify file checksum
 */
export function verifyChecksum(buffer: Buffer, expectedChecksum: string): boolean {
  const actualChecksum = calculateChecksum(buffer);
  return actualChecksum === expectedChecksum;
}

/**
 * Secure file deletion (overwrite before delete)
 */
export async function secureDelete(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  const { stat } = await import('fs/promises');

  try {
    const stats = await stat(filePath);
    const fileSize = stats.size;

    // Overwrite with random data
    const randomData = crypto.randomBytes(fileSize);
    await fs.writeFile(filePath, randomData);

    // Overwrite with zeros
    const zeros = Buffer.alloc(fileSize, 0);
    await fs.writeFile(filePath, zeros);

    // Delete file
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Secure delete error:', error);
    throw new Error('Failed to securely delete file');
  }
}
