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
    console.log(`${indent}🧹 Sanitizing undefined -> null`);
    return null;
  }

  if (input && typeof input === 'object') {
    // Kiểm tra event object
    const looksLikeEvent =
      ('nativeEvent' in input) ||
      ('isDefaultPrevented' in input) ||
      ('isPropagationStopped' in input);
      
    if (looksLikeEvent) {
      console.log(`${indent}🧹 Detected event object, extracting value`);
      const v = (input as any)?.target?.value;
      const result = typeof v === 'string' ? v : '';
      console.log(`${indent}   Result: "${result}"`);
      return result;
    }

    if (Array.isArray(input)) {
      console.log(`${indent}🧹 Sanitizing array with ${input.length} items`);
      const result = input.map((item, index) => {
        console.log(`${indent}  [${index}]:`, typeof item, item);
        return sanitizeForFirestore(item, depth + 1);
      });
      console.log(`${indent}   Array result:`, result);
      return result;
    }

    // Object thường
    console.log(`${indent}🧹 Sanitizing object:`, Object.keys(input));
    const out: any = {};
    Object.entries(input).forEach(([k, v]) => {
      console.log(`${indent}  ${k}:`, typeof v, Array.isArray(v) ? `array[${v.length}]` : v);
      const sv = sanitizeForFirestore(v, depth + 1);
      if (sv !== undefined) {
        out[k] = sv;
        console.log(`${indent}    -> saved as:`, typeof sv, sv);
      }
    });
    return out;
  }

  console.log(`${indent}🧹 Sanitizing primitive:`, typeof input, input);
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
  console.log('📝 Creating report in service...');
  console.log('📋 Report data:', {
    title: reportData.title,
    questionsCount: reportData.questions?.length || 0,
    assignedTDPsCount: reportData.assignedTDPs?.length || 0
  });

  const batch = writeBatch(db);

  // 🔧 IMPROVED: Làm sạch toàn bộ dữ liệu với debug
  console.log('🧹 Sanitizing report data...');
  const cleanedReportData = sanitizeForFirestore(reportData);
  
  console.log('✅ Cleaned report data preview:', {
    title: cleanedReportData.title,
    questionsCount: cleanedReportData.questions?.length || 0,
    questions: cleanedReportData.questions?.map(q => ({ id: q.id, text: q.text.substring(0, 30) + '...' }))
  });

  cleanedReportData.assignedTDPs.forEach((tdp: TDPInfo, index: number) => {
    console.log(`📋 Creating report ${index + 1} for TDP: ${tdp.name}`);
    
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
    
    console.log(`  📝 Report structure for ${tdp.name}:`, {
      title: reportForTDP.title,
      questionsCount: reportForTDP.questions?.length || 0,
      assignedTo: reportForTDP.assignedTo
    });
    
    batch.set(newReportRef, reportForTDP);
  });

  console.log('🚀 Committing batch write...');
  await batch.commit();
  console.log('✅ Reports created successfully');
};

export const getReports = async (): Promise<Report[]> => {
  console.log('📖 Fetching reports from Firestore...');
  
  try {
    const snapshot = await getDocs(reportCollection);
    console.log(`📊 Found ${snapshot.docs.length} reports in Firestore`);
    
    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      const report = { ...data, id: doc.id } as Report;
      
      // 🐛 DEBUG: Log report structure
      console.log(`📋 Report ${doc.id}:`, {
        title: report.title,
        status: report.status,
        questionsCount: report.questions?.length || 0,
        answersCount: report.submittedAnswers?.length || 0,
        hasQuestions: !!report.questions,
        hasAnswers: !!report.submittedAnswers,
        questionsPreview: report.questions?.slice(0, 2).map(q => ({ id: q.id, text: q.text.substring(0, 30) + '...' })),
        answersPreview: report.submittedAnswers?.slice(0, 2).map(a => ({ questionId: a.questionId, hasValue: !!a.value }))
      });
      
      return report;
    });
    
    console.log('✅ Reports fetched and processed');
    return reports;
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    throw error;
  }
};

export const updateReportInService = async (
  reportId: string,
  updates: Partial<Report>
): Promise<void> => {
  console.log('🔄 Updating report in service...');
  console.log('📝 Report ID:', reportId);
  console.log('📝 Updates:', updates);
  
  // 🔧 IMPROVED: Special handling for submittedAnswers
  if (updates.submittedAnswers) {
    console.log('💬 Updating submitted answers:');
    updates.submittedAnswers.forEach((answer, index) => {
      console.log(`  ${index + 1}. Question ${answer.questionId}:`, {
        value: answer.value,
        type: typeof answer.value,
        isArray: Array.isArray(answer.value),
        isEmpty: Array.isArray(answer.value) ? answer.value.length === 0 : !answer.value
      });
    });
  }
  
  try {
    console.log('🧹 Sanitizing updates...');
    const cleanedUpdates = sanitizeForFirestore(updates);
    
    console.log('📝 Cleaned updates preview:', {
      status: cleanedUpdates.status,
      answersCount: cleanedUpdates.submittedAnswers?.length || 'unchanged',
      hasAnswers: !!cleanedUpdates.submittedAnswers
    });
    
    const reportDoc = doc(db, 'reports', reportId);
    await updateDoc(reportDoc, cleanedUpdates);
    
    console.log('✅ Report updated successfully');
  } catch (error) {
    console.error('❌ Error updating report:', error);
    throw error;
  }
};

// --- TDP SERVICES ---
export const getTDPListInService = async (): Promise<TDPInfo[]> => {
  console.log('👥 Fetching TDP list from Firestore...');
  
  try {
    const snapshot = await getDocs(tdpCollection);
    console.log(`📊 Found ${snapshot.docs.length} TDPs in Firestore`);
    
    const tdps = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(`👥 TDP ${doc.id}:`, {
        name: data.name,
        leaderName: data.leaderName,
        leaderZaloId: data.leaderZaloId
      });
      return { ...data, id: doc.id } as TDPInfo;
    });
    
    console.log('✅ TDPs fetched successfully');
    return tdps;
  } catch (error) {
    console.error('❌ Error fetching TDP list:', error);
    throw error;
  }
};

export const addTDPInService = async (
  tdpData: Omit<TDPInfo, 'id'>
): Promise<string> => {
  console.log('➕ Adding new TDP...');
  console.log('👥 TDP data:', tdpData);
  
  try {
    const cleanedData = sanitizeForFirestore(tdpData);
    console.log('✅ Cleaned TDP data:', cleanedData);
    
    const docRef = await addDoc(tdpCollection, cleanedData);
    console.log('✅ TDP added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding TDP:', error);
    throw error;
  }
};

export const updateTDPInService = async (
  tdpId: string,
  tdpData: Partial<TDPInfo>
): Promise<void> => {
  console.log('🔄 Updating TDP...');
  console.log('👥 TDP ID:', tdpId);
  console.log('📝 Updates:', tdpData);
  
  try {
    const cleanedData = sanitizeForFirestore(tdpData);
    const tdpDoc = doc(db, 'tdp', tdpId);
    await updateDoc(tdpDoc, cleanedData);
    
    console.log('✅ TDP updated successfully');
  } catch (error) {
    console.error('❌ Error updating TDP:', error);
    throw error;
  }
};

export const deleteTDPInService = async (tdpId: string): Promise<void> => {
  console.log('🗑️ Deleting TDP...');
  console.log('👥 TDP ID:', tdpId);
  
  try {
    const tdpDoc = doc(db, 'tdp', tdpId);
    await deleteDoc(tdpDoc);
    
    console.log('✅ TDP deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting TDP:', error);
    throw error;
  }
};