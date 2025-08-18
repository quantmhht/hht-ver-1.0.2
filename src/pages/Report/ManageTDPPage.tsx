import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { Box, Text, Button, Input, Modal, Icon, useSnackbar } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { TDPInfo } from "../../types/report";
import { getUserRole } from "../../utils/auth";
import PageLayout from "@components/layout/PageLayout";

const ManageTDPPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { user, tdpList, fetchTDPList, addTDP, updateTDP, deleteTDP, loading } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<TDPInfo>>({});
  const [selectedTDP, setSelectedTDP] = useState<TDPInfo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ Sử dụng getUserRole với fallback
  const userRole = getUserRole(user?.idByOA, user?.id);
  const canManage = userRole === 'admin' || userRole === 'mod';

  useEffect(() => {
    if (canManage) {
      fetchTDPList();
    }
  }, [canManage]);

  const handleInputChange = (field: keyof TDPInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    setIsEdit(false);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (tdp: TDPInfo) => {
    setIsEdit(true);
    setFormData(tdp);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.leaderName || !formData.leaderZaloId) {
      openSnackbar({ text: "Vui lòng điền đầy đủ thông tin bắt buộc.", type: "error" });
      return;
    }
    try {
      if (isEdit && formData.id) {
        await updateTDP(formData.id, formData);
        openSnackbar({ text: "Cập nhật TDP thành công!", type: "success" });
      } else {
        await addTDP(formData as Omit<TDPInfo, 'id'>);
        openSnackbar({ text: "Thêm TDP thành công!", type: "success" });
      }
      setShowModal(false);
    } catch {
      openSnackbar({ text: "Có lỗi xảy ra, vui lòng thử lại.", type: "error" });
    }
  };

  const openDeleteConfirm = (tdp: TDPInfo) => {
    setSelectedTDP(tdp);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (selectedTDP) {
      try {
        await deleteTDP(selectedTDP.id);
        openSnackbar({ text: "Xóa TDP thành công!", type: "success" });
        setShowDeleteModal(false);
        setSelectedTDP(null);
      } catch {
        openSnackbar({ text: "Lỗi khi xóa TDP.", type: "error" });
      }
    }
  };

  return (
    <PageLayout title="Quản lý Tổ dân phố" id="manage-tdp">
      <Box className="flex-1 overflow-auto bg-gray-100 p-4">
        {!canManage ? (
          <Box className="p-6 text-center bg-white rounded-lg shadow-sm">
            <Icon icon="zi-lock" size={48} className="text-red-500 mb-4" />
            <Text.Title size="normal" className="mb-2">
              Không có quyền truy cập
            </Text.Title>
            <Text className="text-gray-600">
              Chức năng này chỉ dành cho Quản trị viên và Điều hành viên.
            </Text>
            
            {/* ✅ Debug info trong development */}
            {import.meta.env.DEV && user && (
              <Box className="mt-4 p-3 bg-gray-100 rounded text-left">
                <Text size="xSmall" className="font-mono">
                  Debug Info:<br/>
                  User ID: {user.id || 'N/A'}<br/>
                  User idByOA: {user.idByOA || 'N/A'}<br/>
                  Detected Role: {userRole}<br/>
                  Can Manage: {canManage ? 'YES' : 'NO'}
                </Text>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <Button fullWidth onClick={handleAddNew} className="mb-4">
              <Icon icon="zi-plus" /> Thêm TDP mới
            </Button>
            {tdpList.map((tdp) => (
              <Box key={tdp.id} className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <Text.Title>{tdp.name}</Text.Title>
                <Text size="small" className="text-gray-600">
                  Tổ trưởng: {tdp.leaderName} ({tdp.leaderZaloId})
                </Text>
                <Box mt={2} className="flex justify-end space-x-2">
                  <Button size="small" variant="secondary" onClick={() => handleEdit(tdp)}>Sửa</Button>
                  <Button size="small" className="bg-red-500 text-white" onClick={() => openDeleteConfirm(tdp)}>Xóa</Button>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} title={isEdit ? "Chỉnh sửa TDP" : "Thêm TDP mới"} onClose={() => setShowModal(false)}>
        <Box p={4} className="space-y-4">
          <Input label="Tên TDP*" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
          <Input label="Tên Tổ trưởng*" value={formData.leaderName || ''} onChange={e => handleInputChange('leaderName', e.target.value)} />
          <Input label="Zalo ID Tổ trưởng*" value={formData.leaderZaloId || ''} onChange={e => handleInputChange('leaderZaloId', e.target.value)} />
          <Input label="SĐT Tổ trưởng" value={formData.leaderPhone || ''} onChange={e => handleInputChange('leaderPhone', e.target.value)} />
          <Button fullWidth loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu thay đổi" : "Thêm mới"}</Button>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} title="Xác nhận xóa" onClose={() => setShowDeleteModal(false)}>
        <Box p={4}>
          <Text>Bạn có chắc chắn muốn xóa TDP <strong>{selectedTDP?.name}</strong>? Hành động này không thể hoàn tác.</Text>
          <Box mt={4} className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
            <Button className="bg-red-500 text-white" loading={loading} onClick={handleDelete}>Xóa</Button>
          </Box>
        </Box>
      </Modal>
    </PageLayout>
  );
};

export default ManageTDPPage;