import { serverApi } from '@/lib/api';
import PlayerStatsContent from '@/components/stats/PlayerStatsContent';

export const revalidate = 60;

export default async function PlayerStatsPage() {
    const data = await serverApi.getPlayerStatsPageData();

    return (
        <PlayerStatsContent
            playerStats={data.playerStats}
            playerHeroStats={data.playerHeroStats}
            heroes={data.heroes}
            teamLogos={data.teamLogos}
        />
    );
}
