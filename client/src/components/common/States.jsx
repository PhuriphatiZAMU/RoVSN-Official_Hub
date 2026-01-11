export function ErrorState({ title, message, onRetry }) {
    return (
        <div className="error-container">
            <div className="text-5xl text-red-500 mb-4">
                <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="font-display text-xl text-red-800 mb-2">{title}</h3>
            <p className="text-red-600 text-sm mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:-translate-y-1"
                >
                    <i className="fas fa-redo"></i>
                    ลองใหม่อีกครั้ง
                </button>
            )}
        </div>
    );
}

export function EmptyState({ title, message, icon = 'fas fa-inbox' }) {
    return (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-5xl text-gray-400 mb-4">
                <i className={icon}></i>
            </div>
            <h3 className="font-display text-xl text-gray-600 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{message}</p>
        </div>
    );
}

export function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-cyan-aura rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">{text}</p>
        </div>
    );
}
