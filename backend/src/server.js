import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const fastify = Fastify({
  logger: true
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
});

await fastify.register(helmet);

// JWT secret을 decorator로 등록
fastify.decorate('jwtSecret', process.env.JWT_SECRET || 'your-secret-key-change-in-production');
fastify.decorate('jwtRefreshSecret', process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production');

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'HOS Contract Management API is running' };
});

// Register routes
await fastify.register(async function (fastify) {
  await fastify.register(import('./routes/auth.js'), { prefix: '/api/auth' });
  await fastify.register(import('./routes/contracts.js'), { prefix: '/api/contracts' });
  await fastify.register(import('./routes/statistics.js'), { prefix: '/api/statistics' });
  await fastify.register(import('./routes/users.js'), { prefix: '/api/users' });
  // await fastify.register(import('./routes/hospitals.js'), { prefix: '/api/hospitals' });
  // await fastify.register(import('./routes/doctors.js'), { prefix: '/api/doctors' });
  // await fastify.register(import('./routes/employees.js'), { prefix: '/api/employees' });
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
