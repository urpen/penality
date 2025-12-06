// 模拟支付网关
// 实际生产环境需接入官方 SDK

async function createOrder(userId, amount, method) {
    // 模拟创建订单
    const orderId = `ORDER_${Date.now()}_${userId}`;
    console.log(`[MOCK PAYMENT] Creating order ${orderId} for User ${userId}, Amount: ${amount}, Method: ${method}`);

    return {
        success: true,
        orderId,
        paymentUrl: `https://mock-payment-gateway.vercel.app/pay?method=${method}&orderId=${orderId}&amount=${amount}`, // Simulate a real gateway URL
        qrCode: null // Remove qrCode as requested
    };
}

async function verifyPayment(orderId) {
    // 模拟查询支付状态
    // 开发环境：默认支付成功
    console.log(`[MOCK PAYMENT] Verifying order ${orderId}`);
    return {
        success: true,
        status: 'PAID', // PAID, PENDING, FAILED
        paidAt: new Date()
    };
}

module.exports = { createOrder, verifyPayment };
