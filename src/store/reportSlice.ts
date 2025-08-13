// src/store/reportSlice.ts
import { State } from "./index"; // Thêm dòng này vào đầu file

import { StateCreator } from "zustand";
import {
  Report,
  ReportStats,
  TDPInfo,
  GetReportsParams,
  CreateReportParams,
  UpdateReportParams,
  ReportStatus,
  FilterOptions,
  SubmitReportData,
  User
} from "../types/report";
import {
  getReports as getReportsService,
  getReport as getReportService,
  createReport as createReportService, // Đổi tên để tránh trùng lặp
  updateReport as updateReportService, // Đổi tên để tránh trùng lặp
  deleteReport as deleteReportService, // Đổi tên để tránh trùng lặp
  getReportStats,
  getTDPList,
  createTDP as createTDPService,
  updateTDP as updateTDPService,
  deleteTDP as deleteTDPService,
  updateReportStatus as updateReportStatusService,
  submitReport as submitReportService,
} from "../service/reportService";

export interface ReportSlice {
  // State
  reports: Report[];
  loadingReports: boolean;
  reportStats: ReportStats | null;
  loadingStats: boolean;
  detailedReports: Report[];
  loadingDetailedReports: boolean;
  tdpList: TDPInfo[];
  loadingTDP: boolean;
  selectedReport: Report | null;
  reportDetail: Report | null;
  loadingReportDetail: boolean;
  updatingReport: boolean;
  // Actions
  getReports: (params: GetReportsParams) => Promise<void>;
  createReport: (params: CreateReportParams) => Promise<boolean>;
  updateReport: (params: UpdateReportParams) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  getReportStats: (filters: Partial<FilterOptions>) => Promise<void>;
  getTDPList: () => Promise<void>;
  setSelectedReport: (report: Report | null) => void;
  getDetailedStats: (params?: GetReportsParams) => Promise<void>; 
  createTDP: (data: Omit<TDPInfo, 'id' | 'createdAt'>) => Promise<void>;
  updateTDP: (id: string, data: Partial<TDPInfo>) => Promise<void>;
  deleteTDP: (id: string) => Promise<void>;
  getTDPStats: () => Promise<void>;
  getReportDetail: (reportId: string) => Promise<void>;
  updateReportStatus: (reportId: string, status: ReportStatus, note?: string) => Promise<void>;
  submitReport: (reportId: string, data: SubmitReportData) => Promise<void>;
  // Computed getters
  getPendingReportsCount: (zaloId?: string) => number;
  getOverdueReportsCount: (zaloId?: string) => number;
  getReportsByStatus: (status: ReportStatus, zaloId?: string) => Report[];
}


