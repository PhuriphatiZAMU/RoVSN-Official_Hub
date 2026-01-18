/**
 * Check Heroes in Database
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function checkHeroes() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        const Hero = mongoose.model('Hero',
            new mongoose.Schema({ name: String, imageUrl: String }),
            'heroes'
        );

        const totalCount = await Hero.countDocuments();
        const withImage = await Hero.countDocuments({ imageUrl: { $exists: true, $ne: null, $ne: '' } });
        const withoutImage = totalCount - withImage;

        console.log(`📊 Total Heroes: ${totalCount}`);
        console.log(`   ✅ With Image URL: ${withImage}`);
        console.log(`   ❌ Without Image URL: ${withoutImage}`);

        // Show sample of heroes with and without images
        const sampleWithImage = await Hero.findOne({ imageUrl: { $exists: true, $ne: null, $ne: '' } });
        const sampleWithoutImage = await Hero.findOne({ $or: [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: '' }] });

        console.log('\n📋 Sample Hero WITH image:');
        console.log(sampleWithImage ? JSON.stringify(sampleWithImage, null, 2) : '   None found');

        console.log('\n📋 Sample Hero WITHOUT image:');
        console.log(sampleWithoutImage ? JSON.stringify(sampleWithoutImage, null, 2) : '   None found');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected');
    }
}

checkHeroes();
