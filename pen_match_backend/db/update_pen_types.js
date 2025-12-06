const db = require('./connection');

const newPenTypes = [
    {
        type_name: 'FountainPen',
        name: '钢笔',
        slogan: '墨守成规，是为了刻下不朽。',
        core_persona: '你就像一支做工考究的钢笔。你的人生信条是**“秩序”与“完美”**。你逻辑严密，原则性极强，就像钢笔的笔尖，必须在特定的角度下才能书写流畅。在旁人眼中，你是可靠的精英，是中流砥柱。你厌恶混乱，追求一种经典、永恒的美感。你做的每一个决定，都像是签下名字一样郑重。',
        shadow_side: '易折断的刚强。 钢笔一旦摔落，笔尖就会受损。你很难原谅自己的错误，也很难接受突如其来的变故。你的“高标准”有时会变成自我折磨的枷锁。',
        masters_advice: '允许墨水偶尔洇开一点。不完美并没有你想象中那么可怕，那是生活真实的纹理。'
    },
    {
        type_name: 'Pencil',
        name: '铅笔',
        slogan: '允许犯错，是成长的特权。',
        core_persona: '你是温柔而包容的铅笔。你拥有最珍贵的能力——“修正”。你并不急于给人生下定论，你总觉得一切还有回旋的余地。你敏感、细腻，拥有极强的同理心。你愿意试错，愿意在白纸上轻轻勾勒，如果不满意，你随时准备重新来过。你代表着无限的“可能性”。',
        shadow_side: '随着书写而消磨。 因为总是犹豫不决（不断地涂改），你可能会感到自我消耗严重。你有时候太容易妥协，不仅擦掉了错误，也擦掉了自己的棱角。',
        masters_advice: '有些线条，画下了就不要擦。用力地描黑它，哪怕它是歪的，那也是你真实的轨迹。'
    },
    {
        type_name: 'Marker',
        name: '马克笔',
        slogan: '若不热烈，便与虚无无异。',
        core_persona: '你是一支色彩浓烈的马克笔。你拒绝平庸的黑白灰，你活着的意义就是**“表达”与“感染”**。你情绪充沛，爱恨分明，自带戏剧张力。你不在乎能不能永恒保存，你在乎的是划过纸面的那一瞬间，是否足够惊艳。你是人群中的焦点，是打破沉闷气氛的那个破局者。',
        shadow_side: '无法掩饰的渗透。 马克笔的墨水太足，容易渗透纸背，正如你的情绪有时会失控，伤及无辜。且墨水干得快，你的热情可能来得快去得也快。',
        masters_advice: '学会在色彩之间留白。如果你把画布填得太满，别人就看不见你想表达的重点了。'
    },
    {
        type_name: 'Quill',
        name: '羽毛笔',
        slogan: '我属于天空，只是偶尔路过纸面。',
        core_persona: '你是一支来自旧时代的羽毛笔。你身上有一种与生俱来的**“疏离感”**。你浪漫、怀旧、理想主义，注重精神世界的共鸣远胜于物质的享受。你就像风一样难以捕捉，常常以旁观者的视角审视这个喧嚣的世界。你的文字（思想）优雅而飘逸，但也因为太古老，能读懂的人并不多。',
        shadow_side: '对现实的脆弱。 羽毛笔需要频繁蘸墨水才能书写，这意味着你其实极度依赖精神养分。一旦脱离了你的精神舒适区，你在现实世界中会显得脆弱且易碎。',
        masters_advice: '不要彻底切断与大地的联系。找一个现实中的锚点（一个人或一件事），防止自己飘向虚无。'
    },
    {
        type_name: 'BallpointPen',
        name: '圆珠笔',
        slogan: '在任何粗糙的表面，我都能书写生存。',
        core_persona: '你是坚韧务实的圆珠笔。你是**“幸存者”**的象征。不像钢笔娇贵，不像羽毛笔矫情，无论在墙壁、手背还是皱巴巴的纸上，你都能流畅书写。你拥有极强的适应力和抗压能力（钝感力）。你是这个社会最坚实的基石，不仅便宜（低调），而且耐用（长情）。',
        shadow_side: '被低估的平庸。 因为太好用、太常见，大家往往忽略了你的价值，甚至把你当作随手可弃的工具。你有时会因为过于务实而失去了做梦的能力。',
        masters_advice: '你是不可或缺的，但请记得，偶尔也可以换个颜色的笔芯，给枯燥的生活加点花样。'
    },
    {
        type_name: 'Brush',
        name: '毛笔',
        slogan: '至柔者至刚，万物皆流。',
        core_persona: '你是一支蕴含东方智慧的毛笔。你的性格**“外柔内刚”**。看起来柔软无骨，实则内力深厚。你懂得顺势而为，像水一样包容万物。你处理问题的方式不是硬碰硬，而是太极般的化解。你的思想境界很高，懂得“留白”的艺术，看透了世事无常，所以显得通透淡然。',
        shadow_side: '难以掌控的自由。 毛笔极难驾驭，这意味着常人很难真正理解你的节奏。你可能因为过于超脱，而显得对周围的人有些冷漠或难以亲近。',
        masters_advice: '有时候，如果不给那一笔“顿”下去的力量，事情是不会有结果的。入世一点，也是一种修行。'
    },
    {
        type_name: 'Highlighter',
        name: '荧光笔',
        slogan: '我不覆盖光明，我让光明更耀眼。',
        core_persona: '你是温暖而敏锐的荧光笔。你的天赋是**“洞察”与“利他”**。你通常不负责书写正文，但你一眼就能看到杂乱信息中的重点。你乐于成就他人，在团队中，你是那个理清思路、给予支持的角色。你的存在本身就是为了让别人被看见，你性格透明，没有阴暗的心机。',
        shadow_side: '依附性的空虚。 如果没有了原本的文本（需要你支持的人或事），你的存在感就会变弱。你习惯了照亮别人，却常常忘了自己也是一种颜色。',
        masters_advice: '试着在白纸上画出属于你自己的线条。即使没有文字衬托，你的光芒本身就很美。'
    },
    {
        type_name: 'InvisibleInk',
        name: '隐形笔',
        slogan: '真相只展示给对的人看。',
        core_persona: '你是一支神秘的隐形笔。你的核心特质是**“防御”与“深度”**。表面上，你可能看起来像一张白纸，甚至显得内向、平平无奇。但实际上，你的内心世界极其丰富汹涌。你极度缺乏安全感，所以将真实的自我加密了。只有在特定的条件（信任、危机、特定的光照）下，你才会显露真容。',
        shadow_side: '无人阅读的孤独。 因为藏得太深，大家容易误解你是一张空白页。你经常因为没人能读懂你的暗语而感到深刻的孤独。',
        masters_advice: '给这个世界一点提示吧。哪怕只是在角落里折一个角，告诉寻找你的人：“这里有秘密。”'
    }
];

