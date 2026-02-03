'use client';

import ShareButton from '@/components/common/ShareButton';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function FormatContent() {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    return (
        <>
            {/* Header */}
            <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 shadow-lg border-b-4 border-cyan-aura">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider truncate">
                            {t.format.title}
                        </h1>
                        <p className="text-cyan-aura/80 font-sans mt-1 text-xs md:text-base hidden sm:block">
                            {t.format.subtitle}
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        <ShareButton title={`${t.format.title} - RoV SN Tournament`} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Section 1: Tournament Structure */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-uefa-dark to-uefa-dark/90 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-aura rounded-xl flex items-center justify-center shadow-lg shadow-cyan-aura/30">
                                    <i className="fas fa-sitemap text-uefa-dark text-lg md:text-xl"></i>
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    {isThai ? 'โครงสร้างการแข่งขัน' : 'Tournament Structure'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 space-y-6">
                            {/* League Phase */}
                            <div className="border-l-4 border-cyan-aura pl-4">
                                <h3 className="text-lg font-bold text-uefa-dark flex items-center gap-2 mb-2">
                                    <i className="fas fa-layer-group text-cyan-aura"></i>
                                    League Phase
                                </h3>
                                <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                                        {isThai ? 'ทุกทีมแข่งกันหมด (Round Robin)' : 'All teams play each other (Round Robin)'}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                                        {isThai ? 'แข่งแบบ Best of 3 (BO3)' : 'Best of 3 (BO3) format'}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                                        {isThai ? 'ทีมอันดับ 1-4 ผ่านเข้ารอบ Playoffs' : 'Top 4 teams advance to Playoffs'}
                                    </li>
                                </ul>
                            </div>

                            {/* Playoffs */}
                            <div className="border-l-4 border-yellow-500 pl-4">
                                <h3 className="text-lg font-bold text-uefa-dark flex items-center gap-2 mb-2">
                                    <i className="fas fa-trophy text-yellow-500"></i>
                                    Playoffs
                                </h3>
                                <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                                        {isThai ? 'รอบ Semi-Final: อันดับ 1 พบ อันดับ 4, อันดับ 2 พบ อันดับ 3' : 'Semi-Final: 1st vs 4th, 2nd vs 3rd'}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                                        {isThai ? 'Semi-Final แข่งแบบ Best of 3 (BO3)' : 'Semi-Final: Best of 3 (BO3)'}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                                        {isThai ? 'Grand Final แข่งแบบ Best of 5 (BO5)' : 'Grand Final: Best of 5 (BO5)'}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Point System */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-uefa-dark to-uefa-dark/90 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-aura rounded-xl flex items-center justify-center shadow-lg shadow-cyan-aura/30">
                                    <i className="fas fa-star text-uefa-dark text-lg md:text-xl"></i>
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    {isThai ? 'ระบบคะแนน' : 'Point System'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Win */}
                                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30">
                                        <span className="text-2xl font-bold text-white">+3</span>
                                    </div>
                                    <h4 className="font-bold text-green-700">{isThai ? 'ชนะ' : 'Win'}</h4>
                                    <p className="text-sm text-green-600 mt-1">{isThai ? 'ได้ 3 คะแนน' : '3 points'}</p>
                                </div>

                                {/* Draw */}
                                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gray-400/30">
                                        <span className="text-2xl font-bold text-white">+1</span>
                                    </div>
                                    <h4 className="font-bold text-gray-700">{isThai ? 'เสมอ' : 'Draw'}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{isThai ? 'ได้ 1 คะแนน (ไม่มีใน BO3)' : '1 point (N/A in BO3)'}</p>
                                </div>

                                {/* Loss */}
                                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/30">
                                        <span className="text-2xl font-bold text-white">0</span>
                                    </div>
                                    <h4 className="font-bold text-red-700">{isThai ? 'แพ้' : 'Loss'}</h4>
                                    <p className="text-sm text-red-600 mt-1">{isThai ? 'ได้ 0 คะแนน' : '0 points'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Tiebreaker */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-uefa-dark to-uefa-dark/90 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-aura rounded-xl flex items-center justify-center shadow-lg shadow-cyan-aura/30">
                                    <i className="fas fa-balance-scale text-uefa-dark text-lg md:text-xl"></i>
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    {isThai ? 'วิธีตัดสินเมื่อคะแนนเท่ากัน' : 'Tiebreaker Rules'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <ol className="space-y-3">
                                {[
                                    isThai ? 'ผลการเจอกัน (Head-to-head)' : 'Head-to-head record',
                                    isThai ? 'ผลต่างเกม (Game Difference)' : 'Game Difference',
                                    isThai ? 'จำนวนเกมที่ชนะ' : 'Total games won',
                                    isThai ? 'ดวลเกม Tiebreaker' : 'Playoff tiebreaker game',
                                ].map((rule, idx) => (
                                    <li key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <span className="w-8 h-8 bg-cyan-aura text-uefa-dark font-bold rounded-full flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                                        <span className="text-gray-700">{rule}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Section 4: Game Rules */}
                <section className="mb-8 md:mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-uefa-dark to-uefa-dark/90 p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-aura rounded-xl flex items-center justify-center shadow-lg shadow-cyan-aura/30">
                                    <i className="fas fa-gavel text-uefa-dark text-lg md:text-xl"></i>
                                </div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                                    {isThai ? 'กติกาในเกม' : 'In-Game Rules'}
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Draft Mode */}
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                                        <i className="fas fa-ban text-white"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-purple-800">{isThai ? 'รูปแบบ Draft' : 'Draft Mode'}</h4>
                                        <p className="text-sm text-purple-600 mt-1">
                                            {isThai ? 'ใช้ระบบเลือกและแบนฮีโร่แบบสลับ' : 'Alternating pick and ban system'}
                                        </p>
                                    </div>
                                </div>

                                {/* Game Mode */}
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                                        <i className="fas fa-gamepad text-white"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-800">{isThai ? 'โหมดเกม' : 'Game Mode'}</h4>
                                        <p className="text-sm text-blue-600 mt-1">
                                            {isThai ? 'แข่งแบบ Custom 5v5' : 'Custom 5v5 match'}
                                        </p>
                                    </div>
                                </div>

                                {/* No Pause */}
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                                        <i className="fas fa-pause-circle text-white"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-orange-800">{isThai ? 'การหยุดเกม' : 'Pause Rules'}</h4>
                                        <p className="text-sm text-orange-600 mt-1">
                                            {isThai ? 'หยุดได้เมื่อมีปัญหาทางเทคนิคเท่านั้น' : 'Only allowed for technical issues'}
                                        </p>
                                    </div>
                                </div>

                                {/* Fair Play */}
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                                        <i className="fas fa-handshake text-white"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-800">{isThai ? 'มารยาท' : 'Fair Play'}</h4>
                                        <p className="text-sm text-green-600 mt-1">
                                            {isThai ? 'ห้ามใช้คำหยาบ ต้องเคารพคู่แข่ง' : 'No toxic behavior, respect opponents'}
                                        </p>
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
