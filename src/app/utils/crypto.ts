import CryptoJS from 'crypto-js';

const SECRET_KEY: string = process.env.NEXT_PUBLIC_SECRET_KEY || '';

export const encryptData = (data: object): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decryptData = (ciphertext: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};
