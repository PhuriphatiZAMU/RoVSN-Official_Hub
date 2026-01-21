import { useData } from '../../context/DataContext';

export default function TeamLogo({ teamName, size = 'md' }) {
    const { getTeamLogo } = useData();
    const logoUrl = getTeamLogo(teamName);

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-16 h-16',
        xxl: 'w-24 h-24',
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt={teamName}
                className={`${sizeClass} object-contain`}
                onError={(e) => {
                    // แทนที่เฉพาะ img ด้วย fallback div, ไม่แก้ไข parent เพื่อรักษา sibling elements
                    const fallbackEl = document.createElement('div');
                    fallbackEl.className = `${sizeClass} bg-gray-100 rounded-full flex items-center justify-center`;
                    fallbackEl.innerHTML = '<i class="fas fa-shield-alt text-gray-400"></i>';
                    e.target.replaceWith(fallbackEl);
                }}
            />
        );
    }

    return (
        <div className={`${sizeClass} bg-gray-100 rounded-full flex items-center justify-center`}>
            <i className="fas fa-shield-alt text-gray-400"></i>
        </div>
    );
}
