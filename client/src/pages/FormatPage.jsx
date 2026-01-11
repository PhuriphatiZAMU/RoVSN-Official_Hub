export default function FormatPage() {
    return (
        <div className="flex-grow bg-gray-50">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                        Tournament Format
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12 max-w-4xl">
                {/* Title */}
                <div className="text-center mb-10">
                    <i className="fas fa-scroll text-6xl text-cyan-aura mb-4"></i>
                    <h2 className="text-3xl font-display font-bold uppercase text-uefa-dark">
                        กฎกติกาและรูปแบบการแข่งขัน
                    </h2>
                    <p className="text-gray-500">RoV SN Tournament 2026</p>
                </div>

                {/* Rule Cards */}
                <div className="space-y-6">
                    {/* Rule 1 */}
                    <div className="rule-card p-6">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-chess-board text-2xl text-uefa-dark mr-3"></i>
                            <h3 className="text-xl font-bold text-uefa-dark uppercase m-0">
                                1. รอบเก็บคะแนน (League Phase)
                            </h3>
                        </div>
                        <div className="pl-4">
                            <p className="font-bold text-cyan-aura mb-2">รูปแบบ: Modified League (12 ทีม)</p>
                            <ul className="list-none space-y-2 text-gray-700">
                                <li><strong>จำนวนทีม:</strong> 12 ทีม</li>
                                <li><strong>การแบ่งสาย:</strong> จับสลากแบ่งเป็น 2 โถ (Pot A และ Pot B) โถละ 6 ทีม</li>
                                <li>
                                    <strong>จำนวนแมตช์:</strong> ทุกทีมจะได้แข่งทั้งหมด 6 แมตช์
                                    <ul className="list-none pl-4 mt-2 space-y-1">
                                        <li>• เจอทีมจากโถเดียวกัน: 3 ทีม</li>
                                        <li>• เจอทีมจากต่างโถ: 3 ทีม</li>
                                    </ul>
                                </li>
                                <li>
                                    <span className="bg-uefa-dark text-white px-2 py-1 rounded text-sm mr-2">รูปแบบเกม</span>
                                    Best of 3 (BO3)
                                </li>
                                <li>
                                    <span className="bg-uefa-dark text-white px-2 py-1 rounded text-sm mr-2">การคัดเข้ารอบ</span>
                                    อันดับ 1–4 เข้า Semi Final
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Rule 2 */}
                    <div className="rule-card p-6">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-balance-scale text-2xl text-uefa-dark mr-3"></i>
                            <h3 className="text-xl font-bold text-uefa-dark uppercase m-0">
                                2. เกณฑ์การให้คะแนน
                            </h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded">
                                <h4 className="font-bold text-sm uppercase mb-3 text-gray-500">ระบบคะแนน</h4>
                                <div className="flex items-center mb-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    <span className="font-bold">ชนะ:</span>
                                    <span className="ml-auto">3 คะแนน</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                    <span className="font-bold">แพ้:</span>
                                    <span className="ml-auto">0 คะแนน</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h4 className="font-bold text-sm uppercase mb-3 text-gray-500">Tie-breakers</h4>
                                <ol className="list-decimal pl-5 text-sm space-y-1">
                                    <li>Game Difference</li>
                                    <li>Head-to-Head</li>
                                    <li>Total Wins</li>
                                    <li>Random Draw</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Rule 3 */}
                    <div className="rule-card p-6">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-fist-raised text-2xl text-uefa-dark mr-3"></i>
                            <h3 className="text-xl font-bold text-uefa-dark uppercase m-0">
                                3. รอบรองชนะเลิศ
                            </h3>
                        </div>
                        <div className="pl-4">
                            <p className="mb-2">
                                <span className="font-bold text-cyan-aura">รูปแบบ:</span> Best of 5 (BO5)
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="bg-uefa-dark text-white p-3 rounded flex-1 text-center">
                                    <div className="text-xs text-cyan-aura uppercase">คู่ที่ 1</div>
                                    <div className="font-bold text-lg">อันดับ 1 🆚 อันดับ 2</div>
                                </div>
                                <div className="bg-uefa-dark text-white p-3 rounded flex-1 text-center">
                                    <div className="text-xs text-cyan-aura uppercase">คู่ที่ 2</div>
                                    <div className="font-bold text-lg">อันดับ 3 🆚 อันดับ 4</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rule 4 */}
                    <div className="rule-card p-6 bg-gradient-to-br from-uefa-dark to-black text-white">
                        <div className="flex items-center mb-4">
                            <i className="fas fa-crown text-2xl text-yellow-400 mr-3"></i>
                            <h3 className="text-xl font-bold text-white uppercase m-0">
                                4. รอบชิงชนะเลิศ
                            </h3>
                        </div>
                        <div className="pl-4">
                            <div className="flex items-start mb-4">
                                <i className="fas fa-map-marker-alt text-cyan-aura mt-1 mr-3"></i>
                                <div>
                                    <strong className="block text-cyan-aura">สถานที่</strong>
                                    <span>แข่งขัน Offline ณ งาน Open House</span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <i className="fas fa-gamepad text-cyan-aura mt-1 mr-3"></i>
                                <div>
                                    <strong className="block text-cyan-aura">รูปแบบการแข่ง</strong>
                                    <ul className="list-none space-y-1 text-gray-300">
                                        <li>🏆 <strong>คู่ชิงชนะเลิศ:</strong> Best of 5 (BO5)</li>
                                        <li>🥉 <strong>คู่ชิงอันดับ 3:</strong> Best of 5 (BO5)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
