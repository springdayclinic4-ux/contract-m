import prisma from '../config/database.js';
import { verifyToken } from '../utils/jwt.js';

const ADMIN_EMAIL = 'springdayclinic4@gmail.com';

/**
 * Admin authentication middleware
 * Verifies JWT token has isAdmin: true and email matches the authorized admin
 */
export async function requireAdmin(request, reply) {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    reply.status(401).send({ success: false, message: '인증이 필요합니다.' });
    return false;
  }

  // Verify session exists
  const session = await prisma.session.findFirst({
    where: { accessToken: token }
  });

  if (!session) {
    reply.status(401).send({ success: false, message: '유효하지 않은 토큰입니다.' });
    return false;
  }

  // Verify JWT payload has admin flag
  try {
    const jwtSecret = request.server.jwtSecret;
    const payload = verifyToken(token, jwtSecret);

    if (!payload.isAdmin || payload.email?.toLowerCase() !== ADMIN_EMAIL) {
      reply.status(403).send({ success: false, message: '관리자 권한이 없습니다.' });
      return false;
    }

    request.adminUser = payload;
    return true;
  } catch (err) {
    reply.status(401).send({ success: false, message: '토큰이 만료되었거나 유효하지 않습니다.' });
    return false;
  }
}
