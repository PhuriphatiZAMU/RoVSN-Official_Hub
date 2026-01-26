const API_URL = 'http://localhost:3000/api/results';
const REQUEST_COUNT = 50; // จำนวนครั้งที่จะทดสอบ

async function runBenchmark() {
    console.log(`🚀 Starting Benchmark on: ${API_URL}`);
    console.log(`📊 Total Requests: ${REQUEST_COUNT}\n`);

    const durations = [];
    let successCount = 0;
    let failCount = 0;

    // 1. Warm up (ยิงครั้งแรกเพื่อให้ DB connection active)
    try {
        process.stdout.write('🔥 Warming up...');
        await fetch(API_URL);
        console.log(' Done.');
    } catch (error) {
        console.error('\n❌ Server connection failed. Please make sure your server is running.');
        console.error(error); // Log the actual error
        return;
    }

    // 2. Start Testing
    console.log('⏳ Testing in progress...');
    const startTimeTotal = performance.now();

    for (let i = 0; i < REQUEST_COUNT; i++) {
        const start = performance.now();
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // บังคับอ่านข้อมูลจนจบเพื่อให้มั่นใจว่าโหลดครบจริง
            await res.json();

            const end = performance.now();
            const duration = end - start;
            durations.push(duration);
            successCount++;

            // แสดงจุด . ทุกๆ 5 request เพื่อให้รู้ว่าทำงานอยู่
            if ((i + 1) % 5 === 0) process.stdout.write('.');

        } catch (error) {
            failCount++;
            process.stdout.write('x');
        }
    }

    const endTimeTotal = performance.now();
    console.log('\n\n✅ Benchmark Complete!');

    // 3. Calculate Results
    if (durations.length === 0) return;

    const min = Math.min(...durations).toFixed(2);
    const max = Math.max(...durations).toFixed(2);
    const avg = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2);

    // คำนวณ P95 (95% ของ Request เร็วกว่าค่านี้)
    durations.sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    const p95 = durations[p95Index].toFixed(2);

    const totalTime = ((endTimeTotal - startTimeTotal) / 1000).toFixed(2);

    // 4. Show Report
    console.log('------------------------------------------------');
    console.log(`🎯 Results Summary (${successCount}/${REQUEST_COUNT} success)`);
    console.log('------------------------------------------------');
    console.log(`⏱️  Total Time Taken:  ${totalTime} s`);
    console.log(`⚡ Avg Response Time: ${avg} ms`);
    console.log(`🐢 Slowest Request:   ${max} ms`);
    console.log(`🚀 Fastest Request:   ${min} ms`);
    console.log(`📈 P95 Latency:       ${p95} ms`); // ค่านี้สำคัญมากในการวัด User Experience
    console.log('------------------------------------------------');

    if (parseFloat(avg) > 200) {
        console.log('⚠️  Suggestion: API seems slow (>200ms). Consider using .lean() or Indexing.');
    } else {
        console.log('✨ Performance looks good!');
    }
}

// เช็คว่า Node.js เวอร์ชั่นรองรับ fetch หรือไม่ (Node 18+)
if (!globalThis.fetch) {
    console.error('❌ Error: This script requires Node.js v18 or higher (native fetch support).');
} else {
    runBenchmark();
}
