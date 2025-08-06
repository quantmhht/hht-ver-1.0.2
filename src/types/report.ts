// src/types/report.ts
export interface Report {
  id: string;
  title: string;
  description: string;
  assignedTo: string; 
  assignedToName?: string;
  assignedBy: string; 
  assignedByName?: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt?: Date;
  submittedAt?: Date;
  completedAt?: Date;
  status: ReportStatus;
  priority: ReportPriority;
  category: string;
  requirements?: string;
  tdpName: string;
  feedback?: string;
  submittedContent?: string;
  submittedImages?: string[];
  history?: ReportHistoryItem[];
}


export interface ReportHistoryItem {
  timestamp: Date;
  action: string; // Ví dụ: "Đã duyệt", "Từ chối", "Nộp lại"
  note?: string;   // Ghi chú hoặc lý do
  by: string;       // Tên người thực hiện hành động
}

export type ReportStatus = 
  | "pending"     // Chưa làm
  | "in_progress" // Đang làm
  | "submitted"   // Đã nộp, chờ duyệt
  | "approved"    // Đã được duyệt
  | "rejected"    // Bị từ chối
  | "overdue";    // Quá hạn

export type ReportPriority = "low" | "medium" | "high" | "urgent";

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: ReportField[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ReportField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "file";
  required: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TDPInfo {
  id: string;
  name: string;
  leaderZaloId: string;
  leaderName: string;
  leaderPhone: string;
  address: string;
  description?: string; // Thêm vì component có dùng
  householdCount: number; // Số hộ dân
  populationCount: number; // Số dân
  active: boolean;
  createdAt?: Date;
}

export interface ReportStats {
  totalReports: number;
  completedReports: number;
  pendingReports: number;
  overdueReports: number;
  completionRate: number;
  averageCompletionTime: number; // Thời gian hoàn thành trung bình (ngày)
  monthlyStats: MonthlyReportStats[];
}

export interface MonthlyReportStats {
  month: string; // "2024-01"
  totalReports: number;
  completedReports: number;
  completionRate: number;
  averageCompletionTime: number;
}

// Params cho API calls
export interface GetReportsParams {
  assignedTo?: string; // Lọc theo tổ trưởng
  status?: ReportStatus[];
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface CreateReportParams {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: ReportPriority;
  category: string;
  tdpName: string;
}

export interface UpdateReportParams {
  id: string;
  title?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority?: ReportPriority;
  category?: string;
  tdpName?: string;
  status?: ReportStatus;
}

export interface FilterOptions {
  year: number;
  month: number | null;
  quarter: number | null;
  tdpId: string | null;
}

export interface SubmitReportData {
  content: string;
  images: string[];
  submittedAt: Date;
}

export interface User {
  id: string;
  name: string;
}