async function updatePenTypes() {
    try {
        console.log('Starting Pen Types Update...');

        // 1. Add columns if not exist
        const columns = [
            'slogan VARCHAR(255)',
            'core_persona TEXT',
            'shadow_side TEXT',
            'masters_advice TEXT',
            'name VARCHAR(50)' // Simplified chinese name
        ];

        for (const col of columns) {
            try {
                await db.query(`ALTER TABLE pen_types ADD COLUMN ${col}`);
                console.log(`Added column: ${col}`);
            } catch (e) {
                // Ignore if exists
            }
        }

        // 2. Clear old pen_types
        // await db.query('TRUNCATE TABLE pen_types'); // Careful with FKs, maybe just upsert
        // Since we have questions referencing type_name (as string) or mapped, let's look at questions schema.
        // questions table uses strings: pen_type_a, pen_type_b, etc.
        // But pen_types table has type_name.
        // We should map old types to new types in questions FIRST to ensure data integrity logic.

        console.log('Mapping old types to new types in questions table...');
        const mappings = {
            'Chalk': 'Highlighter',
            'Crayon': 'BallpointPen',
            'Stylus': 'InvisibleInk'
        };

        for (const [oldType, newType] of Object.entries(mappings)) {
            const cols = ['pen_type_a', 'pen_type_b', 'pen_type_c', 'pen_type_d'];
            for (const col of cols) {
                await db.query(`UPDATE questions SET ${col} = ? WHERE ${col} = ?`, [newType, oldType]);
            }
            // Also delete old from pen_types if we are cleaning up
            await db.query('DELETE FROM pen_types WHERE type_name = ?', [oldType]);
            console.log(`Mapped ${oldType} -> ${newType}`);
        }

        // 3. Upsert new types
        console.log('Upserting new pen types...');
        for (const pen of newPenTypes) {
            // Check if exists
            const [exist] = await db.query('SELECT id FROM pen_types WHERE type_name = ?', [pen.type_name]);

            if (exist.length > 0) {
                await db.query(`
                    UPDATE pen_types 
                    SET name = ?, slogan = ?, core_persona = ?, shadow_side = ?, masters_advice = ?
                    WHERE type_name = ?
                `, [pen.name, pen.slogan, pen.core_persona, pen.shadow_side, pen.masters_advice, pen.type_name]);
            } else {
                await db.query(`
                    INSERT INTO pen_types (type_name, name, slogan, core_persona, shadow_side, masters_advice)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [pen.type_name, pen.name, pen.slogan, pen.core_persona, pen.shadow_side, pen.masters_advice]);
            }
        }

        console.log('✅ Pen Types updated successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updatePenTypes();
