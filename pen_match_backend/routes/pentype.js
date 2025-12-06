const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get pen type for a user
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if user exists
        const [users] = await db.query('SELECT id, username FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // Get all answers for this user with their corresponding pen types
        const [answers] = await db.query(`
      SELECT 
        a.selected_option,
        CASE 
          WHEN a.selected_option = 'A' THEN q.pen_type_a
          WHEN a.selected_option = 'B' THEN q.pen_type_b
          WHEN a.selected_option = 'C' THEN q.pen_type_c
          WHEN a.selected_option = 'D' THEN q.pen_type_d
        END as pen_type
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
    `, [userId]);

        if (answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: '用户尚未完成测试'
            });
        }

        // Count pen types
        const penTypeCounts = {};
        answers.forEach(answer => {
            const penType = answer.pen_type;
            penTypeCounts[penType] = (penTypeCounts[penType] || 0) + 1;
        });

        // Find the most frequent pen type
        let maxCount = 0;
        let dominantPenType = null;

        for (const [penType, count] of Object.entries(penTypeCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantPenType = penType;
            }
        }

        // Update user's pen_type in database
        await db.query(
            'UPDATE users SET pen_type = ? WHERE id = ?',
            [dominantPenType, userId]
        );

        // Get pen type details
        const [penTypes] = await db.query(
            'SELECT name, type_name, slogan, core_persona, shadow_side, masters_advice, description FROM pen_types WHERE type_name = ?',
            [dominantPenType]
        );

        if (penTypes.length === 0) {
            return res.json({
                success: true,
                penType: {
                    name: dominantPenType,
                    slogan: '',
                    description: '暂无描述',
                    shadow_side: '',
                    advice: '',
                    characteristics: '暂无特征',
                    distribution: penTypeCounts
                }
            });
        }

        res.json({
            success: true,
            penType: {
                type: penTypes[0].type_name,
                name: penTypes[0].name || penTypes[0].type_name, // Use Chinese name if available
                slogan: penTypes[0].slogan,
                description: penTypes[0].core_persona || penTypes[0].description, // Use core_persona as main description
                shadow_side: penTypes[0].shadow_side,
                advice: penTypes[0].masters_advice,
                distribution: penTypeCounts
            }
        });

    } catch (error) {
        console.error('Get pen type error:', error);
        res.status(500).json({
            success: false,
            message: '获取钢笔类型失败'
        });
    }
});

module.exports = router;
