import { useEffect } from "react";
import { useStore } from "@store";

const Auth = () => {
    const [token, user, getToken, getUserInfo] = useStore(state => [
        state.token,
        state.user,
        state.getAccessToken,
        state.getUserInfo, // ✅ Thêm getUserInfo
    ]);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // 1. Lấy access token trước
                if (!token) {
                    await getToken();
                }
                
                // 2. Lấy thông tin user từ Zalo SDK
                if (!user || user.name === "Admin Local") { // ✅ Kiểm tra nếu đang dùng user giả lập
                    await getUserInfo();
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Auth initialization error:", error);
            }
        };

        initAuth();
    }, [token, user, getToken, getUserInfo]); // ✅ Chỉ chạy 1 lần khi component mount

    return null;
};

export default Auth;