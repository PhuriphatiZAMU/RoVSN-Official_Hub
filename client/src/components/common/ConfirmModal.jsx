import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Create Context
const ConfirmModalContext = createContext(null);

// Modal Content Component
function ConfirmModalContent({ config, onClose }) {
    const { title, message, confirmText, cancelText, type, onConfirm } = config;

    const iconConfig = {
        danger: { icon: 'fa-trash-alt', bgColor: 'bg-red-100', iconColor: 'text-red-500', btnColor: 'bg-red-500 hover:bg-red-600' },
        warning: { icon: 'fa-exclamation-triangle', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-500', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
        info: { icon: 'fa-info-circle', bgColor: 'bg-blue-100', iconColor: 'text-blue-500', btnColor: 'bg-blue-500 hover:bg-blue-600' },
    };

    const iconStyle = iconConfig[type] || iconConfig.danger;

    const handleConfirm = () => {
        onClose();
        setTimeout(() => {
            if (onConfirm) onConfirm();
        }, 50);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                style={{ animation: 'modalFadeIn 0.2s ease-out' }}
            />
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                style={{ animation: 'modalScaleIn 0.2s ease-out' }}
            >
                <div className={`w-16 h-16 ${iconStyle.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <i className={`fas ${iconStyle.icon} text-3xl ${iconStyle.iconColor}`}></i>
                </div>
                <h3 className="text-xl font-display font-bold text-gray-800 text-center mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
                    {message}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-colors ${iconStyle.btnColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>,
        document.body
    );
}

// Provider Component
export function ConfirmModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        type: 'danger',
        confirmText: 'ยืนยัน',
        cancelText: 'ยกเลิก',
        onConfirm: null,
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const showConfirm = useCallback((options) => {
        setConfig({
            title: options.title || '',
            message: options.message || '',
            type: options.type || 'danger',
            confirmText: options.confirmText || 'ยืนยัน',
            cancelText: options.cancelText || 'ยกเลิก',
            onConfirm: options.onConfirm,
        });
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <ConfirmModalContext.Provider value={{ showConfirm }}>
            {children}
            {isOpen && <ConfirmModalContent config={config} onClose={closeModal} />}
        </ConfirmModalContext.Provider>
    );
}

// Hook to use the modal
export function useConfirmModal() {
    const context = useContext(ConfirmModalContext);
    if (!context) {
        throw new Error('useConfirmModal must be used within ConfirmModalProvider');
    }
    return context;
}
