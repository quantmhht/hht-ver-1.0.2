// src/store/newsSlice.ts
import { StateCreator } from "zustand";
import { getNews } from "../service/services"; // ← Đảm bảo import đúng
import { News } from "@dts";

export interface NewsSlice {
  news: News[];
  loadingNews: boolean;
  getNews: (params?: { page?: number; limit?: number }) => Promise<void>;
}

export const createNewsSlice: StateCreator<NewsSlice> = (set) => ({
  news: [],
  loadingNews: true,
  getNews: async (params = {}) => {
    try {
      set({ loadingNews: true });
      const newsList = await getNews(params);
      set({ news: newsList, loadingNews: false });
    } catch (error) {
      console.error("Failed to fetch news:", error);
      set({ news: [], loadingNews: false });
    }
  },
});