import React, { useState, useEffect } from "react";
import { PageLayout } from "@components";
import { useStore } from "@store";
import {
  Box,
  Text,
  Button,
  List,
  Modal,
  Input,
  Icon,
  useSnackbar,
} from "zmp-ui";
import styled from "styled-components";
import tw from "twin.macro";
import { News } from "@dts";
import { NewsData } from "../../service/services"; // Import NewsData

const NewsItemContainer = styled(List.Item)`
  ${tw`items-start`}
  .zaui-list-item-title {
    ${tw`font-semibold mb-1`}
  }
  .zaui-list-item-subtitle {
    ${tw`text-gray-500 text-xs`}
  }
`;

const Thumbnail = styled.img`
  ${tw`w-20 h-20 object-cover rounded-lg flex-shrink-0`}
`;

const ModalContent = styled.div`
  ${tw`space-y-4 p-2 max-h-[70vh] overflow-y-auto`}
`;

const NewsManagementPage: React.FC = () => {
  const {
    news,
    loadingNews,
    getNews,
    addNews,
    updateNews,
    deleteNews,
  } = useStore();
  const { openSnackbar } = useSnackbar();

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<NewsData>({
    title: "",
    thumbnail: "",
    content: "",
    images: [],
  });
  const [imageInput, setImageInput] = useState("");

  useEffect(() => {
    getNews();
  }, []);

  const handleInputChange = (field: keyof NewsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    if (imageInput && !formData.images.includes(imageInput)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput],
      }));
      setImageInput("");
    }
  };

  const handleRemoveImage = (imgToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imgToRemove),
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedNews(null);
    setFormData({ title: "", thumbnail: "", content: "", images: [] });
    setModalVisible(true);
  };

  const openEditModal = (article: News) => {
    setIsEditing(true);
    setSelectedNews(article);
    setFormData({
      title: article.title,
      thumbnail: article.thumbnail,
      content: article.content,
      images: article.images || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteNews(id);
    if (success) {
      openSnackbar({ text: "Xóa tin tức thành công!", type: "success" });
    } else {
      openSnackbar({ text: "Xóa tin tức thất bại!", type: "error" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.thumbnail) {
      openSnackbar({ text: "Vui lòng điền đầy đủ thông tin!", type: "error" });
      return;
    }

    let success = false;
    if (isEditing && selectedNews) {
      success = await updateNews(selectedNews.id.toString(), formData);
    } else {
      success = await addNews(formData);
    }

    if (success) {
      openSnackbar({
        text: isEditing
          ? "Cập nhật thành công!"
          : "Thêm mới thành công!",
        type: "success",
      });
      setModalVisible(false);
    } else {
      openSnackbar({
        text: isEditing ? "Cập nhật thất bại!" : "Thêm mới thất bại!",
        type: "error",
      });
    }
  };

  return (
    <PageLayout title="Quản lý Tin tức" showBackIcon>
      <Box p={4}>
        <Button onClick={openAddModal} fullWidth>
          <Icon icon="zi-plus" /> Thêm tin tức mới
        </Button>
      </Box>

      <List>
        {loadingNews ? (
          <Text className="text-center p-4">Đang tải danh sách...</Text>
        ) : (
          news.map((article) => (
            <NewsItemContainer
              key={article.id}
              prefix={<Thumbnail src={article.thumbnail} />}
              title={article.title}
            >
              <Text size="xSmall" className="text-gray-500 truncate">{article.content}</Text>
              <Box className="flex space-x-2 mt-2" />
              <Box className="flex space-x-2 mt-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => openEditModal(article)}
                >
                  Sửa
                </Button>
                <Button
                  size="small"
                  variant="tertiary"
                  className="bg-red-100 text-red-700"
                  onClick={() => handleDelete(article.id.toString())}
                >
                  Xóa
                </Button>
              </Box>
            </NewsItemContainer>
          ))
        )}
      </List>

      <Modal
        visible={modalVisible}
        title={isEditing ? "Chỉnh sửa tin tức" : "Thêm tin tức mới"}
        onClose={() => setModalVisible(false)}
        actions={[
          { text: "Hủy", close: true },
          { text: "Lưu", highLight: true, onClick: handleSubmit },
        ]}
      >
        <ModalContent>
          <Input
            label="Tiêu đề*"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
          <Input
            label="URL ảnh bìa (thumbnail)*"
            value={formData.thumbnail}
            onChange={(e) => handleInputChange("thumbnail", e.target.value)}
          />
          <Input.TextArea
            label="Nội dung*"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            rows={5}
          />
          <Box>
            <Text.Title size="small">Hình ảnh chi tiết</Text.Title>
            <Box className="flex items-center space-x-2 mt-2">
              <Input
                placeholder="Dán URL hình ảnh..."
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddImage} icon={<Icon icon="zi-plus" />} />
            </Box>
            <Box className="mt-2 space-y-2">
              {formData.images.map((img) => (
                <Box
                  key={img}
                  className="flex items-center justify-between p-2 bg-gray-100 rounded"
                >
                  <Text className="truncate text-xs">{img}</Text>
                  <Box onClick={() => handleRemoveImage(img)}> {/* Sửa ở đây */}
                    <Icon
                    icon="zi-close"
                    className="cursor-pointer text-red-500"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default NewsManagementPage;