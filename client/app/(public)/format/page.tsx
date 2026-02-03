import { Metadata } from 'next';
import FormatContent from '@/components/format/FormatContent';

export const metadata: Metadata = {
    title: 'Tournament Format - RoV SN Tournament 2026',
    description: 'รูปแบบการแข่งขันและเกณฑ์การตัดสิน - RoV SN Tournament 2026',
    openGraph: {
        title: 'Tournament Format - RoV SN Tournament 2026',
        description: 'เกณฑ์การตัดสินฉบับทางการ',
    },
};

export default function FormatPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <FormatContent />
        </div>
    );
}
