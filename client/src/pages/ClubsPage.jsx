import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';
import ShareButton from '../components/common/ShareButton';

export default function ClubsPage() {
    const { teams, loading, error } = useData();
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <ErrorState
                    title={isThai ? 'ไม่สามารถโหลดข้อมูลทีมได้' : 'Failed to load teams'}
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 shadow-lg border-b-4 border-cyan-aura">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider truncate">
                            {t.nav.teams}
                        </h1>
                        <p className="text-cyan-aura/80 font-sans mt-1 text-xs md:text-base hidden sm:block">{isThai ? 'ทีมที่เข้าร่วมแข่งขัน' : 'Participating Teams'}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        <ShareButton title={`${t.nav.teams} - RoV SN Tournament`} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {loading ? (
                    <CardSkeleton count={12} />
                ) : teams.length === 0 ? (
                    <EmptyState
                        title={isThai ? 'ยังไม่มีทีม' : 'No Teams'}
                        message={isThai ? 'ยังไม่มีข้อมูลทีมในระบบ' : 'No team data available'}
                        icon="fas fa-users-slash"
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {teams.map(team => (
                            <div
                                key={team}
                                className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center hover:shadow-xl hover:border-cyan-aura/50 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                                    <div className="absolute inset-0 bg-cyan-aura/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <TeamLogo teamName={team} size="xxl" />
                                </div>
                                <span className="font-bold text-uefa-dark text-center uppercase font-display text-xs md:text-sm truncate w-full px-2">
                                    {team}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
