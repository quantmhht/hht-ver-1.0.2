// src/store/newsSlice.ts
import { StateCreator } from "zustand";
import {   
  getNews as getNewsService, 
  addNews as addNewsService,
  updateNews as updateNewsService,
  deleteNews as deleteNewsService,
  NewsData } from "../service/services"; // ← Đảm bảo import đúng
import { News } from "@dts";
import { State } from "./index";


export interface NewsSlice {
  news: News[];
  loadingNews: boolean;
  getNews: (params?: { page?: number; limit?: number }) => Promise<void>;
  addNews: (data: NewsData) => Promise<boolean>;
  updateNews: (id: string, data: Partial<NewsData>) => Promise<boolean>;
  deleteNews: (id: string) => Promise<boolean>;
}

export const createNewsSlice: StateCreator<State, [], [], NewsSlice> = (set, get) => ({
  news: [],
  loadingNews: true,
  getNews: async (params = {}) => {
    try {
      set({ loadingNews: true });
      const newsList = await getNewsService(params);
      set({ news: newsList, loadingNews: false });
    } catch (error) {
      console.error("Failed to fetch news:", error);
      set({ news: [], loadingNews: false });
    }
  },
  
  addNews: async (data: NewsData) => {
    try {
      const newId = await addNewsService(data);
      if (newId) {
        await get().getNews(); // Tải lại danh sách tin tức
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add news:", error);
      return false;
    }
  },

  updateNews: async (id: string, data: Partial<NewsData>) => {
    try {
      const success = await updateNewsService(id, data);
      if (success) {
        await get().getNews(); // Tải lại danh sách tin tức
      }
      return success;
    } catch (error) {
      console.error("Failed to update news:", error);
      return false;
    }
  },

  deleteNews: async (id: string) => {
    try {
      const success = await deleteNewsService(id);
      if (success) {
        // Xóa tin tức khỏi state cục bộ để giao diện cập nhật ngay lập tức
        set(state => ({
          news: state.news.filter(item => item.id.toString() !== id)
        }));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete news:", error);
      return false;
    }
  },
});