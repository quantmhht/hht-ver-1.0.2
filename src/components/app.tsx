import { MINI_APP_ID } from "@constants/common";
import Routes from "@pages";
import { useStore } from "@store";
import React, { useEffect, useState, createContext, useContext, useMemo } from "react";
import { App, Modal } from "zmp-ui";
import Auth from "./Auth";

// Context cho Error Management
interface ErrorContextType {
    showError: (message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

// Hook để sử dụng Error Context
export const useErrorHandler = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useErrorHandler must be used within ErrorProvider');
    }
    return context;
};

// Error Provider Component
const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<{
        visible: boolean;
        message: string;
        title: string;
        type: 'error' | 'success' | 'warning';
    }>({
        visible: false,
        message: '',
        title: '',
        type: 'error'
    });

    const showError = (message: string, title = 'Có lỗi xảy ra') => {
        setNotification({
            visible: true,
            message,
            title,
            type: 'error'
        });
    };

    const showSuccess = (message: string, title = 'Thành công') => {
        setNotification({
            visible: true,
            message,
            title,
            type: 'success'
        });
    };

    const showWarning = (message: string, title = 'Cảnh báo') => {
        setNotification({
            visible: true,
            message,
            title,
            type: 'warning'
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, visible: false }));
    };


    const contextValue = useMemo(() => ({ showError, showSuccess, showWarning }), []);

    return (
        <ErrorContext.Provider value={contextValue}>
            {children}
            <Modal
                visible={notification.visible}
                onClose={closeNotification}
                title={notification.title}
            >
                <div style={{ 
                    padding: '10px 0',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '18px' }}>
                        {notification.type === 'error' && '⚠️'}
                        {notification.type === 'success' && '✅'}
                        {notification.type === 'warning' && '⚡'}
                    </span>
                    {notification.message}
                </div>
            </Modal>
        </ErrorContext.Provider>
    );
};

// Component thay thế ErrorNotification
const ErrorNotification = () => 
    // Component này giờ có thể empty vì logic đã chuyển vào ErrorProvider
     null
;

const MyApp = () => {
    const { token, getAccessToken, getOrganization } = useStore(state => ({
        token: state.token,
        getAccessToken: state.getAccessToken,
        getOrganization: state.getOrganization,
    }));

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Nếu chưa có token, lấy token trước
                if (!token) {
                    await getAccessToken();
                }
                // Sau khi có token, lấy thông tin organization
                await getOrganization({ miniAppId: MINI_APP_ID });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Initialization error:", error);
            }
        };

        initializeApp();
    }, [token, getAccessToken, getOrganization]); // Chỉ chạy một lần khi ứng dụng khởi động

    // Hiển thị màn hình chờ nếu chưa tải xong


    // Khi đã tải xong, hiển thị nội dung chính
    return (
        <>
            <ErrorNotification />
            <Auth />
            <Routes />
        </>
    );
};

// Main App Component với ErrorProvider wrapper
const AppWithErrorProvider = () => (
    <App>
        <ErrorProvider>
            <MyApp />
        </ErrorProvider>
    </App>
);

export default AppWithErrorProvider;