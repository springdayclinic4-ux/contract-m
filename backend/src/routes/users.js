import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

async function userRoutes(fastify, options) {
  /**
   * 내 정보 조회
   * GET /api/users/me
   */
  fastify.get('/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    let user;
    
    switch (session.userType) {
      case 'hospital':
        user = await prisma.hospital.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            email: true,
            businessRegistrationNumber: true,
            hospitalName: true,
            directorName: true,
            hospitalAddress: true,
            hospitalPhone: true,
            managerName: true,
            managerPhone: true,
            hospitalLogoUrl: true,
            hospitalSealUrl: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
          }
        });
        break;
      case 'doctor':
        user = await prisma.doctor.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            email: true,
            name: true,
            licenseNumber: true,
            address: true,
            phone: true,
            bankName: true,
            accountNumber: true,
            signatureImageUrl: true,
            sealImageUrl: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
          }
        });
        break;
      case 'employee':
        user = await prisma.employee.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            email: true,
            name: true,
            birthDate: true,
            address: true,
            phone: true,
            bankName: true,
            accountNumber: true,
            signatureImageUrl: true,
            sealImageUrl: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
          }
        });
        break;
    }

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    return {
      success: true,
      data: {
        ...user,
        type: session.userType
      }
    };
  });

  /**
   * 내 정보 수정
   * PUT /api/users/me
   */
  fastify.put('/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const data = request.body;
    let updatedUser;

    switch (session.userType) {
      case 'hospital':
        updatedUser = await prisma.hospital.update({
          where: { id: session.userId },
          data: {
            hospitalName: data.hospital_name,
            directorName: data.director_name,
            hospitalAddress: data.hospital_address,
            hospitalPhone: data.hospital_phone,
            managerName: data.manager_name || null,
            managerPhone: data.manager_phone || null,
            hospitalLogoUrl: data.hospital_logo_url || null,
            hospitalSealUrl: data.hospital_seal_url || null
          }
        });
        break;
      case 'doctor':
        updatedUser = await prisma.doctor.update({
          where: { id: session.userId },
          data: {
            name: data.name,
            address: data.address,
            phone: data.phone || null,
            bankName: data.bank_name || null,
            accountNumber: data.account_number || null,
            signatureImageUrl: data.signature_image_url || null,
            sealImageUrl: data.seal_image_url || null
          }
        });
        break;
      case 'employee':
        updatedUser = await prisma.employee.update({
          where: { id: session.userId },
          data: {
            name: data.name,
            birthDate: data.birth_date ? new Date(data.birth_date) : null,
            address: data.address,
            phone: data.phone || null,
            bankName: data.bank_name || null,
            accountNumber: data.account_number || null,
            signatureImageUrl: data.signature_image_url || null,
            sealImageUrl: data.seal_image_url || null
          }
        });
        break;
    }

    return {
      success: true,
      message: '정보가 수정되었습니다.',
      data: updatedUser
    };
  });

  /**
   * 비밀번호 변경
   * PUT /api/users/me/password
   */
  fastify.put('/me/password', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const { current_password, new_password } = request.body;

    if (!current_password || !new_password) {
      return reply.status(400).send({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 입력해주세요.'
      });
    }

    // 현재 사용자 조회
    let user;
    let table;
    
    switch (session.userType) {
      case 'hospital':
        user = await prisma.hospital.findUnique({
          where: { id: session.userId }
        });
        table = prisma.hospital;
        break;
      case 'doctor':
        user = await prisma.doctor.findUnique({
          where: { id: session.userId }
        });
        table = prisma.doctor;
        break;
      case 'employee':
        user = await prisma.employee.findUnique({
          where: { id: session.userId }
        });
        table = prisma.employee;
        break;
    }

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 현재 비밀번호 확인
    const passwordMatch = await bcrypt.compare(current_password, user.passwordHash);
    if (!passwordMatch) {
      return reply.status(400).send({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // 새 비밀번호 해시
    const newPasswordHash = await bcrypt.hash(new_password, 10);

    // 비밀번호 업데이트
    await table.update({
      where: { id: session.userId },
      data: { passwordHash: newPasswordHash }
    });

    return {
      success: true,
      message: '비밀번호가 변경되었습니다.'
    };
  });
}

export default userRoutes;
