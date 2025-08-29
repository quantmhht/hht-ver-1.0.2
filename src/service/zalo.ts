import {
    getUserInfo,
    getAccessToken,
    followOA,
    openWebview,
    openMediaPicker,
    saveImageToGallery,
    getLocation
} from "zmp-sdk";
import { User } from "@dts";
import { ImageType } from "zmp-ui/image-viewer";
import { API } from "@constants/common"; // Import API constant

// Loại bỏ các import không cần thiết của Firebase ở đây

export const getZaloUserInfo = async (): Promise<User> => {
    try {
        const user = await getUserInfo({ avatarType: "normal" });
        const { userInfo } = user;
        return Promise.resolve(userInfo);
    } catch (err) {
        return Promise.reject(err);
    }
};

export const getToken = async (): Promise<string> => {
    try {
        const token = (await getAccessToken({})) || "ACCESS_TOKEN";
        return Promise.resolve(token);
    } catch (err) {
        return Promise.reject(err);
    }
};

export const followOfficialAccount = async ({ id }: { id: string }): Promise<void> => {
    try {
        await followOA({ id });
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
};

export const openWebView = async (link: string): Promise<void> => {
    try {
        await openWebview({ url: link });
        return Promise.resolve();
    } catch (err) {
        throw err;
    }
};

export const saveImage = async (img: string): Promise<void> => {
    try {
        await saveImageToGallery({ imageBase64Data: img });
        return Promise.resolve();
    } catch (err) {
        throw err;
    }
};

export interface PickImageParams {
    maxItemSize?: number;
    maxSelectItem?: number;
    // serverUploadUrl không còn cần thiết ở đây nữa
}

export interface UploadImageResponse {
    domain: string;
    images: string[];
}

// Hàm pickImages được sửa lại để sử dụng serverUploadUrl từ API constant
export const pickImages = async (
    params: PickImageParams,
): Promise<(ImageType & { name: string })[]> => {
    try {
        const res = await openMediaPicker({
            type: "photo",
            maxItemSize: params.maxItemSize || 1024 * 1024,
            maxSelectItem: params.maxSelectItem || 1,
            serverUploadUrl: API.UPLOAD_IMAGE,
        });

        const { data } = res;
        // Nếu data rỗng hoặc không phải là chuỗi JSON hợp lệ, trả về mảng rỗng
        if (!data || typeof data !== 'string') {
            // eslint-disable-next-line no-console
            console.log("Người dùng đã hủy hoặc không có dữ liệu trả về.");
            return [];
        }

        const result = JSON.parse(data);
        if (result.err !== 0) {
            // Ném lỗi nếu server trả về lỗi, để catch block bên dưới xử lý
            throw new Error(result.message || "Lỗi upload ảnh từ server");
        }

        const { domain, images } = result.data as UploadImageResponse;
        const uploadedImgUrls = images.map(img => ({
            src: domain + img,
            name: img,
        }));
        return uploadedImgUrls;

    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Lỗi khi chọn hoặc tải ảnh:", err);
        // Quan trọng: Trả về mảng rỗng khi có bất kỳ lỗi nào xảy ra
        // (bao gồm cả trường hợp người dùng nhấn nút 'Hủy')
        return [];
    }
};
export const getZaloLocation = async (): Promise<{latitude: string, longitude: string} | null> => {
  try {
    const { latitude, longitude } = await getLocation({
      fail: (err) => {
        // eslint-disable-next-line no-console
        console.error("Lỗi khi lấy vị trí:", err);
      },
    });

    if (latitude && longitude) {
      return { latitude: latitude.toString(), longitude: longitude.toString() };
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Lỗi khi gọi API getLocation:", error);
    return null;
  }
};