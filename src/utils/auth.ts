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
 * Kiểm tra role của user dựa trên Zalo ID
 */
export const getUserRole = (zaloId?: string): UserRole => {
  if (!zaloId) return "citizen";
  
  if (ADMIN_ZALO_IDS.includes(zaloId)) return "admin";
  if (MOD_ZALO_IDS.includes(zaloId)) return "mod";
  if (LEADER_ZALO_IDS.includes(zaloId)) return "leader";
  
  return "citizen";
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
 * Kiểm tra user có quyền truy cập báo cáo không
 */
export const canAccessReports = (zaloId?: string): boolean => {
  const role = getUserRole(zaloId);
  return ["admin", "mod", "leader"].includes(role);
};

/**
 * Kiểm tra user có permission cụ thể không
 */
export const hasPermission = (zaloId: string, permission: Permission): boolean => {
  const role = getUserRole(zaloId);
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