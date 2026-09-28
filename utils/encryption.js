import CryptoJS from 'crypto-js';

const secretKey = 'C7d8h2uu@1'; // Consider moving this to an environment variable for better security

export const encryptText = (text) => {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

export const decryptText = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Generates compact, URL-safe ciphertext (safe from query string + / = corruption)
export const encryptURLText = (text) => {
  const cipherText = CryptoJS.AES.encrypt(text, secretKey).toString();
  return cipherText.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Decrypts both URL-safe base64 and standard/legacy base64 (even if '+' became ' ' via URL decoding)
export const decryptURLText = (cipherText) => {
  if (!cipherText || typeof cipherText !== 'string') return '';
  let cleaned = decodeURIComponent(cipherText.trim());
  // Normalize query param spaces back to pluses
  cleaned = cleaned.replace(/ /g, '+');
  // Normalize URL-safe base64 (- and _) back to standard base64 (+ and /)
  cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if necessary
  while (cleaned.length % 4 !== 0) {
    cleaned += '=';
  }
  const bytes = CryptoJS.AES.decrypt(cleaned, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
