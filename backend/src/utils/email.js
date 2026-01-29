import AWS from 'aws-sdk';

const awsRegion = process.env.AWS_REGION || 'ap-northeast-2';
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const fromEmail = process.env.AWS_SES_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@terranova.co.kr';
const hasAwsCredentials = Boolean(awsAccessKeyId && awsSecretAccessKey);
const useMockEmail = process.env.MOCK_EMAIL === 'true';

// AWS SES 설정
const ses = new AWS.SES({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey
});

/**
 * 이메일 인증 코드 발송
 */
export async function sendVerificationEmail(email, verificationCode) {
  // 개발 모드에서 자격 증명이 없으면 콘솔에 인증 코드 출력
  if (useMockEmail || (process.env.NODE_ENV === 'development' && !hasAwsCredentials)) {
    console.log('\n========================================');
    console.log('📧 이메일 인증 코드 (개발 모드)');
    console.log('========================================');
    console.log(`받는 사람: ${email}`);
    console.log(`인증 코드: ${verificationCode}`);
    console.log(`발신자: ${fromEmail}`);
    console.log('========================================\n');
    return { success: true, messageId: 'dev-mode' };
  }

  // 프로덕션 모드에서는 실제 이메일 발송
  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: '[HOS] 이메일 인증 코드',
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>이메일 인증</h2>
              <p>안녕하세요,</p>
              <p>HOS 플랫폼 회원가입을 위한 이메일 인증 코드입니다.</p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #2563eb; letter-spacing: 5px;">${verificationCode}</h1>
              </div>
              <p>이 코드는 10분간 유효합니다.</p>
              <p>본인이 요청한 것이 아니라면 이 이메일을 무시하세요.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">HOS Contract Management System</p>
            </div>
          `,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('이메일 발송에 실패했습니다.');
  }
}

/**
 * 계약서 초대 이메일 발송
 */
export async function sendContractInvitationEmail(email, invitationToken, contractType = 'contract') {
  // 개발 모드에서 자격 증명이 없으면 콘솔에 초대 링크 출력
  if (useMockEmail || (process.env.NODE_ENV === 'development' && !hasAwsCredentials)) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationLink = `${frontendUrl}/contracts/invitation/${invitationToken}`;
    
    console.log('\n========================================');
    console.log('📧 계약서 초대 이메일 (개발 모드)');
    console.log('========================================');
    console.log(`받는 사람: ${email}`);
    console.log(`초대 링크: ${invitationLink}`);
    console.log(`발신자: ${fromEmail}`);
    console.log('========================================\n');
    return { success: true, messageId: 'dev-mode' };
  }

  // 프로덕션 모드에서는 실제 이메일 발송
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const invitationLink = `${frontendUrl}/contracts/invitation/${invitationToken}`;
  
  const contractTypeName = contractType === 'contract' ? '의사 일용직 근로계약서' : '근로계약서';
  
  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: `[HOS] ${contractTypeName} 서명 요청`,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${contractTypeName} 서명 요청</h2>
              <p>안녕하세요,</p>
              <p>${contractTypeName} 서명을 요청받았습니다.</p>
              <p>아래 링크를 클릭하여 계약서를 확인하고 서명해주세요.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" 
                   style="background-color: #2563eb; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  계약서 확인 및 서명하기
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                링크는 7일간 유효합니다.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                링크가 작동하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:<br>
                ${invitationLink}
              </p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">HOS Contract Management System</p>
            </div>
          `,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('이메일 발송에 실패했습니다.');
  }
}
