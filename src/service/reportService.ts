import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Report, Question, TDPInfo } from '../types/report';

const reportCollection = collection(db, 'reports');
const tdpCollection = collection(db, 'tdp');

// Hàm làm sạch dữ liệu trước khi lưu Firestore
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

// --- REPORT SERVICES ---
export const createReportInService = async (reportData: {
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: number;
  questions: Question[];
  assignedTDPs: TDPInfo[];
  assignedBy: { zaloId: string; name: string };
}): Promise<void> => {
  const batch = writeBatch(db);

  // Làm sạch toàn bộ dữ liệu trước khi lưu
  const cleanedReportData = sanitizeForFirestore(reportData);

  cleanedReportData.assignedTDPs.forEach((tdp: TDPInfo) => {
    const newReportRef = doc(reportCollection);
    const reportForTDP: Omit<Report, 'id'> = {
      title: cleanedReportData.title,
      priority: cleanedReportData.priority,
      dueDate: cleanedReportData.dueDate,
      questions: cleanedReportData.questions,
      assignedTo: {
        tdpId: tdp.id,
        zaloId: tdp.leaderZaloId,
        tdpName: tdp.name,
      },
      assignedBy: cleanedReportData.assignedBy,
      status: 'pending',
      history: [
        {
          action: 'created',
          actor: cleanedReportData.assignedBy,
          timestamp: Date.now(),
          notes: 'Báo cáo được tạo',
        },
      ],
      submittedAnswers: [],
    };
    batch.set(newReportRef, reportForTDP);
  });

  await batch.commit();
};

export const getReports = async (): Promise<Report[]> => {
  const snapshot = await getDocs(reportCollection);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Report));
};

export const updateReportInService = async (
  reportId: string,
  updates: Partial<Report>
): Promise<void> => {
  const reportDoc = doc(db, 'reports', reportId);
  await updateDoc(reportDoc, sanitizeForFirestore(updates));
};

// --- TDP SERVICES ---
export const getTDPListInService = async (): Promise<TDPInfo[]> => {
  const snapshot = await getDocs(tdpCollection);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as TDPInfo));
};

export const addTDPInService = async (
  tdpData: Omit<TDPInfo, 'id'>
): Promise<string> => {
  const docRef = await addDoc(tdpCollection, sanitizeForFirestore(tdpData));
  return docRef.id;
};

export const updateTDPInService = async (
  tdpId: string,
  tdpData: Partial<TDPInfo>
): Promise<void> => {
  const tdpDoc = doc(db, 'tdp', tdpId);
  await updateDoc(tdpDoc, sanitizeForFirestore(tdpData));
};

export const deleteTDPInService = async (tdpId: string): Promise<void> => {
  const tdpDoc = doc(db, 'tdp', tdpId);
  await deleteDoc(tdpDoc);
};
