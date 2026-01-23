/**
 * Script แก้ไขผลการแข่งขันที่ผิดพลาดใน Database
 * 
 * ปัญหาที่ต้องแก้:
 * 1. Day 1: ดีหม vs 4/1ไม่ตึงได้ไง - ควรเป็น ดีหม ชนะ 2-1 (ตอนนี้เป็น 4/1 ชนะ 2-0)
 * 2. Day 1: ไม่รู้ vs Kyozarainbow - ควรเป็น 2-0 (ตอนนี้เป็น 2-1)
 * 3. Day 3: Dolphin ชนะบาย 4/1 - ควรเป็น isByeWin: true (ตอนนี้เป็น false)
 * 
 * วิธีใช้: node scripts/fix-results.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env file!');
    process.exit(1);
}

// Result Schema (same as in server.js)
const ResultSchema = new mongoose.Schema({
    matchId: String,
    matchDay: Number,
    teamBlue: String,
    teamRed: String,
    scoreBlue: Number,
    scoreRed: Number,
    winner: String,
    loser: String,
    gameDetails: Array,
    isByeWin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', ResultSchema, 'results');

// Define the fixes to apply
const fixes = [
    {
        description: 'Day 1: ดีหม vs 4/1ไม่ตึงได้ไง - ดีหม ชนะ 2-1',
        // Find by both teams in Day 1
        filter: {
            matchDay: 1,
            $or: [
                { teamBlue: '4/1ไม่ตึงได้ไง', teamRed: 'ดีหม' },
                { teamBlue: 'ดีหม', teamRed: '4/1ไม่ตึงได้ไง' }
            ]
        },
        // Update to correct values
        update: {
            $set: {
                teamBlue: '4/1ไม่ตึงได้ไง',
                teamRed: 'ดีหม',
                scoreBlue: 1,
                scoreRed: 2,
                winner: 'ดีหม',
                loser: '4/1ไม่ตึงได้ไง',
                isByeWin: false
            }
        }
    },
    {
        description: 'Day 1: ไม่รู้ vs Kyozarainbow - ไม่รู้ ชนะ 2-0',
        filter: {
            matchDay: 1,
            $or: [
                { teamBlue: 'ไม่รู้', teamRed: 'Kyozarainbow' },
                { teamBlue: 'Kyozarainbow', teamRed: 'ไม่รู้' }
            ]
        },
        update: {
            $set: {
                scoreBlue: 2,
                scoreRed: 0,
                winner: 'ไม่รู้',
                loser: 'Kyozarainbow',
                isByeWin: false
            }
        }
    },
    {
        description: 'Day 3: Dolphin ชนะบาย 4/1ไม่ตึงได้ไง',
        filter: {
            matchDay: 3,
            $or: [
                { teamBlue: 'Dolphin', teamRed: '4/1ไม่ตึงได้ไง' },
                { teamBlue: '4/1ไม่ตึงได้ไง', teamRed: 'Dolphin' }
            ]
        },
        update: {
            $set: {
                winner: 'Dolphin',
                loser: '4/1ไม่ตึงได้ไง',
                scoreBlue: 0,
                scoreRed: 0,
                isByeWin: true,
                gameDetails: []
            }
        }
    }
];

async function fixResults() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('📋 Starting to fix results...\n');
        console.log('='.repeat(60));

        for (const fix of fixes) {
            console.log(`\n🔧 ${fix.description}`);

            // First, find the existing record
            const existing = await Result.findOne(fix.filter);

            if (!existing) {
                console.log('   ⚠️ Record not found! Skipping...');
                continue;
            }

            console.log(`   📌 Found: ${existing.teamBlue} vs ${existing.teamRed}`);
            console.log(`   📌 Current: ${existing.scoreBlue}-${existing.scoreRed}, Winner: ${existing.winner}, isByeWin: ${existing.isByeWin}`);

            // Apply the fix
            const result = await Result.updateOne(fix.filter, fix.update);

            if (result.modifiedCount > 0) {
                // Fetch updated record to show new values
                const updated = await Result.findOne(fix.filter);
                console.log(`   ✅ Fixed: ${updated.scoreBlue}-${updated.scoreRed}, Winner: ${updated.winner}, isByeWin: ${updated.isByeWin}`);
            } else {
                console.log('   ℹ️ No changes made (already correct?)');
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ All fixes completed!\n');

        // Show summary of all results for verification
        console.log('📊 Final Results Summary:');
        console.log('-'.repeat(60));

        const allResults = await Result.find().sort({ matchDay: 1 });

        let currentDay = 0;
        for (const r of allResults) {
            if (r.matchDay !== currentDay) {
                currentDay = r.matchDay;
                console.log(`\n📅 Match Day ${currentDay}:`);
            }

            const byeTag = r.isByeWin ? ' [BYE]' : '';
            console.log(`   ${r.teamBlue} ${r.scoreBlue} - ${r.scoreRed} ${r.teamRed} → Winner: ${r.winner}${byeTag}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the fix
fixResults();
