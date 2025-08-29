// src/service/services.ts
import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  limit,
  orderBy,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { News, Feedback, Organization, FeedbackType } from "@dts";
import { db } from "./firebase";

// ===== INTERFACES CHO PARAMS =====

export interface GetOrganizationParams {
  miniAppId: string;
}

export interface GetNewsParams {
  page?: number;
  limit?: number;
}

export interface CreateFeedbackParams {
  title: string;
  content: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  type: string; // Tên loại phản ánh
  imageUrls: string[];
  response?: string;
  creationTime: Date;
  responseTime?: Date | null;
  location?: {latitude: string, longitude: string} | null; // <-- Thêm dòng này

}

export interface GetFeedbacksParams {
  page?: number;
  limit?: number;
  firstFetch?: boolean;
}

export interface GetFeedbackTypeParams {

}

// ===== ORGANIZATION SERVICES =====

export const getOrganization = async (params: GetOrganizationParams): Promise<Organization | null> => {
  try {
    // Tạm thời trả về dữ liệu mặc định, sau này có thể lấy từ Firestore theo miniAppId
    const defaultOrg: Organization = {
      id: "ha-huy-tap-ward",
      name: "Kết nối người dân với chính quyền",
      description: "Ủy ban nhân dân phường Hà Huy Tập, tỉnh Hà Tĩnh",
      logoUrl: "/assets/logo.png",
      officialAccounts: [
        {
          oaId: "oa-ha-huy-tap",
          name: "UBND Phường Hà Huy Tập",
          logoUrl: "/assets/logo.png",
          follow: false,
        }
      ]
    };
    return defaultOrg;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting organization:", error);
    return null;
  }
};

// ===== NEWS SERVICES =====

export const getNews = async (params: GetNewsParams = {}): Promise<News[]> => {
  try {
    const { limit: limitCount = 20, page = 0 } = params;
    
    const newsQuery = query(
      collection(db, "news"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    // Nếu có phân trang
    if (page > 0) {
      // Lấy document cuối cùng của trang trước để phân trang
      // Cần implement logic phân trang phức tạp hơn nếu cần
    }

    const newsSnapshot = await getDocs(newsQuery);
    const newsList = newsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as News[];

    return newsList;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting news:", error);
    return [];
  }
};

// ===== FEEDBACK SERVICES =====

export const createFeedback = async (feedbackData: CreateFeedbackParams): Promise<boolean> => {
  try {
    const feedbackCol = collection(db, "feedbacks");
    await addDoc(feedbackCol, {
      ...feedbackData,
      createdAt: new Date(),
      status: "Mới",
    });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating feedback:", error);
    return false;
  }
};

export const getFeedbacks = async (params: GetFeedbacksParams): Promise<Feedback[]> => {
  try {
    const {  limit: limitCount = 10, page = 0 } = params;
    
    const feedbackQuery = query(
      collection(db, "feedbacks"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const feedbackSnapshot = await getDocs(feedbackQuery);
    const feedbackList = feedbackSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Chuyển đổi timestamp thành Date nếu cần
      creationTime: doc.data().creationTime?.toDate?.() || doc.data().creationTime,
      responseTime: doc.data().responseTime?.toDate?.() || doc.data().responseTime,
    })) as Feedback[];

    return feedbackList;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting feedbacks:", error);
    return [];
  }
};

export const getFeedbackDetail = async (id: string): Promise<Feedback | null> => {
  try {
    const docRef = doc(db, "feedbacks", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        creationTime: data.creationTime?.toDate?.() || data.creationTime,
        responseTime: data.responseTime?.toDate?.() || data.responseTime,
      } as Feedback;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting feedback detail:", error);
    return null;
  }
};

export const getFeedbackTypes = async (params: GetFeedbackTypeParams): Promise<FeedbackType[]> => {
  // Tạm thời trả về dữ liệu tĩnh, sau này có thể lưu vào Firestore
  try {
    const types: FeedbackType[] = [
      { id: 1, title: "An ninh trật tự đô thị", order: 1 },
      { id: 2, title: "An toàn giao thông" , order: 2 },
      { id: 3, title: "Hạ tầng đô thị, đất đai, xây dựng", order: 3 },
      { id: 4, title: "Ô nhiễm môi trường",   order: 4 },
      { id: 5, title: "An toàn thực phẩm", order: 5 },
      { id: 6, title: "Y tế, sức khỏe", order: 6 },
      { id: 7, title: "Công vụ, công chức, hành chính", order: 7 },
      { id: 8, title: "Vướng mắc doanh nghiệp", order: 8 },
      { id: 9, title: "Hàng hóa, tiêu dùng, dịch vụ",  order: 9 },
      { id: 10, title: "Phản hồi thông tin báo chí", order: 10 },
      { id: 11, title: "Trẻ em, giáo dục", order: 11 },
      { id: 12, title: "Các vấn đề khác", order: 12 },
    ];
    return types;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting feedback types:", error);
    return [];
  }
};

// ===== HELPER FUNCTIONS =====

export const getFeedbackTypeName = (id: number): string => {
  const types: { [key: number]: string } = {
    1: "An ninh trật tự đô thị",
    2: "An toàn giao thông",
    3: "Hạ tầng đô thị, đất đai, xây dựng",
    4: "Ô nhiễm môi trường",
	  5: "An toàn thực phẩm",
	  6: "Y tế, sức khỏe",
	  7: "Công vụ, công chức, hành chính",
	  8: "Vướng mắc doanh nghiệp",
	  9: "Hàng hóa, tiêu dùng, dịch vụ",
	  10: "Phản hồi thông tin báo chí",
	  11: "Trẻ em, giáo dục",
	  12: "Các vấn đề khác",
  };
  return types[id] || "Tin báo khác";
};

export interface NewsData {
  title: string;
  thumbnail: string;
  content: string;
  images: string[];
}

export const addNews = async (data: NewsData): Promise<string | null> => {
  try {
    const newsCollection = collection(db, "news");
    const docRef = await addDoc(newsCollection, {
      ...data,
      createdAt: Timestamp.now(), // Thêm thời gian tạo
    });
    return docRef.id; // Trả về ID của document vừa tạo
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error adding news:", error);
    return null;
  }
};

export const updateNews = async (id: string, data: Partial<NewsData>): Promise<boolean> => {
  try {
    const newsDoc = doc(db, "news", id);
    await updateDoc(newsDoc, data);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating news:", error);
    return false;
  }
};

export const deleteNews = async (id: string): Promise<boolean> => {
  try {
    const newsDoc = doc(db, "news", id);
    await deleteDoc(newsDoc);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting news:", error);
    return false;
  }
};
export interface UpdateFeedbackParams {
  response: string;
}

export const updateFeedback = async (id: string, data: UpdateFeedbackParams): Promise<boolean> => {
  try {
    const feedbackDoc = doc(db, "feedbacks", id);
    await updateDoc(feedbackDoc, {
      ...data,
      responseTime: Timestamp.now(), // Tự động cập nhật thời gian trả lời
      status: "Đã xử lý", // Tự động cập nhật trạng thái
    });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating feedback:", error);
    return false;
  }
};