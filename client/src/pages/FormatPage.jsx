export default function FormatPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-uefa-dark to-deep-space py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                        <i className="fas fa-trophy text-4xl text-white"></i>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-wider mb-4">
                        ระบบการแข่งขัน
                    </h1>
                    <p className="text-xl text-cyan-aura font-bold">ROV SN TOURNAMENT 2026</p>
                    <p className="text-gray-400 mt-2">📢 รายละเอียดโครงสร้างทัวร์นาเมนต์และเกณฑ์การตัดสินฉบับทางการ</p>
                </div>

                {/* Section 1: League Phase */}
                <section className="mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-uefa-dark rounded-full flex items-center justify-center font-bold">1</span>
                                รอบเก็บคะแนน (League Phase)
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 text-cyan-aura mb-4">
                                <i className="fas fa-sync-alt"></i>
                                <span className="font-bold">รูปแบบ: แข่งขันแบบพบกันหมด (Round Robin)</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                        <i className="fas fa-users text-blue-400 text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">จำนวนทีม</div>
                                        <div className="text-white font-bold text-xl">10 ทีม</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                        <i className="fas fa-gamepad text-purple-400 text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">จำนวนแมตช์</div>
                                        <div className="text-white font-bold text-xl">10 แมตช์/ทีม</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <i className="fas fa-dice text-green-400 text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">โหมดการแข่ง</div>
                                        <div className="text-white font-bold text-xl">Best of 3 (BO3)</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                        <i className="fas fa-medal text-yellow-400 text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">การคัดเข้ารอบ</div>
                                        <div className="text-white font-bold text-xl">อันดับ 1-4</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Point System */}
                <section className="mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-uefa-dark rounded-full flex items-center justify-center font-bold">2</span>
                                เกณฑ์การให้คะแนน & การจัดอันดับ
                            </h2>
                        </div>
                        <div className="p-6">
                            {/* Point System */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-cyan-aura mb-4 flex items-center gap-2">
                                    <i className="fas fa-chart-line"></i>
                                    ระบบคะแนน (Point System)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">+3</span>
                                        </div>
                                        <div>
                                            <div className="text-green-400 font-bold text-lg">🟢 ชนะ (Win)</div>
                                            <div className="text-gray-400">ได้รับ 3 คะแนน</div>
                                        </div>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">0</span>
                                        </div>
                                        <div>
                                            <div className="text-red-400 font-bold text-lg">🔴 แพ้ (Lose)</div>
                                            <div className="text-gray-400">ได้รับ 0 คะแนน</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tie-breakers */}
                            <div>
                                <h3 className="text-lg font-bold text-cyan-aura mb-4 flex items-center gap-2">
                                    <i className="fas fa-balance-scale"></i>
                                    เกณฑ์ตัดสินกรณีคะแนนเท่ากัน (Tie-breakers)
                                </h3>
                                <p className="text-gray-400 mb-4">หากจบการแข่งขันแล้วมีทีมคะแนนเท่ากัน จะวัดผลตามลำดับดังนี้:</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold">1</div>
                                        <div>
                                            <div className="text-white font-bold">⚔️ Game Difference</div>
                                            <div className="text-gray-400 text-sm">ดูผลต่างเกมได้–เสีย (นับจำนวนเกมย่อยที่ชนะและแพ้)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold">2</div>
                                        <div>
                                            <div className="text-white font-bold">🆚 Head-to-Head</div>
                                            <div className="text-gray-400 text-sm">ดูผลการแข่งขันตอนที่เจอกันเอง (ผู้ชนะได้อันดับสูงกว่า)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold">3</div>
                                        <div>
                                            <div className="text-white font-bold">📈 Total Wins</div>
                                            <div className="text-gray-400 text-sm">ดูจำนวนแมตช์ที่ชนะทั้งหมด</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold">4</div>
                                        <div>
                                            <div className="text-white font-bold">🎲 Random Draw</div>
                                            <div className="text-gray-400 text-sm">หากยังเท่ากันทุกข้อ ให้ตัดสินด้วยการจับสลากโดย Admin</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Semi Finals */}
                <section className="mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-uefa-dark rounded-full flex items-center justify-center font-bold">3</span>
                                🥊 รอบรองชนะเลิศ (Semi Finals)
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 text-cyan-aura mb-6">
                                <i className="fas fa-gamepad"></i>
                                <span className="font-bold">รูปแบบ: Best of 5 (BO5)</span>
                            </div>
                            <p className="text-gray-400 mb-6">นำ 4 ทีมที่ดีที่สุดจากรอบลีก มาจับคู่แข่งขันดังนี้:</p>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-5 text-center">
                                    <div className="text-blue-400 font-bold mb-2">🅰️ คู่ที่ 1</div>
                                    <div className="text-2xl font-bold text-white">
                                        อันดับ 1 <span className="text-cyan-aura mx-2">🆚</span> อันดับ 2
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-5 text-center">
                                    <div className="text-purple-400 font-bold mb-2">🅱️ คู่ที่ 2</div>
                                    <div className="text-2xl font-bold text-white">
                                        อันดับ 3 <span className="text-cyan-aura mx-2">🆚</span> อันดับ 4
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                    <div className="text-green-400 font-bold mb-1">✅ ทีมชนะ</div>
                                    <div className="text-gray-300">เข้าสู่รอบชิงชนะเลิศ (Grand Final)</div>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <div className="text-red-400 font-bold mb-1">❌ ทีมแพ้</div>
                                    <div className="text-gray-300">เข้าสู่รอบชิงอันดับ 3 (3rd Place Match)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Grand Finals */}
                <section className="mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-yellow-500 text-uefa-dark rounded-full flex items-center justify-center font-bold">4</span>
                                👑 รอบชิงชนะเลิศ (Grand Finals)
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <i className="fas fa-map-marker-alt text-cyan-aura"></i>
                                    <span><strong>สถานที่:</strong> แข่งขัน Offline ณ งาน Open House</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <i className="fas fa-gamepad text-cyan-aura"></i>
                                    <span><strong>รูปแบบ:</strong> Best of 5 (BO5)</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-amber-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-xl p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-2xl">🥉</span>
                                        </div>
                                        <div>
                                            <div className="text-yellow-400 font-bold text-lg">คู่ชิงอันดับ 3</div>
                                            <div className="text-gray-300">ผู้แพ้จากรอบ Semi Final ทั้ง 2 ทีม</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-400/20 border border-yellow-400/50 rounded-xl p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                                            <span className="text-2xl">🏆</span>
                                        </div>
                                        <div>
                                            <div className="text-yellow-400 font-bold text-lg">คู่ชิงชนะเลิศ</div>
                                            <div className="text-gray-300">ผู้ชนะจากรอบ Semi Final ทั้ง 2 ทีม</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Note Section */}
                <section className="mb-8">
                    <div className="bg-gradient-to-r from-cyan-aura/10 to-blue-600/10 border border-cyan-aura/30 rounded-2xl p-6 text-center">
                        <div className="text-cyan-aura text-lg mb-2">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            หมายเหตุ
                        </div>
                        <p className="text-gray-300">
                            กำหนดการและลำดับคู่แข่งในรอบเก็บคะแนนจะประกาศให้ทราบใน{' '}
                            <a
                                href="https://ro-v-sn-tournament-official.vercel.app/"
                                className="text-cyan-aura hover:underline font-bold"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                เว็บไซต์ทางการ
                            </a>
                            {' '}โปรดติดตามอย่างใกล้ชิด
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
