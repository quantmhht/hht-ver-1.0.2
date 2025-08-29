// src/store/feedbackSlice.ts
import { Feedback, Feedbacks, FeedbackType } from "@dts";
import {
    createFeedback,
    getFeedbacks,
    getFeedbackDetail,
    getFeedbackTypes,
    getFeedbackTypeName,
    CreateFeedbackParams,
    GetFeedbacksParams,
    GetFeedbackTypeParams,
    updateFeedback 
} from "@service/services";
import { StateCreator } from "zustand";

// Interface cho form input
export interface CreateFeedbackFormParams {
    title: string;
    content: string;
    fullName: string;
    address: string;
    phoneNumber: string;
    feedBackTypeId: number; // ID số
    imageUrls: string[];
    location?: {latitude: string, longitude: string} | null; // <-- Thêm dòng này

}

export interface FeedbackSlice {
    creatingFeedback?: boolean;
    gettingFeedback?: boolean;
    gettingFeedbackType?: boolean;
    feedbacks?: Feedbacks;
    feedbackResult?: boolean;
    feedbackTypes?: FeedbackType[];
    feedbackDetail?: Feedback | null;
    createFeedback: (
        feedback: CreateFeedbackFormParams,
    ) => Promise<boolean>;
    getFeedbacks: (params: GetFeedbacksParams) => Promise<void>;
    getFeedbackTypes: (params: GetFeedbackTypeParams) => Promise<void>;
    getFeedback: (params: { id: string }) => Promise<void>;
    replyToFeedback: (id: string, response: string) => Promise<boolean>; // <-- Thêm dòng này

}

const feedbackSlice: StateCreator<FeedbackSlice> = (set, get) => ({
    creatingFeedback: false,
    gettingFeedback: false,
    gettingFeedbackType: false,
    feedbackDetail: null,

    createFeedback: async (
        feedback: CreateFeedbackFormParams,
    ) => {
        try {
            set(state => ({
                ...state,
                creatingFeedback: true,
            }));

            // Chuyển đổi dữ liệu form thành params cho Firebase
            const feedbackData: CreateFeedbackParams = {
                title: feedback.title,
                content: feedback.content,
                fullName: feedback.fullName,
                address: feedback.address,
                phoneNumber: feedback.phoneNumber,
                type: getFeedbackTypeName(feedback.feedBackTypeId), // Chuyển ID thành tên
                imageUrls: feedback.imageUrls,
                response: "",
                creationTime: new Date(),
                responseTime: null,
                location: feedback.location, // <-- Thêm dòng này

            };

            const rs = await createFeedback(feedbackData);

            set(state => ({
                ...state,
                feedbackResult: rs,
            }));
            return rs;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error creating feedback:", error);
            return false;
        } finally {
            set(state => ({
                ...state,
                creatingFeedback: false,
            }));
        }
    },

    getFeedbacks: async (params: GetFeedbacksParams) => {
        try {
            const { firstFetch = false } = params;

            set(state => ({
                ...state,
                gettingFeedback: true,
            }));

            const feedbackList = await getFeedbacks(params);
            
            // Chuyển đổi array thành format Feedbacks
            const feedbacks: Feedbacks = {
                feedbacks: feedbackList,
                total: feedbackList.length,
                page: params.page || 0,
                currentPageSize: feedbackList.length,
            };

            set(state => ({
                ...state,
                gettingFeedback: false,
                feedbacks: {
                    ...feedbacks,
                    feedbacks: firstFetch
                        ? feedbacks.feedbacks
                        : [
                              ...(state.feedbacks?.feedbacks || []),
                              ...feedbacks.feedbacks,
                          ],
                },
            }));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error getting feedbacks:", err);
            set(state => ({
                ...state,
                gettingFeedback: false,
            }));
        }
    },

    getFeedbackTypes: async (params: GetFeedbackTypeParams) => {
        try {
            set(state => ({
                ...state,
                gettingFeedbackType: true,
            }));
            const feedbackTypes = await getFeedbackTypes(params);
            set(state => ({
                ...state,
                gettingFeedbackType: false,
                feedbackTypes,
            }));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error getting feedback types:", err);
            set(state => ({
                ...state,
                gettingFeedbackType: false,
            }));
        }
    },

    getFeedback: async (params: { id: string }) => {
        try {
            const feedback = await getFeedbackDetail(params.id);
            set(state => ({ ...state, feedbackDetail: feedback }));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error getting feedback detail:", err);
        }
    },
     replyToFeedback: async (id: string, response: string) => {
        try {
            set({ creatingFeedback: true }); // Tái sử dụng state loading
            const success = await updateFeedback(id, { response });
            if (success) {
                // Tải lại chi tiết phản ánh để cập nhật giao diện
                await get().getFeedback({ id });
            }
            return success;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error replying to feedback:", error);
            return false;
        } finally {
            set({ creatingFeedback: false });
        }
    },
});

export default feedbackSlice;