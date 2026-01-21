export function MatchSkeleton({ count = 4 }) {
    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex-1 flex items-center justify-end gap-2">
                        <div className="skeleton h-4 w-20"></div>
                        <div className="skeleton w-10 h-10 rounded-full"></div>
                    </div>
                    <div className="px-6">
                        <div className="skeleton w-16 h-8"></div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                        <div className="skeleton w-10 h-10 rounded-full"></div>
                        <div className="skeleton h-4 w-20"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 7 }) {
    return (
        <tbody>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                    {[...Array(cols)].map((_, j) => (
                        <td key={j} className="p-3">
                            {j === 0 ? (
                                <div className="skeleton w-8 h-8 rounded-full mx-auto"></div>
                            ) : j === 1 ? (
                                <div className="flex items-center gap-2">
                                    <div className="skeleton w-8 h-8 rounded-full"></div>
                                    <div className="skeleton h-4 w-24"></div>
                                </div>
                            ) : (
                                <div className="skeleton h-4 w-8 mx-auto"></div>
                            )}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}

export function CardSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white p-6 border border-gray-200 flex flex-col items-center">
                    <div className="skeleton w-20 h-20 rounded-lg mb-4"></div>
                    <div className="skeleton h-4 w-3/4"></div>
                </div>
            ))}
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded shadow border-t-4 border-cyan-aura">
                    <div className="skeleton h-3 w-1/3 mb-4"></div>
                    <div className="skeleton h-12 w-2/3"></div>
                </div>
            ))}
        </div>
    );
}
