import React, { useEffect, useState } from 'react';
import {
  Input, Select, Button, Box, useSnackbar,
  DatePicker, Checkbox, Text, Icon,
} from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Question, QuestionType, TDPInfo } from '../../types/report';
import QuestionEditor from './components/QuestionEditor';
import { getUserRole } from '../../utils/auth';
import PageLayout from "@components/layout/PageLayout";

const CreateReportPage = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  
  const { user, tdpList, fetchTDPList, createReport, loading } = useStore(
    (state) => ({
      user: state.user,
      tdpList: state.tdpList,
      fetchTDPList: state.fetchTDPList,
      createReport: state.createReport,
      loading: state.loading,
    })
  );

  // ✅ Sử dụng getUserRole với fallback
  const userRole = getUserRole(user?.idByOA, user?.id);
  const canCreate = userRole === 'admin' || userRole === 'mod';

  useEffect(() => {
    if (user && canCreate) {
      fetchTDPList();
    }
  }, [user, canCreate]);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedTDPs, setSelectedTDPs] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: QuestionType.SHORT_ANSWER,
      isRequired: false,
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    setQuestions(
      questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };
  
  const handleTDPSelectionChange = (tdpId: string) => {
    setSelectedTDPs((prev) =>
      prev.includes(tdpId)
        ? prev.filter((id) => id !== tdpId)
        : [...prev, tdpId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate || selectedTDPs.length === 0 || questions.length === 0) {
      openSnackbar({ text: 'Vui lòng điền đầy đủ thông tin!', type: 'error' });
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        openSnackbar({ text: `Vui lòng nhập nội dung cho tất cả câu hỏi!`, type: 'error' });
        return;
      }
    }

    const assignedTDPInfos = tdpList.filter(tdp => selectedTDPs.includes(tdp.id));
    
    if (user) {
      await createReport({
        title,
        priority,
        dueDate: dueDate.getTime(),
        questions,
        assignedTDPs: assignedTDPInfos,
        assignedBy: {
            zaloId: user.id,
            name: user.name
        }
      });
      openSnackbar({ text: 'Tạo và giao báo cáo thành công!', type: 'success' });
      navigate(-1);
    }
  };

  return (
    <PageLayout title="Tạo Báo Cáo Mới" id="create-report">
      <Box className="flex-1 overflow-auto bg-gray-100 p-4">
        {!canCreate ? (
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
                    Can Create: {canCreate ? 'YES' : 'NO'}
                  </Text>
                </Box>
              )}
          </Box>
        ) : (
          <>
            <Box className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <Input label="Tiêu đề báo cáo" value={title} onChange={(e) => setTitle(e.target.value)} />
              <DatePicker
                label="Hạn nộp báo cáo"
                value={dueDate}
                onChange={setDueDate}
                placeholder="Chọn ngày"
              />
              <Select
                label="Mức độ ưu tiên"
                value={priority}
                onChange={(val) => {
                  if (val === 'low' || val === 'medium' || val === 'high') {
                    setPriority(val);
                  }
                }}
              >
                <Select.Option value="low" title="Thấp" />
                <Select.Option value="medium" title="Trung bình" />
                <Select.Option value="high" title="Cao" />
              </Select>
            </Box>

            <Box className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h2 className="text-lg font-semibold mb-2">Nội dung báo cáo</h2>
              {questions.map((q, index) => (
                  <QuestionEditor
                      key={q.id}
                      question={q}
                      index={index}
                      onChange={handleQuestionChange}
                      onRemove={handleRemoveQuestion}
                  />
              ))}
              <Button fullWidth variant="secondary" onClick={handleAddQuestion}>
                  + Thêm câu hỏi
              </Button>
            </Box>

            <Box className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h2 className="text-lg font-semibold mb-2">Giao cho Tổ dân phố</h2>
              <div className="max-h-48 overflow-y-auto">
              {tdpList.map((tdp) => (
                  <Checkbox
                      key={tdp.id}
                      value={tdp.id}
                      checked={selectedTDPs.includes(tdp.id)}
                      onChange={() => handleTDPSelectionChange(tdp.id)}
                  >
                      {tdp.name} ({tdp.leaderName})
                  </Checkbox>
              ))}
              </div>
            </Box>
          </>
        )}
      </Box>
      
      {canCreate && (
        <Box className="p-4 bg-white shadow-top">
          <Button fullWidth onClick={handleSubmit} loading={loading}>
            Tạo và Giao báo cáo
          </Button>
        </Box>
      )}
    </PageLayout>
  );
};

export default CreateReportPage;