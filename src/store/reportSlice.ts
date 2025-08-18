import { StateCreator } from 'zustand';
import dayjs from 'dayjs';
import { State } from './index';
import { Report, TDPInfo, Answer, ReportStatus } from '../types/report';
import {
  createReportInService,
  getReports,
  updateReportInService,
  getTDPListInService,
  addTDPInService,
  updateTDPInService,
  deleteTDPInService,
} from '../service/reportService';
import { getUserRole } from '../utils/auth';

interface ReportStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface ReportSlice {
  reports: Report[];
  tdpList: TDPInfo[];
  reportStats: ReportStats;
  loading: boolean;
  fetchReports: () => Promise<void>;
  fetchTDPList: () => Promise<void>;
  createReport: (data: any) => Promise<void>;
  submitAnswers: (reportId: string, answers: Answer[]) => Promise<void>;
  updateReportStatus: (
    reportId: string,
    status: 'in_progress' | 'approved' | 'rejected',
    notes?: string
  ) => Promise<void>;
  getReportStats: () => void;
  addTDP: (tdpData: Omit<TDPInfo, 'id'>) => Promise<void>;
  updateTDP: (tdpId: string, tdpData: Partial<TDPInfo>) => Promise<void>;
  deleteTDP: (tdpId: string) => Promise<void>;
}

function sanitizeForFirestore(input: any): any {
  if (input === undefined) return null;
  if (input && typeof input === 'object') {
    const looksLikeEvent =
      ('nativeEvent' in input) ||
      ('isDefaultPrevented' in input) ||
      ('isPropagationStopped' in input);
    if (looksLikeEvent) {
      const v = (input as any)?.target?.value;
      return typeof v === 'string' ? v : '';
    }
    if (Array.isArray(input)) {
      return input.map(sanitizeForFirestore);
    }
    const out: any = {};
    Object.entries(input).forEach(([k, v]) => {
      const sv = sanitizeForFirestore(v);
      if (sv !== undefined) out[k] = sv;
    });
    return out;
  }
  return input;
}

export const createReportSlice: StateCreator<State, [], [], ReportSlice> = (set, get) => ({
  reports: [],
  tdpList: [],
  reportStats: { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 },
  loading: false,

  fetchReports: async () => {
    set({ loading: true });
    try {
      const { user } = get();
      if (!user) {
        set({ reports: [], loading: false });
        return;
      }
      const zaloId = user.idByOA;
      const role = getUserRole(zaloId);
      let allReports = await getReports();
      if (role === 'leader' && zaloId) {
        allReports = allReports.filter((r) => r.assignedTo.zaloId === zaloId);
      }
      set({ reports: allReports });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchTDPList: async () => {
    try {
      const tdps = await getTDPListInService();
      set({ tdpList: tdps });
    } catch (error) {
      console.error('Failed to fetch TDP list:', error);
    }
  },

  createReport: async (reportData) => {
    set({ loading: true });
    try {
      const cleanedData = sanitizeForFirestore(reportData);
      await createReportInService(cleanedData);
      await get().fetchReports();
    } catch (error) {
      console.error('Failed to create report:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitAnswers: async (reportId, answers) => {
    const updates = { submittedAnswers: sanitizeForFirestore(answers),status: "submitted" as ReportStatus };
    await updateReportInService(reportId, updates);
    await get().fetchReports();
  },

  updateReportStatus: async (reportId, status, notes) => {
    const updates: any = { status };
    if (notes) {
      updates.notes = notes;
    }
    await updateReportInService(reportId, sanitizeForFirestore(updates));
    await get().fetchReports();
  },

  getReportStats: () => {
    const reports = get().reports;
    const total = reports.length;
    const completed = reports.filter((r) => r.status === 'approved').length;
    const pending = total - completed;
    const overdue = reports.filter(
      (r) => dayjs().isAfter(dayjs(r.dueDate)) && r.status !== 'approved'
    ).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    set({ reportStats: { total, completed, pending, overdue, completionRate } });
  },

  addTDP: async (tdpData) => {
    await addTDPInService(sanitizeForFirestore(tdpData));
    await get().fetchTDPList();
  },

  updateTDP: async (tdpId, tdpData) => {
    await updateTDPInService(tdpId, sanitizeForFirestore(tdpData));
    await get().fetchTDPList();
  },

  deleteTDP: async (tdpId) => {
    await deleteTDPInService(tdpId);
    await get().fetchTDPList();
  },
});
