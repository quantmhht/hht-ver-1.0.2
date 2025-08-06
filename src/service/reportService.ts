// src/service/reportService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Report,
  ReportStats,
  TDPInfo,
  GetReportsParams,
  CreateReportParams,
  UpdateReportParams,
  MonthlyReportStats,
  ReportStatus, // <-- Import thêm
  SubmitReportData, // <-- Import thêm
  ReportHistoryItem // <-- Import thêm
} from "../types/report";

// ===== REPORT CRUD =====

export const getReports = async (params: GetReportsParams): Promise<Report[]> => {
  try {
    const {
      assignedTo,
      status,
      category,
      dateFrom,
      dateTo,
      limit: limitCount = 50
    } = params;

    let reportsQuery = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    // Thêm filters
    if (assignedTo) {
      reportsQuery = query(reportsQuery, where("assignedTo", "==", assignedTo));
    }

    if (category) {
      reportsQuery = query(reportsQuery, where("category", "==", category));
    }

    if (status && status.length > 0) {
      reportsQuery = query(reportsQuery, where("status", "in", status));
    }

    if (limitCount) {
      reportsQuery = query(reportsQuery, limit(limitCount));
    }

    const snapshot = await getDocs(reportsQuery);
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date(),
      completedAt: doc.data().completedAt?.toDate() || null,
    })) as Report[];

    // Manual filter cho dateFrom/dateTo (vì Firestore có hạn chế query phức tạp)
    let filteredReports = reports;
    if (dateFrom) {
      filteredReports = filteredReports.filter(r => r.createdAt >= dateFrom);
    }
    if (dateTo) {
      filteredReports = filteredReports.filter(r => r.createdAt <= dateTo);
    }

    return filteredReports;
  } catch (error) {
    console.error("Error getting reports:", error);
    return [];
  }
};

export const getReport = async (id: string): Promise<Report | null> => {
  try {
    const docRef = doc(db, "reports", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate() || null,
      } as Report;
    }
    return null;
  } catch (error) {
    console.error("Error getting report:", error);
    return null;
  }
};

export const createReport = async (params: CreateReportParams): Promise<boolean> => {
  try {
    const reportData = {
      ...params,
      createdAt: Timestamp.fromDate(new Date()),
      dueDate: Timestamp.fromDate(params.dueDate),
      status: "pending" as const,
      submissionHistory: [],
    };

    await addDoc(collection(db, "reports"), reportData);
    return true;
  } catch (error) {
    console.error("Error creating report:", error);
    return false;
  }
};

export const updateReport = async (params: UpdateReportParams): Promise<boolean> => {
  try {
    const { id, ...updateData } = params;
    const docRef = doc(db, "reports", id);

    // Convert dates to Timestamps
    const processedData: any = { ...updateData };
    if (updateData.status === "approved" || updateData.status === "submitted") {
      processedData.completedAt = Timestamp.fromDate(new Date());
    }

    await updateDoc(docRef, processedData);
    return true;
  } catch (error) {
    console.error("Error updating report:", error);
    return false;
  }
};

export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "reports", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    return false;
  }
};

// ===== STATISTICS =====

