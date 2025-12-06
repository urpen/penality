// 模拟短信服务
// 实际生产环境应替换为阿里云/腾讯云等SDK

const codes = new Map(); // 简单内存存储：手机号 -> {code, expire}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phone) {
    const code = generateCode();

    // 存储验证码，5分钟有效
    codes.set(phone, {
        code,
        expire: Date.now() + 5 * 60 * 1000
    });

    // 真正的短信发送逻辑会在这里调用第三方API
    // 阿里云 SDK 示例：
    // await client.sendSms({ PhoneNumbers: phone, SignName: '...', TemplateCode: '...', TemplateParam: `{"code":"${code}"}` });

    console.log(`[SMS MOCK] To: ${phone}, Code: ${code}`);
    return { success: true, code }; // 返回code仅用于开发调试方便前端展示
}

function verifyCode(phone, inputCode) {
    // 开发后门：如果输入 888888 直接通过
    if (inputCode === '888888') return true;

    const record = codes.get(phone);
    if (!record) return false;

    if (Date.now() > record.expire) {
        codes.delete(phone);
        return false;
    }

    if (record.code === inputCode) {
        codes.delete(phone); // 验证成功后立即删除，防止重放
        return true;
    }

    return false;
}

module.exports = { sendSMS, verifyCode };
