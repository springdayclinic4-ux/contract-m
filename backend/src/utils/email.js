import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const useMockEmail = process.env.MOCK_EMAIL === 'true';

// Gmail SMTP 설정
const transporter = gmailUser && gmailAppPassword
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })
  : null;

/**
 * 이메일 인증 코드 발송
 */
export async function sendVerificationEmail(email, verificationCode) {
  // Mock 모드
  if (useMockEmail || !transporter) {
    console.log('\n========================================');
    console.log('[MOCK] 이메일 인증 코드');
    console.log(`받는 사람: ${email}`);
    console.log(`인증 코드: ${verificationCode}`);
    console.log('========================================\n');
    return { success: true, messageId: 'mock-mode' };
  }

  const mailOptions = {
    from: `"HOS 계약관리" <${gmailUser}>`,
    to: email,
    subject: '[HOS] 이메일 인증 코드',
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e40af; margin-bottom: 20px;">이메일 인증</h2>
        <p>안녕하세요, HOS 계약관리 시스템입니다.</p>
        <p>아래 인증 코드를 입력해주세요.</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
          <h1 style="color: #fff; letter-spacing: 8px; margin: 0; font-size: 32px;">${verificationCode}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">이 코드는 <strong>10분간</strong> 유효합니다.</p>
        <p style="color: #6b7280; font-size: 14px;">본인이 요청한 것이 아니라면 이 이메일을 무시하세요.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">HOS Contract Management System</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] 인증 코드 발송 완료: ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[EMAIL] 발송 실패:', error.message);
    throw new Error('이메일 발송에 실패했습니다.');
  }
}

/**
 * 계약서 초대 이메일 발송
 */
export async function sendContractInvitationEmail(email, invitationToken, contractType = 'contract') {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const invitationLink = `${frontendUrl}/contracts/invitation/${invitationToken}`;
  const contractTypeName = contractType === 'contract' ? '의사 일용직 근로계약서' : '근로계약서';

  // Mock 모드
  if (useMockEmail || !transporter) {
    console.log('\n========================================');
    console.log('[MOCK] 계약서 초대 이메일');
    console.log(`받는 사람: ${email}`);
    console.log(`초대 링크: ${invitationLink}`);
    console.log('========================================\n');
    return { success: true, messageId: 'mock-mode' };
  }

  const mailOptions = {
    from: `"HOS 계약관리" <${gmailUser}>`,
    to: email,
    subject: `[HOS] ${contractTypeName} 서명 요청`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e40af; margin-bottom: 20px;">${contractTypeName} 서명 요청</h2>
        <p>안녕하세요,</p>
        <p>${contractTypeName} 서명을 요청받았습니다.</p>
        <p>아래 버튼을 클릭하여 계약서를 확인하고 서명해주세요.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}"
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px;
                    text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            계약서 확인 및 서명하기
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">링크는 7일간 유효합니다.</p>
        <p style="color: #9ca3af; font-size: 12px;">
          링크가 작동하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:<br>
          ${invitationLink}
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px;">HOS Contract Management System</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] 초대 이메일 발송 완료: ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[EMAIL] 발송 실패:', error.message);
    throw new Error('이메일 발송에 실패했습니다.');
  }
}