export const getReportStats = async (

  zaloId?: string
): Promise<ReportStats> => {
  try {
    let reportsQuery = query(
      collection(db, "reports"),
    );

    // Nếu là tổ trưởng, chỉ lấy báo cáo của mình
    if (zaloId) {
      reportsQuery = query(reportsQuery, where("assignedTo", "==", zaloId));
    }

    const snapshot = await getDocs(reportsQuery);
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Report[];

    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === "approved").length;
    const pendingReports = reports.filter(r => ["pending", "in_progress", "submitted"].includes(r.status)).length;
    
    const now = new Date();
    const overdueReports = reports.filter(r => 
      new Date(r.dueDate) < now && r.status !== "approved"
    ).length;

    const completionRate = totalReports > 0 ? (completedReports / totalReports) * 100 : 0;

    // Tính thời gian hoàn thành trung bình
    const completedWithTime = reports.filter(r => r.completedAt && r.createdAt);
    const averageCompletionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, r) => {
          const days = Math.ceil((r.completedAt!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedWithTime.length
      : 0;

    // Thống kê theo tháng (6 tháng gần nhất)
    const monthlyStats = calculateMonthlyStats(reports);

    return {
      totalReports,
      completedReports,
      pendingReports,
      overdueReports,
      completionRate,
      averageCompletionTime,
      monthlyStats,
    };
  } catch (error) {
    console.error("Error getting report stats:", error);
    return {
      totalReports: 0,
      completedReports: 0,
      pendingReports: 0,
      overdueReports: 0,
      completionRate: 0,
      averageCompletionTime: 0,
      monthlyStats: [],
    };
  }
};

function calculateMonthlyStats(reports: Report[]): MonthlyReportStats[] {
  const months: Record<string, Report[]> = {};
  
  // Group reports by month (6 months ago to now)
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7); // "2024-01"
    months[monthKey] = [];
  }

  reports.forEach(report => {
    const monthKey = report.createdAt.toISOString().slice(0, 7);
    if (months[monthKey]) {
      months[monthKey].push(report);
    }
  });

  return Object.entries(months).map(([month, monthReports]) => {
    const totalReports = monthReports.length;
    const completedReports = monthReports.filter(r => r.status === "approved").length;
    const completionRate = totalReports > 0 ? (completedReports / totalReports) * 100 : 0;
    
    const completedWithTime = monthReports.filter(r => r.completedAt);
    const averageCompletionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, r) => {
          const days = Math.ceil((r.completedAt!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedWithTime.length
      : 0;

    return {
      month,
      totalReports,
      completedReports,
      completionRate,
      averageCompletionTime,
    };
  });
}

// ===== TDP MANAGEMENT =====

export const getTDPList = async (): Promise<TDPInfo[]> => {
  try {
    // Tạm thời trả về dữ liệu tĩnh, sau này có thể lưu vào Firebase
    const tdpList: TDPInfo[] = [
      {
        id: "tdp-1",
        name: "TDP Số 1",
        leaderZaloId: "zalo_id_cua_tdp_1",
        leaderName: "Nguyễn Văn A",
        leaderPhone: "0123456789",
        address: "Khu phố 1, phường Hà Huy Tập",
        householdCount: 120,
        populationCount: 350,
        active: true,
      },
      {
        id: "tdp-2", 
        name: "TDP Số 2",
        leaderZaloId: "zalo_id_cua_tdp_2",
        leaderName: "Trần Thị B",
        leaderPhone: "0123456788",
        address: "Khu phố 2, phường Hà Huy Tập",
        householdCount: 95,
        populationCount: 280,
        active: true,
      },
    ];

    return tdpList;
  } catch (error) {
    console.error("Error getting TDP list:", error);
    return [];
  }
};

export const createTDP = async (data: any): Promise<boolean> => {
  console.log("SERVICE: Đang tạo TDP với dữ liệu:", data);
  // Logic thêm vào database thật sẽ ở đây
  return true; // Giả lập thành công
};

export const updateTDP = async (id: string, data: any): Promise<boolean> => {
  console.log(`SERVICE: Đang cập nhật TDP ${id} với dữ liệu:`, data);
  // Logic cập nhật database thật sẽ ở đây
  return true; // Giả lập thành công
};

export const deleteTDP = async (id: string): Promise<boolean> => {
  console.log(`SERVICE: Đang xóa TDP ${id}`);
  // Logic xóa khỏi database thật sẽ ở đây
  return true; // Giả lập thành công
};

export const updateReportStatus = async (
  reportId: string,
  status: ReportStatus,
  note: string, // Lý do/ghi chú
  user: { id: string; name: string } // Thông tin người thực hiện
): Promise<boolean> => {
  try {
    const docRef = doc(db, "reports", reportId);
    const updateData: any = { status };

    // Tạo một mục lịch sử mới
    const historyEntry: ReportHistoryItem = {
      timestamp: new Date(),
      action: status === 'approved' ? 'Đã duyệt' : 'Đã từ chối',
      note: note,
      by: user.name, // Tên người thực hiện
    };

    // Thêm mục lịch sử vào mảng history trong document
    updateData.history = arrayUnion(historyEntry);

    // Ghi nhận ngày hoàn thành
    if (status === "approved" || status === "rejected") {
      updateData.completedAt = Timestamp.fromDate(new Date());
    }

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating report status:", error);
    return false;
  }
};

export const submitReport = async (
  reportId: string,
  data: SubmitReportData,
  user: { id: string; name: string } // Thông tin người nộp
): Promise<boolean> => {
  try {
    const docRef = doc(db, "reports", reportId);
    
    // Tạo mục lịch sử cho hành động nộp báo cáo
    const historyEntry: ReportHistoryItem = {
      timestamp: data.submittedAt,
      action: 'Nộp báo cáo',
      note: data.content.substring(0, 100), // Lấy 100 ký tự đầu làm ghi chú
      by: user.name,
    };

    const updateData = {
      submittedContent: data.content,
      submittedImages: data.images,
      submittedAt: Timestamp.fromDate(data.submittedAt),
      status: "submitted" as const,
      history: arrayUnion(historyEntry),
    };

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("Error submitting report:", error);
    return false;
  }
};