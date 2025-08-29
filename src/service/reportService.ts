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

// 🔧 IMPROVED: Hàm làm sạch dữ liệu với debug logging
function sanitizeForFirestore(input: any, depth = 0): any {
  const indent = '  '.repeat(depth);
  
  if (input === undefined) {
    return null;
  }

  if (input && typeof input === 'object') {
    // Kiểm tra event object
    const looksLikeEvent =
      ('nativeEvent' in input) ||
      ('isDefaultPrevented' in input) ||
      ('isPropagationStopped' in input);
      
    if (looksLikeEvent) {
      const v = (input as any)?.target?.value;
      const result = typeof v === 'string' ? v : '';
      return result;
    }

    if (Array.isArray(input)) {
      const result = input.map((item) => {
        return sanitizeForFirestore(item, depth + 1);
      });
      return result;
    }

    // Object thường
    const out: any = {};
    Object.entries(input).forEach(([k, v]) => {
      const sv = sanitizeForFirestore(v, depth + 1);
      if (sv !== undefined) {
        out[k] = sv;
      }
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

  // 🔧 IMPROVED: Làm sạch toàn bộ dữ liệu
  const cleanedReportData = sanitizeForFirestore(reportData);

  cleanedReportData.assignedTDPs.forEach((tdp: TDPInfo, index: number) => {
    
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
  try {
    const snapshot = await getDocs(reportCollection);
    
    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      const report = { ...data, id: doc.id } as Report;
      
      
      return report;
    });
    
    return reports;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error fetching reports:', error);
    throw error;
  }
};

export const updateReportInService = async (
  reportId: string,
  updates: Partial<Report>
): Promise<void> => {
  try {
    const cleanedUpdates = sanitizeForFirestore(updates);
    
    const reportDoc = doc(db, 'reports', reportId);
    await updateDoc(reportDoc, cleanedUpdates);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error updating report:', error);
    throw error;
  }
};

// --- TDP SERVICES ---
export const getTDPListInService = async (): Promise<TDPInfo[]> => {
  try {
    const snapshot = await getDocs(tdpCollection);
    
    const tdps = snapshot.docs.map((doc) => {
      const data = doc.data();
      return { ...data, id: doc.id } as TDPInfo;
    });
    
    return tdps;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error fetching TDP list:', error);
    throw error;
  }
};

export const addTDPInService = async (
  tdpData: Omit<TDPInfo, 'id'>
): Promise<string> => {
  
  try {
    const cleanedData = sanitizeForFirestore(tdpData);
    const docRef = await addDoc(tdpCollection, cleanedData);
    
    return docRef.id;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error adding TDP:', error);
    throw error;
  }
};

export const updateTDPInService = async (
  tdpId: string,
  tdpData: Partial<TDPInfo>
): Promise<void> => {
  
  try {
    const cleanedData = sanitizeForFirestore(tdpData);
    const tdpDoc = doc(db, 'tdp', tdpId);
    await updateDoc(tdpDoc, cleanedData);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error updating TDP:', error);
    throw error;
  }
};

export const deleteTDPInService = async (tdpId: string): Promise<void> => {
  
  try {
    const tdpDoc = doc(db, 'tdp', tdpId);
    await deleteDoc(tdpDoc);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error deleting TDP:', error);
    throw error;
  }
};