import { useData } from '../context/DataContext';
import TeamLogo from '../components/common/TeamLogo';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';

export default function ClubsPage() {
    const { teams, loading, error } = useData();

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <ErrorState
                    title="ไม่สามารถโหลดข้อมูลทีมได้"
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="flex-grow">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                        Clubs
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {loading ? (
                    <CardSkeleton count={12} />
                ) : teams.length === 0 ? (
                    <EmptyState
                        title="ยังไม่มีทีม"
                        message="ยังไม่มีข้อมูลทีมในระบบ"
                        icon="fas fa-users-slash"
                    />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {teams.map(team => (
                            <div
                                key={team}
                                className="bg-white p-6 border border-gray-200 flex flex-col items-center hover:shadow-lg hover:border-cyan-aura transition cursor-pointer group"
                            >
                                <div className="w-24 h-24 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TeamLogo teamName={team} size="xxl" />
                                </div>
                                <span className="font-bold text-uefa-dark text-center uppercase font-display text-sm">
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
