import crypto from 'crypto';

/**
 * 주민등록번호 암호화 (AES-256)
 */
export function encryptRegistrationNumber(registrationNumber) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
    'salt',
    32
  );
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(registrationNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * 주민등록번호 복호화
 */
export function decryptRegistrationNumber(encryptedData) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
    'salt',
    32
  );
  const iv = Buffer.from(encryptedData.iv, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * UUID 생성
 */
export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * 랜덤 문자열 생성 (인증 코드 등)
 */
export function generateRandomString(length = 6) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}
