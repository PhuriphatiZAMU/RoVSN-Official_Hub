export default function FormatPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-uefa-dark to-deep-space py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full mb-6 shadow-[0_0_30px_rgba(21,200,255,0.4)]">
                        <i className="fas fa-trophy text-4xl text-white"></i>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-wider mb-4 leading-relaxed">
                        🏆 ประกาศ: ระบบการแข่งขัน<br />ROV SN TOURNAMENT 2026 🏆
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">📢 รายละเอียดโครงสร้างทัวร์นาเมนต์และเกณฑ์การตัดสินฉบับทางการ</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/50 to-transparent mb-12"></div>

                {/* Section 1: League Phase */}
                <section className="mb-12">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-uefa-dark rounded-full flex items-center justify-center font-bold">1</span>
                                รอบเก็บคะแนน (League Phase)
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 text-cyan-aura mb-6 text-lg">
                                <i className="fas fa-th-list text-2xl"></i>
                                <span className="font-bold">รูปแบบ: แข่งขันแบบพบกันหมด (Round Robin)</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center min-w-[3rem]">
                                            <i className="fas fa-users text-blue-400 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">จำนวนทีม</div>
                                            <div className="text-white font-bold text-xl">10 ทีม</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center min-w-[3rem]">
                                            <i className="fas fa-gamepad text-purple-400 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">จำนวนแมตช์</div>
                                            <div className="text-white font-bold text-xl">ทุกทีมจะได้ลงแข่งทั้งหมด 9 แมตช์</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center min-w-[3rem]">
                                            <i className="fas fa-stopwatch text-green-400 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">โหมดการแข่ง</div>
                                            <div className="text-white font-bold text-xl">Best of 3 (BO3)</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center min-w-[3rem]">
                                            <i className="fas fa-crown text-yellow-400 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-sm">การคัดเข้ารอบ</div>
                                            <div className="text-white font-bold text-xl">อันดับ 1 – 4 เข้าสู่รอบ Semi Final</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Section 2: Point System */}
                <section className="mb-12">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-uefa-dark rounded-full flex items-center justify-center font-bold">2</span>
                                📊 เกณฑ์การให้คะแนน & การจัดอันดับ
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            {/* Point System */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-cyan-aura mb-6 flex items-center gap-2 border-l-4 border-cyan-aura pl-3">
                                    📍 ระบบคะแนน (Point System)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 flex items-center gap-5">
                                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <i className="fas fa-check text-white text-2xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-green-400 font-bold text-xl mb-1">🟢 ชนะ (Win)</div>
                                            <div className="text-gray-300">ได้รับ <span className="text-white font-bold text-lg">3</span> คะแนน</div>
                                        </div>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-center gap-5">
                                        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                                            <i className="fas fa-times text-white text-2xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-red-400 font-bold text-xl mb-1">🔴 แพ้ (Lose)</div>
                                            <div className="text-gray-300">ได้รับ <span className="text-white font-bold text-lg">0</span> คะแนน</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tie-breakers */}
                            <div>
                                <h3 className="text-xl font-bold text-cyan-aura mb-4 flex items-center gap-2 border-l-4 border-cyan-aura pl-3">
                                    📍 เกณฑ์ตัดสินกรณีคะแนนเท่ากัน (Tie-breakers)
                                </h3>
                                <p className="text-gray-300 mb-6 bg-white/5 p-4 rounded-lg inline-block">
                                    หากจบการแข่งขันแล้วมีทีมคะแนนเท่ากัน จะวัดผลตามลำดับดังนี้:
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start md:items-center gap-4 bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold shrink-0">1</div>
                                        <div>
                                            <div className="text-white font-bold text-lg mb-1">⚔️ Game Difference</div>
                                            <div className="text-gray-400">ดูผลต่างเกมได้–เสีย (นับจำนวนเกมย่อยที่ชนะและแพ้)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:items-center gap-4 bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold shrink-0">2</div>
                                        <div>
                                            <div className="text-white font-bold text-lg mb-1">🆚 Head-to-Head</div>
                                            <div className="text-gray-400">ดูผลการแข่งขันตอนที่เจอกันเอง (ผู้ชนะได้อันดับสูงกว่า)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:items-center gap-4 bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold shrink-0">3</div>
                                        <div>
                                            <div className="text-white font-bold text-lg mb-1">📈 Total Wins</div>
                                            <div className="text-gray-400">ดูจำนวนแมตช์ที่ชนะทั้งหมด</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:items-center gap-4 bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold shrink-0">4</div>
                                        <div>
                                            <div className="text-white font-bold text-lg mb-1">🎲 Random Draw</div>
                                            <div className="text-gray-400">หากยังเท่ากันทุกข้อ ให้ตัดสินด้วยการจับสลากโดย Admin</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Section 3: Semi Finals */}
                <section className="mb-12">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-uefa-dark rounded-full flex items-center justify-center font-bold">3</span>
                                🥊 รอบรองชนะเลิศ (Semi Finals)
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 text-cyan-aura mb-8 text-lg bg-cyan-aura/10 p-4 rounded-xl border border-cyan-aura/20 inline-flex">
                                <i className="fas fa-gavel text-2xl"></i>
                                <span className="font-bold">รูปแบบ: Best of 5 (BO5)</span>
                            </div>

                            <p className="text-gray-300 text-lg mb-6">นำ 4 ทีมที่ดีที่สุดจากรอบลีก มาจับคู่แข่งขันดังนี้:</p>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                                    <div className="relative z-10">
                                        <div className="text-blue-400 font-bold mb-3 text-xl bg-blue-500/10 inline-block px-4 py-1 rounded-full">🅰️ คู่ที่ 1</div>
                                        <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-bold text-white">
                                            <span>อันดับ 1</span>
                                            <span className="text-cyan-aura text-3xl">🆚</span>
                                            <span>อันดับ 2</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                                    <div className="relative z-10">
                                        <div className="text-purple-400 font-bold mb-3 text-xl bg-purple-500/10 inline-block px-4 py-1 rounded-full">🅱️ คู่ที่ 2</div>
                                        <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-bold text-white">
                                            <span>อันดับ 3</span>
                                            <span className="text-cyan-aura text-3xl">🆚</span>
                                            <span>อันดับ 4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                                <h4 className="text-white font-bold mb-4 border-b border-white/10 pb-2">ผลการแข่งขัน:</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <i className="fas fa-check-circle text-green-400 text-xl"></i>
                                        <span><strong className="text-green-400">ทีมชนะ:</strong> เข้าสู่รอบชิงชนะเลิศ (Grand Final)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <i className="fas fa-times-circle text-red-400 text-xl"></i>
                                        <span><strong className="text-red-400">ทีมแพ้:</strong> เข้าสู่รอบชิงอันดับ 3 (3rd Place Match)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Section 4: Grand Finals */}
                <section className="mb-12">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden relative">
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10"></div>

                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-4 border-b border-white/10">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <span className="w-10 h-10 bg-yellow-500 text-uefa-dark rounded-full flex items-center justify-center font-bold">4</span>
                                👑 รอบชิงชนะเลิศ (Grand Finals)
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white/5 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-aura/20 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-map-marker-alt text-cyan-aura text-2xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-cyan-aura font-bold">📍 สถานที่</div>
                                        <div className="text-white text-lg font-bold">แข่งขัน Offline ณ งาน Open House</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-xl border border-white/5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-aura/20 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-gamepad text-cyan-aura text-2xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-cyan-aura font-bold">📌 รูปแบบ</div>
                                        <div className="text-white text-lg font-bold">Best of 5 (BO5)</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-white font-bold text-xl mb-2 pl-2 border-l-4 border-yellow-500">ตารางการแข่งขัน:</h3>

                                <div className="bg-gradient-to-r from-amber-700/30 to-yellow-600/30 border border-yellow-600/30 rounded-xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-700 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400/50">
                                            <span className="text-3xl filter drop-shadow">🥉</span>
                                        </div>
                                        <div>
                                            <div className="text-amber-400 font-bold text-xl mb-1 uppercase tracking-wide">คู่ชิงอันดับ 3</div>
                                            <div className="text-white text-lg">ผู้แพ้จากรอบ Semi Final ทั้ง 2 ทีม</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/50 rounded-xl p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200/50 animate-pulse-slow">
                                            <span className="text-3xl filter drop-shadow">🏆</span>
                                        </div>
                                        <div>
                                            <div className="text-yellow-300 font-bold text-xl mb-1 uppercase tracking-wide">คู่ชิงชนะเลิศ</div>
                                            <div className="text-white text-lg font-bold">ผู้ชนะจากรอบ Semi Final ทั้ง 2 ทีม</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Note Section */}
                <section className="mb-12">
                    <div className="bg-gradient-to-r from-cyan-aura/10 to-blue-600/10 border border-cyan-aura/30 rounded-2xl p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-aura via-blue-500 to-cyan-aura opacity-50"></div>
                        <div className="text-cyan-aura text-xl mb-4 font-bold flex items-center justify-center gap-2">
                            <i className="fas fa-calendar-alt text-2xl"></i>
                            🗓️ หมายเหตุ
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            กำหนดการและลำดับคู่แข่งในรอบเก็บคะแนนจะประกาศให้ทราบใน<br className="hidden md:block" />
                            <a
                                href="https://ro-v-sn-tournament-official.vercel.app/"
                                className="text-cyan-aura hover:text-white hover:underline font-bold mx-2 transition-colors relative inline-block group"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://ro-v-sn-tournament-official.vercel.app/
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
                            </a>
                            <br className="hidden md:block" />
                            โปรดติดตามอย่างใกล้ชิด
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
