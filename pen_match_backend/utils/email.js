const nodemailer = require('nodemailer');

// 内存存储验证码 (生产环境建议用 Redis)
const emailCodes = new Map();

// 创建邮件传输对象
// 如果环境变量未配置，默认只打印到控制台
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.qq.com', // 默认 QQ 邮箱
            port: process.env.EMAIL_PORT || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return null;
};

async function sendEmailCode(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码，有效期 10 分钟
    emailCodes.set(email, {
        code,
        expire: Date.now() + 10 * 60 * 1000
    });

    const transporter = createTransporter();

    console.log(`[EMAIL MOCK] To: ${email}, Code: ${code}`);

    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: '【Pen Match】您的登录验证码',
                text: `您的验证码是：${code}，有效期10分钟。请勿泄露给他人。`,
                html: `<div style="padding: 20px; background-color: #f8f9fa;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-bottom: 20px;">登录验证码</h2>
                            <p style="color: #666; font-size: 16px;">您好！</p>
                            <p style="color: #666; font-size: 16px;">您的验证码是：</p>
                            <div style="background-color: #e6f7ff; color: #1890ff; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 4px; margin: 20px 0; letter-spacing: 4px;">
                                ${code}
                            </div>
                            <p style="color: #999; font-size: 14px;">有效期10分钟，请勿泄露给他人。</p>
                        </div>
                       </div>`
            });
            return { success: true, code };
        } catch (error) {
            console.error('Send email failed:', error);
            // 这里为了开发方便，即使发送失败也返回 success: false, 但带上 code 供调试?
            // 不，发送失败就是失败
            return { success: false, message: '邮件发送失败，请检查配置或稍后重试' };
        }
    }

    // 如果没有配置 SMTP，仅作为模拟成功
    return { success: true, code, mock: true };
}

function verifyEmailCode(email, inputCode) {
    // 开发后门
    if (inputCode === '888888') return true;

    const record = emailCodes.get(email);
    if (!record) return false;

    if (Date.now() > record.expire) {
        emailCodes.delete(email);
        return false;
    }

    if (record.code === inputCode) {
        emailCodes.delete(email); // 验证成功立即删除
        return true;
    }

    return false;
}

module.exports = { sendEmailCode, verifyEmailCode };
