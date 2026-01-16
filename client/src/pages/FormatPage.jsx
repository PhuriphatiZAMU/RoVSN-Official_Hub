import { useLanguage } from '../context/LanguageContext';
import ShareButton from '../components/common/ShareButton';

export default function FormatPage() {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    return (
        <div className="min-h-screen bg-gradient-to-b from-echo-white to-white py-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-cyan-aura to-cyan-600 rounded-full mb-4 md:mb-6 shadow-[0_0_30px_rgba(21,200,255,0.4)] relative group cursor-pointer hover:scale-110 transition-transform">
                        <i className="fas fa-trophy text-2xl md:text-4xl text-white"></i>
                        <div className="absolute inset-0 rounded-full bg-cyan-aura/30 blur-xl group-hover:blur-2xl transition-all"></div>
                    </div>
                    <div className="flex justify-center mb-3 md:mb-4">
                        <ShareButton title="รูปแบบการแข่งขัน RoV SN Tournament 2026" />
                    </div>
                    <h1 className="text-xl md:text-4xl font-display font-bold text-uefa-dark uppercase tracking-wider mb-2 md:mb-4 leading-relaxed px-2">
                        🏆 {isThai ? 'ระบบการแข่งขัน' : 'TOURNAMENT FORMAT'}<br />
                        <span className="text-cyan-aura text-lg md:text-4xl">ROV SN TOURNAMENT 2026</span>
                    </h1>
                    <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg px-4">
                        📢 {isThai ? 'รายละเอียดโครงสร้างทัวร์นาเมนต์และเกณฑ์การตัดสินฉบับทางการ' : 'Official Tournament Structure and Rules'}
                    </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/50 to-transparent mb-12"></div>

                {/* Section 1: League Phase */}
                <section className="mb-12 hover:transform hover:translate-y-[-5px] transition-all duration-300">
                    <div className="bg-white shadow-xl shadow-blue-100 rounded-2xl border border-white overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/10 to-blue-600/10 px-6 py-4 border-b border-gray-100">
                            <h2 className="text-2xl font-display font-bold text-uefa-dark flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-aura/20">1</span>
                                {isThai ? 'รอบเก็บคะแนน (League Phase)' : 'League Phase'}
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 text-cyan-aura mb-6 text-lg bg-cyan-aura/5 p-3 rounded-lg border border-cyan-aura/10 w-fit">
                                <i className="fas fa-th-list text-2xl"></i>
                                <span className="font-bold">{isThai ? 'รูปแบบ: แข่งขันแบบพบกันหมด (Round Robin)' : 'Format: Round Robin'}</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-echo-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-blue-50">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center min-w-[3rem] shadow-sm">
                                            <i className="fas fa-users text-blue-600 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-sm">{isThai ? 'จำนวนทีม' : 'Teams'}</div>
                                            <div className="text-uefa-dark font-bold text-xl">10 {isThai ? 'ทีม' : 'Teams'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-echo-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-blue-50">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center min-w-[3rem] shadow-sm">
                                            <i className="fas fa-gamepad text-purple-600 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-sm">{isThai ? 'จำนวนแมตช์' : 'Matches'}</div>
                                            <div className="text-uefa-dark font-bold text-lg">{isThai ? 'ทุกทีมจะได้ลงแข่งทั้งหมด 9 แมตช์' : '9 Matches per Team'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-echo-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-blue-50">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center min-w-[3rem] shadow-sm">
                                            <i className="fas fa-stopwatch text-green-600 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-sm">{isThai ? 'โหมดการแข่ง' : 'Match Mode'}</div>
                                            <div className="text-uefa-dark font-bold text-xl">Best of 3 (BO3)</div>
                                        </div>
                                    </div>
                                    <div className="bg-echo-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border border-blue-50">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center min-w-[3rem] shadow-sm">
                                            <i className="fas fa-crown text-yellow-600 text-xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-sm">{isThai ? 'การคัดเข้ารอบ' : 'Qualification'}</div>
                                            <div className="text-uefa-dark font-bold text-lg">{isThai ? 'อันดับ 1 – 4 เข้าสู่รอบ Semi Final' : 'Top 4 Advance to Semi-Finals'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Section 2: Point System */}
                <section className="mb-12 hover:transform hover:translate-y-[-5px] transition-all duration-300">
                    <div className="bg-white shadow-xl shadow-blue-100 rounded-2xl border border-white overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/10 to-blue-600/10 px-6 py-4 border-b border-gray-100">
                            <h2 className="text-2xl font-display font-bold text-uefa-dark flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-aura/20">2</span>
                                {isThai ? '📊 เกณฑ์การให้คะแนน & การจัดอันดับ' : '📊 Points & Ranking System'}
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            {/* Point System */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-cyan-aura mb-6 flex items-center gap-2 border-l-4 border-cyan-aura pl-3">
                                    📍 {isThai ? 'ระบบคะแนน (Point System)' : 'Point System'}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center gap-5 hover:shadow-md transition-all">
                                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <i className="fas fa-check text-white text-2xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-green-600 font-bold text-xl mb-1">🟢 {isThai ? 'ชนะ (Win)' : 'Win'}</div>
                                            <div className="text-gray-600">{isThai ? 'ได้รับ' : 'Get'} <span className="text-uefa-dark font-bold text-lg">3</span> {isThai ? 'คะแนน' : 'Points'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-center gap-5 hover:shadow-md transition-all">
                                        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                                            <i className="fas fa-times text-white text-2xl"></i>
                                        </div>
                                        <div>
                                            <div className="text-red-600 font-bold text-xl mb-1">🔴 {isThai ? 'แพ้ (Lose)' : 'Lose'}</div>
                                            <div className="text-gray-600">{isThai ? 'ได้รับ' : 'Get'} <span className="text-uefa-dark font-bold text-lg">0</span> {isThai ? 'คะแนน' : 'Points'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tie-breakers */}
                            <div>
                                <h3 className="text-xl font-bold text-cyan-aura mb-4 flex items-center gap-2 border-l-4 border-cyan-aura pl-3">
                                    📍 {isThai ? 'เกณฑ์ตัดสินกรณีคะแนนเท่ากัน (Tie-breakers)' : 'Tie-Breakers'}
                                </h3>
                                <p className="text-gray-600 mb-6 bg-echo-white p-4 rounded-lg inline-block border border-blue-50">
                                    {isThai ? 'หากจบการแข่งขันแล้วมีทีมคะแนนเท่ากัน จะวัดผลตามลำดับดังนี้:' : 'If teams have equal points, rankings are decided by:'}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start md:items-center gap-4 bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all border border-gray-100">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">1</div>
                                        <div>
                                            <div className="text-uefa-dark font-bold text-lg mb-1">⚔️ Game Difference</div>
                                            <div className="text-gray-500">{isThai ? 'ดูผลต่างเกมได้–เสีย (นับจำนวนเกมย่อยที่ชนะและแพ้)' : 'Game wins minus game losses preference.'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:items-center gap-4 bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all border border-gray-100">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">2</div>
                                        <div>
                                            <div className="text-uefa-dark font-bold text-lg mb-1">🆚 Head-to-Head</div>
                                            <div className="text-gray-500">{isThai ? 'ดูผลการแข่งขันตอนที่เจอกันเอง (ผู้ชนะได้อันดับสูงกว่า)' : 'Direct match winner ranks higher.'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:items-center gap-4 bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all border border-gray-100">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">3</div>
                                        <div>
                                            <div className="text-uefa-dark font-bold text-lg mb-1">📈 Total Wins</div>
                                            <div className="text-gray-500">{isThai ? 'ดูจำนวนแมตช์ที่ชนะทั้งหมด' : 'Total number of matches won.'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start md:items-center gap-4 bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all border border-gray-100">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">4</div>
                                        <div>
                                            <div className="text-uefa-dark font-bold text-lg mb-1">🎲 Random Draw</div>
                                            <div className="text-gray-500">{isThai ? 'หากยังเท่ากันทุกข้อ ให้ตัดสินด้วยการจับสลากโดย Admin' : 'Random draw by admin if all else equal.'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Section 3: Semi Finals */}
                <section className="mb-12 hover:transform hover:translate-y-[-5px] transition-all duration-300">
                    <div className="bg-white shadow-xl shadow-blue-100 rounded-2xl border border-white overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura/10 to-blue-600/10 px-6 py-4 border-b border-gray-100">
                            <h2 className="text-2xl font-display font-bold text-uefa-dark flex items-center gap-3">
                                <span className="w-10 h-10 bg-cyan-aura text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-aura/20">3</span>
                                🥊 {isThai ? 'รอบรองชนะเลิศ (Semi Finals)' : 'Semi Finals'}
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 text-cyan-aura mb-8 text-lg bg-cyan-aura/5 p-4 rounded-xl border border-cyan-aura/20 inline-flex">
                                <i className="fas fa-gavel text-2xl"></i>
                                <span className="font-bold">{isThai ? 'รูปแบบ: Best of 5 (BO5)' : 'Format: Best of 5 (BO5)'}</span>
                            </div>

                            <p className="text-gray-600 text-lg mb-6">{isThai ? 'นำ 4 ทีมที่ดีที่สุดจากรอบลีก มาจับคู่แข่งขันดังนี้:' : 'Top 4 teams match up as follows:'}</p>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group shadow-sm">
                                    <div className="relative z-10">
                                        <div className="text-blue-600 font-bold mb-3 text-xl bg-white inline-block px-4 py-1 rounded-full shadow-sm">🅰️ {isThai ? 'คู่ที่ 1' : 'Match 1'}</div>
                                        <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-bold text-uefa-dark">
                                            <span>#1</span>
                                            <span className="text-cyan-aura text-3xl">🆚</span>
                                            <span>#2</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6 text-center transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group shadow-sm">
                                    <div className="relative z-10">
                                        <div className="text-purple-600 font-bold mb-3 text-xl bg-white inline-block px-4 py-1 rounded-full shadow-sm">🅱️ {isThai ? 'คู่ที่ 2' : 'Match 2'}</div>
                                        <div className="flex items-center justify-center gap-4 text-xl md:text-2xl font-bold text-uefa-dark">
                                            <span>#3</span>
                                            <span className="text-cyan-aura text-3xl">🆚</span>
                                            <span>#4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-echo-white rounded-xl p-6 border border-blue-50">
                                <h4 className="text-uefa-dark font-bold mb-4 border-b border-gray-200 pb-2">{isThai ? 'ผลการแข่งขัน:' : 'Outcomes:'}</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <i className="fas fa-check-circle text-green-500 text-xl"></i>
                                        <span><strong className="text-green-600">{isThai ? 'ทีมชนะ:' : 'Winner:'}</strong> {isThai ? 'เข้าสู่รอบชิงชนะเลิศ (Grand Final)' : 'Advances to Grand Final'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <i className="fas fa-times-circle text-red-500 text-xl"></i>
                                        <span><strong className="text-red-600">{isThai ? 'ทีมแพ้:' : 'Loser:'}</strong> {isThai ? 'เข้าสู่รอบชิงอันดับ 3 (3rd Place Match)' : 'Proceeds to 3rd Place Match'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-aura/30 to-transparent mb-12"></div>

                {/* Section 4: Grand Finals */}
                <section className="mb-12 hover:transform hover:translate-y-[-5px] transition-all duration-300">
                    <div className="bg-white shadow-xl shadow-yellow-100 rounded-2xl border border-white overflow-hidden relative">
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -z-10"></div>

                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-6 py-4 border-b border-gray-100">
                            <h2 className="text-2xl font-display font-bold text-uefa-dark flex items-center gap-3">
                                <span className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-yellow-500/20">4</span>
                                👑 {isThai ? 'รอบชิงชนะเลิศ (Grand Finals)' : 'Grand Finals'}
                            </h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                                    <div className="w-12 h-12 bg-cyan-aura/10 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-map-marker-alt text-cyan-aura text-2xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-cyan-aura font-bold">{isThai ? '📍 สถานที่' : 'Location'}</div>
                                        <div className="text-uefa-dark text-lg font-bold">{isThai ? 'แข่งขัน Offline ณ งาน Open House' : 'Offline at Open House Event'}</div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                                    <div className="w-12 h-12 bg-cyan-aura/10 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-gamepad text-cyan-aura text-2xl"></i>
                                    </div>
                                    <div>
                                        <div className="text-cyan-aura font-bold">📌 {isThai ? 'รูปแบบ' : 'Format'}</div>
                                        <div className="text-uefa-dark text-lg font-bold">Best of 5 (BO5)</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-uefa-dark font-bold text-xl mb-2 pl-2 border-l-4 border-yellow-500">{isThai ? 'ตารางการแข่งขัน:' : 'Schedule:'}</h3>

                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-700 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400/50 shrink-0">
                                            <span className="text-3xl filter drop-shadow">🥉</span>
                                        </div>
                                        <div>
                                            <div className="text-amber-700 font-bold text-xl mb-1 uppercase tracking-wide">{isThai ? 'คู่ชิงอันดับ 3' : '3rd Place Match'}</div>
                                            <div className="text-uefa-dark text-lg">{isThai ? 'ผู้แพ้จากรอบ Semi Final ทั้ง 2 ทีม' : 'Semi-Final Losers'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 relative overflow-hidden group shadow-md hover:shadow-lg transition-all">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200/50 animate-pulse-slow shrink-0">
                                            <span className="text-3xl filter drop-shadow">🏆</span>
                                        </div>
                                        <div>
                                            <div className="text-yellow-700 font-bold text-xl mb-1 uppercase tracking-wide">{isThai ? 'คู่ชิงชนะเลิศ' : 'Grand Final Match'}</div>
                                            <div className="text-uefa-dark text-lg font-bold">{isThai ? 'ผู้ชนะจากรอบ Semi Final ทั้ง 2 ทีม' : 'Semi-Final Winners'}</div>
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
                    <div className="bg-gradient-to-r from-cyan-aura/5 to-blue-600/5 border border-cyan-aura/20 rounded-2xl p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-aura via-blue-500 to-cyan-aura opacity-50"></div>
                        <div className="text-cyan-aura text-xl mb-4 font-bold flex items-center justify-center gap-2">
                            <i className="fas fa-calendar-alt text-2xl"></i>
                            {isThai ? '🗓️ หมายเหตุ' : '🗓️ Note'}
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {isThai ? 'กำหนดการและลำดับคู่แข่งในรอบเก็บคะแนนจะประกาศให้ทราบใน' : 'Schedule and match order will be announced at'}<br className="hidden md:block" />
                            <a
                                href="https://ro-v-sn-tournament-official.vercel.app/"
                                className="text-cyan-aura hover:text-cyan-600 hover:underline font-bold mx-2 transition-colors relative inline-block group"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://ro-v-sn-tournament-official.vercel.app/
                            </a>
                            <br className="hidden md:block" />
                            {isThai ? 'โปรดติดตามอย่างใกล้ชิด' : 'Please stay tuned.'}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
