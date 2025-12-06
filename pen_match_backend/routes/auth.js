const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { isValidPhone, sanitizeInput } = require('../utils/validation');

// Import Email utility
const { sendEmailCode, verifyEmailCode } = require('../utils/email');

// Send verification code endpoint
router.post('/send-code', async (req, res) => {
    try {
        const { email } = req.body;

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的邮箱地址'
            });
        }

        // Use Email utility
        const result = await sendEmailCode(email);

        if (result.success) {
            res.json({
                success: true,
                message: '验证码已发送至您的邮箱',
                debugCode: result.code // For dev convenience
            });
        } else {
            res.status(500).json({
                success: false,
                message: '邮件发送失败，请稍后重试'
            });
        }

    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({
            success: false,
            message: '发送验证码失败'
        });
    }
});

// Verify login endpoint
router.post('/verify-login', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '请输入邮箱和验证码'
            });
        }

        // Verify code
        const isValid = verifyEmailCode(email, code);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: '验证码错误或已失效'
            });
        }

        // Check if user exists (by email)
        const [users] = await db.query(
            'SELECT id, username, pen_type FROM users WHERE email = ?',
            [email]
        );

        let user;
        let isNewUser = false;

        if (users.length === 0) {
            // Register new user with Email
            const username = `User_${email.split('@')[0]}`;
            const [result] = await db.query(
                'INSERT INTO users (email, username) VALUES (?, ?)',
                [email, username]
            );
            user = {
                id: result.insertId,
                username: username,
                pen_type: null
            };
            isNewUser = true;
        } else {
            user = users[0];
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            userId: user.id,
            username: user.username,
            penType: user.pen_type,
            isNewUser
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: '登录失败'
        });
    }
});

module.exports = router;
