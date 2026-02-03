import { serverApi } from '@/lib/api';
import TeamStatsContent from '@/components/stats/TeamStatsContent';

export const revalidate = 60;

export default async function TeamStatsPage() {
    const data = await serverApi.getTeamStatsPageData();

    return (
        <TeamStatsContent
            teamStats={data.teamStats}
            teamLogos={data.teamLogos}
        />
    );
}
