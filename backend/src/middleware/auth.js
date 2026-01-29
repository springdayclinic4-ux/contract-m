import prisma from '../config/database.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * JWT 토큰 검증 미들웨어 (Fastify decorator)
 */
export async function authenticateToken(request, reply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const jwtSecret = request.server.jwtSecret;
    const decoded = verifyToken(token, jwtSecret);
    
    // 세션 확인
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        userType: decoded.userType,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 세션입니다.'
      });
    }

    // 요청 객체에 사용자 정보 추가
    request.user = {
      id: decoded.userId,
      type: decoded.userType,
      email: decoded.email
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return reply.status(401).send({
        success: false,
        message: '토큰이 만료되었습니다.'
      });
    }
    throw error;
  }
}

/**
 * 사용자 유형별 권한 확인 미들웨어
 */
export function requireUserType(...allowedTypes) {
  return async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    if (!allowedTypes.includes(request.user.type)) {
      return reply.status(403).send({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }
  };
}
