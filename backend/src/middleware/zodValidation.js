// Zod 스키마를 Fastify preValidation 훅으로 변환하는 헬퍼
export function zodValidation(schema) {
  return async (request, reply) => {
    try {
      // body 검증
      if (schema.body) {
        request.body = await schema.body.parseAsync(request.body);
      }
      
      // params 검증
      if (schema.params) {
        request.params = await schema.params.parseAsync(request.params);
      }
      
      // query 검증
      if (schema.query) {
        request.query = await schema.query.parseAsync(request.query);
      }
      
      // headers 검증
      if (schema.headers) {
        request.headers = await schema.headers.parseAsync(request.headers);
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        message: '입력 데이터 검증 실패',
        errors: error.errors?.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })) || []
      });
    }
  };
}
