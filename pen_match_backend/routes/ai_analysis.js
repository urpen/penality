const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { createOrder, verifyPayment } = require('../utils/payment');

// Mock AI analysis function (replace with actual AI API call)
async function generateAIAnalysis(userId) {
    // Get user's answers with questions
    const [answers] = await db.query(`
        SELECT q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
               a.selected_option
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.user_id = ?
        ORDER BY q.id
    `, [userId]);

    if (answers.length === 0) {
        throw new Error('用户尚未完成测试');
    }

    // Build prompt for AI
    let prompt = `你是一位国际上享誉盛名的心理学大师。请基于以下一个人在心理测试中的30道题目及其选择，生成一份深度的性格分析报告。\n\n`;

    answers.forEach((answer, index) => {
        const optionMap = { A: answer.option_a, B: answer.option_b, C: answer.option_c, D: answer.option_d };
        const selectedText = optionMap[answer.selected_option];

        prompt += `问题${index + 1}：${answer.question_text}\n`;
        prompt += `用户选择：${answer.selected_option}. ${selectedText}\n\n`;
    });

    prompt += `请生成一份包含以下部分的深度分析报告：
1. 性格核心特质总结
2. 深层心理动机分析
3. 潜在的性格优势
4. 需要警惕的性格盲区
5. 人际关系模式
6. 职业发展建议
7. 个人成长路径

报告应当专业、细致、有洞察力，长度约1000-1500字。`;

    // TODO: Replace this with actual AI API call (e.g., OpenAI, Claude, etc.)
    // For now, return a mock response
    const mockReport = `# 深度性格分析报告

## 一、性格核心特质总结
基于您在30道题目中的选择，我观察到您是一个既有理性思考能力，又保持着感性温度的人。您在面对选择时，会权衡多方因素，但不会被过度的犹豫所困扰。

## 二、深层心理动机分析
您的选择模式显示出一种对"意义"的追求。您不满足于表面的答案，总是试图理解事物背后的深层逻辑。这种特质使您在思考问题时更加深入，但有时也可能让您陷入过度分析。

## 三、潜在的性格优势
1. **平衡的判断力**：您能够在理性与感性之间找到平衡点
2. **开放的心态**：愿意接受不同的观点和可能性
3. **自我觉察**：对自己的内心世界有较清晰的认知

## 四、需要警惕的性格盲区
1. **完美主义倾向**：有时可能因为追求完美而错过机会
2. **过度思考**：在某些需要快速决策的场合可能会犹豫不决

## 五、人际关系模式
您倾向于与有深度、有思想的人建立联系。在关系中，您既是倾听者也是引导者，但需要注意不要因为过于独立而疏远了他人。

## 六、职业发展建议
适合从事需要深度思考和创造性的工作，如：
- 研究类工作
- 咨询顾问
- 创意产业
- 教育培训

## 七、个人成长路径
1. 学会在"思考"与"行动"之间找到更好的平衡
2. 培养更多的即兴应变能力
3. 接纳不完美，享受过程而非只关注结果

---
*本报告基于心理学原理和您的答题模式生成，仅供参考。*`;

    return mockReport;
}

// Get AI analysis report
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if report already exists
        const [reports] = await db.query(
            'SELECT report_content, is_paid, created_at FROM ai_reports WHERE user_id = ?',
            [userId]
        );

        if (reports.length > 0) {
            return res.json({
                success: true,
                report: reports[0].report_content,
                isPaid: reports[0].is_paid === 1,
                generatedAt: reports[0].created_at
            });
        }

        // No report found
        res.json({
            success: false,
            message: '报告尚未生成'
        });

    } catch (error) {
        console.error('Get AI analysis error:', error);
        res.status(500).json({
            success: false,
            message: '获取报告失败'
        });
    }
});

// Initiate payment for AI analysis
router.post('/:userId/pay', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { method } = req.body; // 'wechat' or 'alipay'

        if (!['wechat', 'alipay'].includes(method)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method' });
        }

        // Create order (amount could be fixed, e.g., 9.9)
        const order = await createOrder(userId, 9.9, method);

        res.json({
            success: true,
            orderId: order.orderId,
            paymentUrl: order.paymentUrl,
            qrCode: order.qrCode
        });

    } catch (error) {
        console.error('Payment init error:', error);
        res.status(500).json({ success: false, message: '支付初始化失败' });
    }
});

// Verify payment and generate report
router.post('/:userId/verify-payment', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { orderId } = req.body;

        // Verify payment status
        const paymentRes = await verifyPayment(orderId);

        if (paymentRes.success && paymentRes.status === 'PAID') {

            // Check if report already exists first
            const [existing] = await db.query('SELECT id FROM ai_reports WHERE user_id = ?', [userId]);

            let reportContent;
            if (existing.length === 0) {
                // Generate new report
                reportContent = await generateAIAnalysis(userId);
                await db.query(
                    `INSERT INTO ai_reports (user_id, report_content, is_paid, paid_at) 
                     VALUES (?, ?, 1, NOW())`,
                    [userId, reportContent]
                );
            } else {
                // Determine what to do if paid again or retrieving? 
                // Usually just update is_paid if it wasn't
                await db.query('UPDATE ai_reports SET is_paid = 1, paid_at = NOW() WHERE user_id = ?', [userId]);
                // Re-fetch or generate? Let's assume re-generate or fetch existing
                const [r] = await db.query('SELECT report_content FROM ai_reports WHERE user_id = ?', [userId]);
                if (r[0].report_content) {
                    reportContent = r[0].report_content;
                } else {
                    reportContent = await generateAIAnalysis(userId);
                    await db.query('UPDATE ai_reports SET report_content = ? WHERE user_id = ?', [reportContent, userId]);
                }
            }

            res.json({
                success: true,
                status: 'PAID',
                report: reportContent
            });

        } else {
            res.json({ success: false, status: 'PENDING', message: '支付尚未完成' });
        }

    } catch (error) {
        console.error('Payment verify error:', error);
        res.status(500).json({ success: false, message: '支付验证失败' });
    }
});

module.exports = router;
