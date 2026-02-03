'use client';

import Image from 'next/image';
import ShareButton from '@/components/common/ShareButton';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function FormatContent() {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    return (
        <>
            {/* Header with Logo */}
            <div className="bg-gradient-to-br from-uefa-dark via-slate-800 to-uefa-dark py-8 md:py-12 mb-4 md:mb-8 shadow-lg border-b-4 border-cyan-aura">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Image
                                src="/logo.png"
                                alt="RoV SN Tournament Logo"
                                width={80}
                                height={80}
                                className="drop-shadow-2xl"
                            />
                            <div className="text-center md:text-left">
                                <h1 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider">
                                    🏆 {isThai ? 'ระบบการแข่งขัน' : 'Tournament Format'}
                                </h1>
                                <p className="text-cyan-aura/80 font-sans mt-1 text-sm md:text-base">
                                    📢 {isThai ? 'รายละเอียดโครงสร้างทัวร์นาเมนต์และเกณฑ์การตัดสินฉบับทางการ' : 'Official tournament structure and rules'}
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <ShareButton title={`${t.format.title} - RoV SN Tournament`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Section 1: League Phase */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-uefa-dark to-uefa-dark/90 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-aura rounded-xl flex items-center justify-center shadow-lg shadow-cyan-aura/30 text-uefa-dark font-bold text-lg">
                                    1
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    {isThai ? 'รอบเก็บคะแนน (League Phase)' : 'League Phase'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <p className="text-gray-600 mb-4">
                                📌 <span className="font-semibold text-gray-800">{isThai ? 'รูปแบบ:' : 'Format:'}</span> {isThai ? 'แข่งขันแบบพบกันหมด (Round Robin)' : 'Round Robin'}
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span><span className="font-semibold text-gray-800">{isThai ? 'จำนวนทีม:' : 'Teams:'}</span> 10 {isThai ? 'ทีม' : 'teams'}</span>
                                </li>
                                <li className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span><span className="font-semibold text-gray-800">{isThai ? 'จำนวนแมตช์:' : 'Matches:'}</span> {isThai ? 'ทุกทีมจะได้ลงแข่งทั้งหมด 9 แมตช์' : 'Each team plays 9 matches'}</span>
                                </li>
                                <li className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                                    <span className="text-cyan-500 mt-0.5">•</span>
                                    <span><span className="font-semibold text-gray-800">{isThai ? 'โหมดการแข่ง:' : 'Mode:'}</span> Best of 3 (BO3)</span>
                                </li>
                                <li className="flex items-start gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                    <span className="text-yellow-500 mt-0.5">•</span>
                                    <span><span className="font-semibold text-gray-800">{isThai ? 'การคัดเข้ารอบ:' : 'Qualification:'}</span> {isThai ? 'นำทีมที่มีคะแนนรวมสูงสุด' : 'Top'} <span className="font-bold text-yellow-600">{isThai ? 'อันดับ 1 – 4' : '1st - 4th'}</span> {isThai ? 'เข้าสู่รอบ Semi Final' : 'advance to Semi Final'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2: Point System */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-uefa-dark to-uefa-dark/90 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-aura rounded-xl flex items-center justify-center shadow-lg shadow-cyan-aura/30 text-uefa-dark font-bold text-lg">
                                    2
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    📊 {isThai ? 'เกณฑ์การให้คะแนน & การจัดอันดับ' : 'Point System & Ranking'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 space-y-6">
                            {/* Points */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">📍 {isThai ? 'ระบบคะแนน (Point System)' : 'Point System'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                                        <span className="text-3xl">🟢</span>
                                        <p className="text-green-600 font-bold text-lg mt-2">{isThai ? 'ชนะ (Win)' : 'Win'}</p>
                                        <p className="text-gray-800 text-2xl font-bold">3 {isThai ? 'คะแนน' : 'pts'}</p>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                                        <span className="text-3xl">🔴</span>
                                        <p className="text-red-600 font-bold text-lg mt-2">{isThai ? 'แพ้ (Lose)' : 'Loss'}</p>
                                        <p className="text-gray-800 text-2xl font-bold">0 {isThai ? 'คะแนน' : 'pts'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tiebreakers */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">📍 {isThai ? 'เกณฑ์ตัดสินกรณีคะแนนเท่ากัน (Tie-breakers)' : 'Tie-breakers'}</h4>
                                <p className="text-gray-500 text-sm mb-3">{isThai ? 'หากจบการแข่งขันแล้วมีทีมคะแนนเท่ากัน จะวัดผลตามลำดับดังนี้:' : 'If teams have equal points, they are ranked by:'}</p>
                                <ol className="space-y-2">
                                    <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <span className="w-8 h-8 bg-cyan-aura text-uefa-dark font-bold rounded-full flex items-center justify-center flex-shrink-0">1</span>
                                        <span>⚔️ <span className="font-semibold text-cyan-700">Game Difference:</span> <span className="text-gray-600">{isThai ? 'ดูผลต่างเกมได้–เสีย' : 'Game won - lost difference'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <span className="w-8 h-8 bg-cyan-aura text-uefa-dark font-bold rounded-full flex items-center justify-center flex-shrink-0">2</span>
                                        <span>🆚 <span className="font-semibold text-cyan-700">Head-to-Head:</span> <span className="text-gray-600">{isThai ? 'ดูผลการแข่งขันตอนที่เจอกันเอง' : 'Direct match result'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <span className="w-8 h-8 bg-cyan-aura text-uefa-dark font-bold rounded-full flex items-center justify-center flex-shrink-0">3</span>
                                        <span>📈 <span className="font-semibold text-cyan-700">Total Wins:</span> <span className="text-gray-600">{isThai ? 'ดูจำนวนแมตช์ที่ชนะทั้งหมด' : 'Total matches won'}</span></span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <span className="w-8 h-8 bg-cyan-aura text-uefa-dark font-bold rounded-full flex items-center justify-center flex-shrink-0">4</span>
                                        <span>🎲 <span className="font-semibold text-cyan-700">Random Draw:</span> <span className="text-gray-600">{isThai ? 'หากยังเท่ากันทุกข้อ ให้ตัดสินด้วยการจับสลากโดย Admin' : 'Admin random draw if still tied'}</span></span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Semi Finals */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg text-orange-600 font-bold text-lg">
                                    3
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    🥊 {isThai ? 'รอบรองชนะเลิศ (Semi Finals)' : 'Semi Finals'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 space-y-4">
                            <p className="text-gray-600">
                                📌 <span className="font-semibold text-gray-800">{isThai ? 'รูปแบบ:' : 'Format:'}</span> Best of 5 (BO5)
                            </p>
                            <p className="text-gray-500 text-sm">{isThai ? 'นำ 4 ทีมที่ดีที่สุดจากรอบลีก มาจับคู่แข่งขันดังนี้:' : 'Top 4 teams from League Phase compete:'}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-blue-600 font-bold mb-2">🅰️ {isThai ? 'คู่ที่ 1' : 'Match 1'}</p>
                                    <p className="text-gray-800 text-lg font-semibold">{isThai ? 'อันดับ 1' : '1st'} 🆚 {isThai ? 'อันดับ 2' : '2nd'}</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <p className="text-purple-600 font-bold mb-2">🅱️ {isThai ? 'คู่ที่ 2' : 'Match 2'}</p>
                                    <p className="text-gray-800 text-lg font-semibold">{isThai ? 'อันดับ 3' : '3rd'} 🆚 {isThai ? 'อันดับ 4' : '4th'}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <p className="text-gray-700 font-semibold">{isThai ? 'ผลการแข่งขัน:' : 'Results:'}</p>
                                <p className="text-green-600">✅ <span className="font-bold">{isThai ? 'ทีมชนะ:' : 'Winners:'}</span> {isThai ? 'เข้าสู่รอบชิงชนะเลิศ (Grand Final)' : 'Advance to Grand Final'}</p>
                                <p className="text-red-600">❌ <span className="font-bold">{isThai ? 'ทีมแพ้:' : 'Losers:'}</span> {isThai ? 'เข้าสู่รอบชิงอันดับ 3 (3rd Place Match)' : 'Play for 3rd Place'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Grand Finals */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg border-2 border-yellow-300 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg text-yellow-600 font-bold text-lg">
                                    4
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    👑 {isThai ? 'รอบชิงชนะเลิศ (Grand Finals)' : 'Grand Finals'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="space-y-2 text-gray-600">
                                <p>📍 <span className="font-semibold text-gray-800">{isThai ? 'สถานที่:' : 'Venue:'}</span> {isThai ? 'แข่งขัน Offline ณ งาน Open House' : 'Offline at Open House Event'}</p>
                                <p>📌 <span className="font-semibold text-gray-800">{isThai ? 'รูปแบบ:' : 'Format:'}</span> Best of 5 (BO5)</p>
                            </div>

                            <p className="text-gray-700 font-semibold pt-2">{isThai ? 'ตารางการแข่งขัน:' : 'Match Schedule:'}</p>
                            <div className="space-y-4">
                                <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 flex items-center gap-4">
                                    <span className="text-4xl">🥉</span>
                                    <div>
                                        <p className="text-amber-700 font-bold text-lg">{isThai ? 'คู่ชิงอันดับ 3' : '3rd Place Match'}</p>
                                        <p className="text-gray-600">{isThai ? 'ผู้แพ้จากรอบ Semi Final ทั้ง 2 ทีม' : 'Semi Final losers'}</p>
                                    </div>
                                </div>
                                <div className="bg-yellow-100 border border-yellow-400 rounded-xl p-4 flex items-center gap-4 shadow-md">
                                    <span className="text-4xl">🏆</span>
                                    <div>
                                        <p className="text-yellow-700 font-bold text-lg">{isThai ? 'คู่ชิงชนะเลิศ' : 'Grand Final'}</p>
                                        <p className="text-gray-600">{isThai ? 'ผู้ชนะจากรอบ Semi Final ทั้ง 2 ทีม' : 'Semi Final winners'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Note */}
                <div className="text-center text-gray-500 text-sm">
                    <i className="fas fa-info-circle mr-1.5"></i>
                    {isThai
                        ? 'เกณฑ์อาจมีการปรับเปลี่ยนตามดุลพินิจของผู้จัดการแข่งขัน'
                        : 'Rules may be adjusted at the discretion of tournament organizers'}
                </div>
            </div>
        </>
    );
}
