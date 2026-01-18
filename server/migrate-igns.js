/**
 * Migration Script: Map old IGNs to real player names
 * 
 * วิธีใช้:
 * 1. แก้ไข IGN_MAPPING ด้านล่างให้ตรงกับข้อมูลจริง
 * 2. รัน: node migrate-igns.js
 * 
 * Script นี้จะ:
 * - เพิ่ม IGN เก่าเข้าไปใน previousIGNs ของผู้เล่นที่ถูกต้อง
 * - ทำให้สถิติรวมกันอัตโนมัติ
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ===== กรุณาแก้ไข MAPPING ด้านล่าง =====
// Format: { "IGN เก่า": "ชื่อจริงของผู้เล่น" }
const IGN_MAPPING = {
    "น้องม่อนห้าสิบหก": "อลงกรณ์ สุริย์แสง",
    "S>1": "พิชิตชัย บูชา",
    "ก็กุจะเล่นเเครี่": "เอกวนิช เรืองเชื้อเหมือน",
};
// =====================================

// Schema (ต้องตรงกับ server.js)
const PlayerPoolSchema = new mongoose.Schema({
    name: String,
    grade: String,
    team: String,
    inGameName: String,
    previousIGNs: [String],
    openId: String,
    createdAt: { type: Date, default: Date.now }
});
const PlayerPool = mongoose.model('PlayerPool', PlayerPoolSchema, 'playerpool');

async function migrate() {
    try {
        // Connect to MongoDB
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error('❌ MONGO_URI not found in .env file!');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Process each mapping
        let successCount = 0;
        let errorCount = 0;

        for (const [oldIGN, realName] of Object.entries(IGN_MAPPING)) {
            console.log(`📝 Processing: "${oldIGN}" → "${realName}"`);

            // Find player by realName
            const player = await PlayerPool.findOne({ name: realName });

            if (!player) {
                console.log(`   ❌ Player "${realName}" not found in PlayerPool`);
                errorCount++;
                continue;
            }

            // Add old IGN to previousIGNs
            player.previousIGNs = player.previousIGNs || [];
            if (player.previousIGNs.includes(oldIGN)) {
                console.log(`   ⏭️ "${oldIGN}" already in previousIGNs, skipping...`);
                continue;
            }

            player.previousIGNs.push(oldIGN);
            await player.save();

            console.log(`   ✅ Added "${oldIGN}" to ${realName}'s previousIGNs`);
            console.log(`   📋 Current previousIGNs: [${player.previousIGNs.join(', ')}]`);
            successCount++;
        }

        console.log('\n========== SUMMARY ==========');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('=============================\n');

        // Show all unmatched IGNs for reference
        const GameStat = mongoose.model('GameStat', new mongoose.Schema({ playerName: String, teamName: String }), 'gamestats');
        const players = await PlayerPool.find({});
        const statsIGNs = await GameStat.distinct('playerName');

        const knownIGNs = new Set();
        players.forEach(p => {
            if (p.name) knownIGNs.add(p.name);
            if (p.inGameName) knownIGNs.add(p.inGameName);
            (p.previousIGNs || []).forEach(ign => knownIGNs.add(ign));
        });

        const stillUnmatched = statsIGNs.filter(ign => !knownIGNs.has(ign));

        if (stillUnmatched.length > 0) {
            console.log('⚠️ IGNs ที่ยังไม่ได้ Mapping (เพิ่มใน IGN_MAPPING แล้วรันอีกครั้ง):');
            for (const ign of stillUnmatched) {
                const sample = await GameStat.findOne({ playerName: ign });
                console.log(`   - "${ign}" (Team: ${sample?.teamName || 'Unknown'})`);
            }
        } else {
            console.log('🎉 All IGNs are mapped! Stats should now be merged correctly.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

migrate();
