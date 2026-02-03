import { serverApi } from '@/lib/api';
import SeasonStatsContent from '@/components/stats/SeasonStatsContent';

export const revalidate = 60;

export default async function StatsPage() {
    const data = await serverApi.getSeasonStatsPageData();

    return (
        <SeasonStatsContent
            seasonStats={data.seasonStats}
            heroes={data.heroes}
            teamLogos={data.teamLogos}
        />
    );
}
