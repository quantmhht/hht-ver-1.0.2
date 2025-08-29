import { User } from "@dts";
import { getToken, getZaloUserInfo } from "@service/zalo";
import { StateCreator } from "zustand";
import { ADMIN_ZALO_IDS, MOD_ZALO_IDS, LEADER_ZALO_IDS } from "@constants/roles"; 

const getInitialUser = (): User | undefined => {
    // ✅ Chỉ sử dụng dev role khi đang development
    if (import.meta.env.DEV) {
        const storedRole = localStorage.getItem("dev_role") as "admin" | "mod" | "leader" | "citizen" | null;
        switch (storedRole) {
            case "mod":
                return { id: MOD_ZALO_IDS[0], name: "Mod Local", avatar: "https://i.pravatar.cc/150", idByOA: MOD_ZALO_IDS[0] };
            case "leader":
                return { 
                    id: LEADER_ZALO_IDS[0], 
                    name: "Nguyễn A", 
                    avatar: "https://i.pravatar.cc/150", 
                    idByOA: LEADER_ZALO_IDS[0] 
                };
            case "citizen":
                return { id: "citizen-id", name: "Công Dân Local", avatar: "https://i.pravatar.cc/150", idByOA: "citizen-id-by-oa" };
            case "admin":
                return { id: ADMIN_ZALO_IDS[0], name: "Admin Local", avatar: "https://i.pravatar.cc/150", idByOA: ADMIN_ZALO_IDS[0] };
            default:
                return undefined; // ✅ Không trả về user mặc định
        }
    }
    
    // ✅ Trong production, không có user mặc định - sẽ lấy từ Zalo SDK
    return undefined;
};

export interface AuthSlice {
    token?: string;
    user?: User;
    loadingToken: boolean;
    loadingUserInfo: boolean;
    setToken: (token: string) => void;
    getToken: () => string | undefined;
    getUser: () => User | undefined;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    getUserInfo: () => Promise<void>;
    getAccessToken: () => Promise<void>;
    loginAs: (role: "admin" | "mod" | "leader" | "citizen") => void;
}

const authSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
    token: "",
    user: getInitialUser(), // ✅ Có thể undefined trong production
    loadingToken: false,
    loadingUserInfo: false,
    
    setToken: (token: string) => {
        set(state => ({ ...state, token }));
    },
    
    getToken: () => get().token,
    getUser: () => get().user,
    
    setUser: (user: User) => {
        set(state => ({ ...state, user }));
    },
    
    setLoading: (loading: boolean) => {
        set(state => ({ ...state, loading }));
    },
    
    getUserInfo: async () => {
        try {
            set(state => ({ ...state, loadingUserInfo: true }));
            
            // ✅ Lấy thông tin user thật từ Zalo SDK
            const userInfo = await getZaloUserInfo();
            // eslint-disable-next-line no-console
            console.log("📱 Zalo User Info:", userInfo); // Debug log
            
            set(state => ({ ...state, user: userInfo }));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("❌ Error getting user info:", err);
            
            // ✅ Fallback: nếu không lấy được thông tin từ Zalo thì tạo user mặc định
            const fallbackUser: User = {
                id: "unknown-user",
                name: "Người dùng",
                avatar: "https://i.pravatar.cc/150",
                idByOA: "unknown-user"
            };
            set(state => ({ ...state, user: fallbackUser }));
        } finally {
            set(state => ({ ...state, loadingUserInfo: false }));
        }
    },
    
    getAccessToken: async () => {
        try {
            set(state => ({ ...state, loadingToken: true }));
            const token = await getToken();
            set(state => ({ ...state, token }));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log("❌ Error getting token:", err);
        } finally {
            set(state => ({ ...state, loadingToken: false }));
        }
    },
    
    loginAs: (role: "admin" | "mod" | "leader" | "citizen") => {
        // ✅ Chỉ hoạt động trong development
        if (import.meta.env.DEV) {
            localStorage.setItem("dev_role", role);
            window.location.reload();
        }
    },
});

export default authSlice;