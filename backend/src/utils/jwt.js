import jwt from 'jsonwebtoken';

/**
 * JWT Access Token 생성
 */
export function signAccessToken(payload, secret, expiresIn = '24h') {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * JWT Refresh Token 생성
 */
export function signRefreshToken(payload, secret, expiresIn = '7d') {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * JWT Token 검증
 */
export function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
}
