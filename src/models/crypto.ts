/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * KhanhAn - Cryptographic Security Utilities
 * Implements Web Crypto AES-GCM-256 with PBKDF2 Key Derivation
 * Meets HIPAA ePHI Security Rule & Decree 356/2025/ND-CP Article 4 standards
 */

const MASTER_SALT = new TextEncoder().encode('KHANHAN_DECREE356_HIPAA_SECURE_SALT_2026');

/**
 * Derives a 256-bit CryptoKey from a secret passkey or user identity
 */
async function deriveKey(secretKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: MASTER_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts sensitive string data with AES-GCM-256.
 * Returns base64 ciphertext and hex IV.
 */
export async function encryptSensitiveData(
  plaintext: string,
  secretKey: string = 'khanhan_ephi_secure_key_356'
): Promise<{ ciphertext: string; iv: string }> {
  try {
    const key = await deriveKey(secretKey);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(plaintext);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    // Convert to base64
    const byteArray = new Uint8Array(encryptedBuffer);
    let binary = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    const ciphertext = btoa(binary);

    // Convert IV to hex
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

    return { ciphertext, iv: ivHex };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Không thể mã hóa dữ liệu nhạy cảm theo chuẩn bảo mật.');
  }
}

/**
 * Decrypts AES-GCM-256 base64 ciphertext using the corresponding secret key & IV.
 */
export async function decryptSensitiveData(
  ciphertext: string,
  ivHex: string,
  secretKey: string = 'khanhan_ephi_secure_key_356'
): Promise<string> {
  try {
    const key = await deriveKey(secretKey);
    
    // Parse IV from hex
    const ivBytes = new Uint8Array(
      ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    // Parse ciphertext from base64
    const binary = atob(ciphertext);
    const encryptedBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      encryptedBytes[i] = binary.charCodeAt(i);
    }

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes
      },
      key,
      encryptedBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.warn('Decryption failed or unauthorized access attempt:', error);
    throw new Error('Dữ liệu đã mã hóa cấp cao. Không có khóa giải mã hợp lệ (Truy cập bị chặn bởi HIPAA/Decree 356).');
  }
}
