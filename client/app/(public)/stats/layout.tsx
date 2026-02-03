import { Metadata } from 'next';
import StatsLayout from '@/components/stats/StatsLayout';

export const metadata: Metadata = {
    title: 'Statistics - RoV SN Tournament 2026',
    description: 'สถิติการแข่งขัน ข้อมูลผู้เล่น และข้อมูลทีม - RoV SN Tournament 2026',
};

export default function StatsLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return <StatsLayout>{children}</StatsLayout>;
}
