// src/constants/roles.ts

/**
 * Danh sách Zalo ID của các Admin
 */
export const ADMIN_ZALO_IDS = ["6149625822422342809", "3368637342326461234","4955733160204438926","4781338949378083737"];

/**
 * Danh sách Zalo ID của các Moderator  
 */
export const MOD_ZALO_IDS = ["2828312529914362254"];

/**
 * Danh sách Zalo ID của các Tổ trưởng TDP
 * TODO: Thay thế bằng Zalo ID thực của các tổ trưởng
 */
export const LEADER_ZALO_IDS = [
  "1234567890123456789", 
  "1094668219729944831"
  // Thêm Zalo ID thực của các tổ trưởng khác
];

/**
 * Tất cả các Zalo ID được ủy quyền
 */
export const ALL_AUTHORIZED_IDS = [...ADMIN_ZALO_IDS, ...MOD_ZALO_IDS, ...LEADER_ZALO_IDS];

/**
 * Mapping Zalo ID của tổ trưởng với tên TDP tương ứng
 */
export const TDP_MAPPING: Record<string, string> = {
  "1234567890123456789": "TDP Liên Vinh",
  "1094668219729944831": "CT",
  // Thêm mapping cho các tổ trưởng khác khi có Zalo ID thực
};