import { useState, useEffect } from 'react';

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    type = 'danger' // 'danger', 'warning', 'info'
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const iconConfig = {
        danger: { icon: 'fa-trash-alt', bgColor: 'bg-red-100', iconColor: 'text-red-500', btnColor: 'bg-red-500 hover:bg-red-600' },
        warning: { icon: 'fa-exclamation-triangle', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-500', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
        info: { icon: 'fa-info-circle', bgColor: 'bg-blue-100', iconColor: 'text-blue-500', btnColor: 'bg-blue-500 hover:bg-blue-600' },
    };

    const config = iconConfig[type] || iconConfig.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scaleIn">
                {/* Icon */}
                <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <i className={`fas ${config.icon} text-3xl ${config.iconColor}`}></i>
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-gray-800 text-center mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 text-center mb-6">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-colors ${config.btnColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
        </div>
    );
}

export function useConfirmModal() {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger',
        confirmText: 'ยืนยัน',
        cancelText: 'ยกเลิก',
    });

    const showConfirm = ({ title, message, onConfirm, type = 'danger', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก' }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type,
            confirmText,
            cancelText,
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const ModalComponent = () => (
        <ConfirmModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onConfirm={modalState.onConfirm}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            confirmText={modalState.confirmText}
            cancelText={modalState.cancelText}
        />
    );

    return { showConfirm, ModalComponent };
}
