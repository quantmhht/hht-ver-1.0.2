// src/utils/auth.ts
import { ADMIN_ZALO_IDS, MOD_ZALO_IDS, LEADER_ZALO_IDS } from "@constants/roles";

export type UserRole = "admin" | "mod" | "leader" | "citizen";

export interface AuthUser {
  zaloId: string;
  role: UserRole;
  tdpName?: string; // Chỉ có khi role = "leader"
  permissions: Permission[];
}

export type Permission = 
  | "view_all_reports"      // Xem tất cả báo cáo
  | "create_report"         // Tạo báo cáo mới
  | "edit_report"           // Sửa báo cáo
  | "delete_report"         // Xóa báo cáo
  | "approve_report"        // Duyệt báo cáo
  | "view_stats"            // Xem thống kê
  | "manage_templates"      // Quản lý mẫu báo cáo
  | "manage_tdp"            // Quản lý TDP
  | "submit_report"         // Nộp báo cáo (tổ trưởng)
  | "view_own_reports";     // Xem báo cáo của mình

/**
 * ✅ Kiểm tra role của user dựa trên Zalo ID (hỗ trợ fallback)
 * @param idByOA - ID từ OA (ưu tiên)
 * @param id - ID Zalo thường (fallback)
 */
export const getUserRole = (idByOA?: string, id?: string): UserRole => {
  // Danh sách ID để kiểm tra (ưu tiên idByOA, fallback sang id)
  const userIds = [idByOA, id].filter(Boolean) as string[];
  
  if (userIds.length === 0) {
    console.log("🔍 No user ID found, defaulting to citizen");
    return "citizen";
  }

  // Kiểm tra từng ID trong danh sách
  for (const userId of userIds) {
    if (ADMIN_ZALO_IDS.includes(userId)) {
      console.log(`🔑 Admin role detected for ID: ${userId}`);
      return "admin";
    }
    if (MOD_ZALO_IDS.includes(userId)) {
      console.log(`🔑 Mod role detected for ID: ${userId}`);
      return "mod";
    }
    if (LEADER_ZALO_IDS.includes(userId)) {
      console.log(`🔑 Leader role detected for ID: ${userId}`);
      return "leader";
    }
  }
  
  console.log(`🔑 No special role found for IDs: ${userIds.join(', ')}, defaulting to citizen`);
  return "citizen";
};

/**
 * ✅ Phiên bản tương thích ngược (chỉ nhận idByOA)
 */
export const getUserRoleCompat = (idByOA?: string): UserRole => {
  return getUserRole(idByOA);
};

/**
 * Lấy permissions dựa trên role
 */
export const getUserPermissions = (role: UserRole): Permission[] => {
  const permissions: Record<UserRole, Permission[]> = {
    admin: [
      "view_all_reports",
      "create_report", 
      "edit_report",
      "delete_report",
      "approve_report",
      "view_stats",
      "manage_templates",
      "manage_tdp"
    ],
    mod: [
      "view_all_reports",
      "create_report",
      "edit_report", 
      "approve_report",
      "view_stats",
      "manage_templates"
    ],
    leader: [
      "view_own_reports",
      "submit_report"
    ],
    citizen: []
  };
  
  return permissions[role];
};

/**
 * ✅ Kiểm tra user có quyền truy cập báo cáo không (hỗ trợ fallback)
 */
export const canAccessReports = (idByOA?: string, id?: string): boolean => {
  const role = getUserRole(idByOA, id);
  return ["admin", "mod", "leader"].includes(role);
};

/**
 * ✅ Phiên bản tương thích ngược
 */
export const canAccessReportsCompat = (idByOA?: string): boolean => {
  return canAccessReports(idByOA);
};

/**
 * ✅ Kiểm tra user có permission cụ thể không (hỗ trợ fallback)
 */
export const hasPermission = (permission: Permission, idByOA?: string, id?: string): boolean => {
  const role = getUserRole(idByOA, id);
  const permissions = getUserPermissions(role);
  return permissions.includes(permission);
};

/**
 * Lấy thông tin TDP của tổ trưởng
 */
export const getTDPInfo = async (zaloId: string): Promise<string | null> => {
  // Mapping với TDP thực tế đã tạo
  const tdpMapping: Record<string, string> = {
    "1234567890123456789": "TDP Liên Vinh", // Nguyễn A
    "zalo_id_cua_tdp_2": "TDP Số 2",
    // Thêm mapping khác khi tạo thêm TDP...
  };
  
  return tdpMapping[zaloId] || null;
};