export const createReportSlice: StateCreator<State, [], [], ReportSlice> = (set, get) => ({
  // Initial state
  reports: [],
  loadingReports: false,
  reportStats: null,
  loadingStats: false,
  detailedReports: [],
  loadingDetailedReports: false,
  tdpList: [],
  loadingTDP: false,
  selectedReport: null,
  reportDetail: null,
  loadingReportDetail: false,
  updatingReport: false,


  // Actions
  getReports: async (params: GetReportsParams) => {
    try {
      set({ loadingReports: true });
      const reports = await getReportsService(params);
      set({ reports, loadingReports: false });
    } catch (error) {
      console.error("Error fetching reports:", error);
      set({ loadingReports: false });
    }
  },

  createReport: async (params: CreateReportParams) => {
    try {
      const success = await createReportService(params);
      return success;
    } catch (error) {
      console.error("Error creating report:", error);
      return false;
    }
  },
  updateReport: async (params: UpdateReportParams) => {
    try {
      const success = await updateReportService(params);
      if (success) {
        // Update local state
        const reports = get().reports.map(report => 
          report.id === params.id 
            ? { ...report, ...params, updatedAt: new Date() }
            : report
        );
        set({ reports });
      }
      return success;
    } catch (error) {
      console.error("Error updating report:", error);
      return false;
    }
  },

  deleteReport: async (id: string) => {
    try {
      const success = await deleteReportService(id);
      if (success) {
        const reports = get().reports.filter(report => report.id !== id);
        set({ reports });
      }
      return success;
    } catch (error) {
      console.error("Error deleting report:", error);
      return false;
    }
  },

  getReportStats: async (filters: Partial<FilterOptions>) => {
    try {
      set({ loadingStats: true });
       const stats = await getReportStats(filters.tdpId || undefined);
      set({ reportStats: stats, loadingStats: false });
    } catch (error) {
      console.error("Error fetching report stats:", error);
      set({ loadingStats: false });
    }
  },
  getDetailedStats: async (params?: GetReportsParams) => {
    set({ loadingDetailedReports: true });
    try {
      // Tận dụng hàm getReports đã có sẵn trong service
      const reportsData = await getReportsService(params || { limit: 20 }); // Lấy 20 báo cáo gần nhất làm mặc định
      set({ detailedReports: reportsData, loadingDetailedReports: false });
    } catch (error)      {
      console.error("Lỗi khi lấy danh sách báo cáo chi tiết:", error);
      set({ loadingDetailedReports: false });
    }
  },
  getTDPList: async () => {
    try {
      set({ loadingTDP: true });
      const tdpList = await getTDPList();
      set({ tdpList, loadingTDP: false });
    } catch (error) {
      console.error("Error fetching TDP list:", error);
      set({ loadingTDP: false });
    }
  },

  setSelectedReport: (report: Report | null) => {
    set({ selectedReport: report });
  },

  // Computed getters
  getPendingReportsCount: (zaloId?: string) => {
    const reports = get().reports;
    return reports.filter(report => {
      const matchesUser = !zaloId || report.assignedTo === zaloId;
      const isPending = ["pending", "in_progress"].includes(report.status);
      return matchesUser && isPending;
    }).length;
  },

  getOverdueReportsCount: (zaloId?: string) => {
    const reports = get().reports;
    const now = new Date();
    return reports.filter(report => {
      const matchesUser = !zaloId || report.assignedTo === zaloId;
      const isOverdue = new Date(report.dueDate) < now && report.status !== "approved";
      return matchesUser && isOverdue;
    }).length;
  },

  getReportsByStatus: (status: ReportStatus, zaloId?: string) => {
    const reports = get().reports;
    return reports.filter(report => {
      const matchesUser = !zaloId || report.assignedTo === zaloId;
      const matchesStatus = report.status === status;
      return matchesUser && matchesStatus;
    });
  },
  createTDP: async (data) => {
    try {
      await createTDPService(data);
      await get().getTDPList(); // Tải lại danh sách TDP sau khi tạo
    } catch (error) {
      console.error("Error creating TDP:", error);
      throw error; // Ném lỗi để component có thể bắt và xử lý
    }
  },

  updateTDP: async (id, data) => {
    try {
      await updateTDPService(id, data);
      await get().getTDPList(); // Tải lại danh sách TDP sau khi cập nhật
    } catch (error) {
      console.error("Error updating TDP:", error);
      throw error;
    }
  },

  deleteTDP: async (id) => {
    try {
      await deleteTDPService(id);
      await get().getTDPList(); // Tải lại danh sách TDP sau khi xóa
    } catch (error) {
      console.error("Error deleting TDP:", error);
      throw error;
    }
  },

  getTDPStats: async () => {
    // Hàm này đang được mock trong component, nên ở đây chỉ cần là một hàm rỗng
    console.log("Action getTDPStats được gọi.");
    return Promise.resolve();
  },

  getReportDetail: async (reportId: string) => {
    set({ loadingReportDetail: true });
    try {
      const data = await getReportService(reportId);
      set({ reportDetail: data, loadingReportDetail: false });
    } catch (error) {
      console.error("Error fetching report detail:", error);
      set({ loadingReportDetail: false });
    }
  },

  updateReportStatus: async (reportId, status, note = "") => {
    const user = get().user;
    if (!user) {
      console.error("User not found for updating status");
      return;
    }
    set({ updatingReport: true });
    try {
      await updateReportStatusService(reportId, status, note, user);
      await get().getReportDetail(reportId); // Tải lại dữ liệu mới nhất
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    } finally {
      set({ updatingReport: false });
    }
  },

  submitReport: async (reportId, data) => {
    const user = get().user;
    if (!user) {
      console.error("User not found for submitting report");
      return;
    }
    set({ updatingReport: true });
    try {
      await submitReportService(reportId, data, user);
      await get().getReportDetail(reportId); // Tải lại dữ liệu mới nhất
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    } finally {
      set({ updatingReport: false });
    }
  },
});