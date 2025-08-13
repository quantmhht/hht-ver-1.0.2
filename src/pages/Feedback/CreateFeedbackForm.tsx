import { Button, Divider, ImageUpload, TextArea, Input } from "@components";
import { MAX_FEEDBACK_IMAGES } from "@constants/common";
import { AppError } from "@dts";
import { useStore } from "@store";
import React, { useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Box, Icon, Select, Text, useSnackbar } from "zmp-ui";
import { ImageType } from "zmp-ui/image-viewer";
import { useForm, Controller } from "react-hook-form";
import SelectFeedbackType from "./SelectFeedbackType";
import { useLocation } from "react-router-dom";
import { TDP_LIST } from "@constants/utinities";
import { getZaloLocation } from "@service/zalo";

const Conainer = styled(Box)`
  ${tw`bg-white`}
`;
const SendButton = styled(Button)`
  ${tw`w-full mt-6`}
`;
const Label = styled.label`
  ${tw`block text-sm font-medium text-gray-700 mb-1`}
`;

// Kiểu dữ liệu cho form đã được cập nhật
export type FeedbackFormData = {
  fullName: string;
  address: string;
  phoneNumber: string;
  content: string;
  feedbackType: string;
};

export interface CreateFeedbackFormProps {
  successCallback?: (status?: boolean) => void;
}

const CreateFeedbackForm: React.FC<CreateFeedbackFormProps> = ({
  successCallback,
}) => {
  const location = useLocation();
  const preselectedCategory = location.state?.category;
  const { openSnackbar } = useSnackbar();

  const [loading, createFeedback, setError] = useStore((state) => [
    state.creatingFeedback,
    state.createFeedback,
    state.setError,
  ]);

  const [imageUrls, setImageUrls] = useState<(ImageType & { name: string })[]>([]);
  const [locationData, setLocationData] = useState<{latitude: string, longitude: string} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      address: "",
      phoneNumber: "",
      content: "",
      feedbackType: preselectedCategory?.id.toString() || "",
    },
  });

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const coordinates = await getZaloLocation();
      if (coordinates) {
        setLocationData(coordinates);
        openSnackbar({
          text: "Lấy vị trí thành công!",
          type: "success",
        });
      } else {
        openSnackbar({
          text: "Không thể lấy được vị trí. Vui lòng thử lại.",
          type: "error",
        });
      }
    } finally {
      setGettingLocation(false);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    // Bỏ validation cho các trường không bắt buộc
    if (!data.content || !data.feedbackType) {
      setError({
        message: "Vui lòng điền đầy đủ nội dung và chọn loại phản ánh.",
      });
      return;
    }

    try {
      const feedbackData = {
        title: `Phản ánh từ ${data.fullName || 'Người dân'}`,
        content: data.content,
        fullName: data.fullName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        feedBackTypeId: Number(data.feedbackType),
        imageUrls: imageUrls.map((img) => img.src), // Gửi URL đầy đủ
        location: locationData,
      };

      const status = await createFeedback(feedbackData);
      successCallback?.(status);
    } catch (err) {
      setError({
        message: (err as Error).message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  return (
    <Conainer p={4} m={0}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          <Input
            label="Họ và Tên"
            {...register("fullName")}
          />
        </Box>
        <Box mt={4}>
          <Label>Địa chỉ</Label>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              >
                <option value="" disabled>
                  Chọn TDP...
                </option>
                {TDP_LIST.map((tdp) => (
                  <option key={tdp} value={tdp}>
                    {tdp}
                  </option>
                ))}
              </Select>
            )}
          />
        </Box>
        <Box mt={4}>
          <Input
            label="Số điện thoại"
            {...register("phoneNumber")}
          />
        </Box>
        <Box my={4}><Divider /></Box>
        <Box>
          <TextArea
            placeholder="Nhập nội dung"
            label="Nội dung phản ánh*"
            errorText={errors.content ? "Nội dung không được để trống" : ""}
            {...register("content", { required: true })}
            status={errors.content ? "error" : "default"}
          />
        </Box>
        <Box my={4}><Divider /></Box>
        <Controller
          name="feedbackType"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectFeedbackType
              value={field.value}
              onChange={field.onChange}
              readOnly
            />
          )}
        />
        {errors.feedbackType && (
          <Text size="xSmall" className="text-red-500 mt-1">Vui lòng chọn loại tin báo</Text>
        )}
        <Box my={4}><Divider /></Box>
        <Box>
    <Text.Title size="small" className="mb-2">Vị trí phản ánh</Text.Title>
    <Button
        variant="secondary"
        fullWidth
        onClick={handleGetLocation}
        loading={gettingLocation}
        icon={<Icon icon="zi-location-solid" />}
    >
        Lấy vị trí hiện tại
    </Button>

    {/* --- BẮT ĐẦU MÃ NGUỒN MỚI: HIỂN THỊ BẢN ĐỒ --- */}
    {locationData && (
        <Box className="mt-4">
            <iframe
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: '8px' }}
                loading="lazy"
                allowFullScreen
              src={`https://maps.google.com/maps?q=${locationData.latitude},${locationData.longitude}&z=17&output=embed`}
            >
            </iframe>
            <Text size="xSmall" className="text-gray-500 mt-2 text-center">
                Vị trí đã ghi nhận: {locationData.latitude}, {locationData.longitude}
            </Text>
        </Box>
    )}
    {/* --- KẾT THÚC MÃ NGUỒN MỚI --- */}
</Box>
        <Box my={4}><Divider /></Box>
        <Box>
          <ImageUpload
            label="Ảnh đính kèm"
            onImagesChange={(imgs) => setImageUrls(imgs)}
            maxSelect={MAX_FEEDBACK_IMAGES}
          />
        </Box>
        <SendButton
          loading={loading}
          htmlType="submit"
          suffixIcon={<Icon icon="zi-chevron-right" />}
        >
          Gửi phản ánh
        </SendButton>
      </form>
    </Conainer>
  );
};

export default CreateFeedbackForm;