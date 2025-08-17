import React from 'react';
import { Box, Button, Input, Select, Switch } from 'zmp-ui';
import { Question, QuestionType } from '../../../types/report';
import OptionEditor from './OptionEditor';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onChange: (updatedQuestion: Question) => void;
  onRemove: (questionId: string) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, index, onChange, onRemove }) => {

  // Hàm xử lý khi có thay đổi trong component con
  const handleFieldChange = (field: keyof Question, value: any) => {
    const updatedQuestion = { ...question, [field]: value };

    // Logic tự động thêm option khi đổi sang câu hỏi trắc nghiệm
    if (field === 'type') {
      const newType = value as QuestionType;
      if ((newType === QuestionType.SINGLE_CHOICE || newType === QuestionType.MULTIPLE_CHOICE) && !question.options?.length) {
        updatedQuestion.options = [{ id: Date.now().toString(), value: 'Lựa chọn 1' }];
      }
    }
    
    onChange(updatedQuestion);
  };

  return (
    <Box className="bg-white p-4 my-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-lg font-bold text-gray-700">Câu hỏi {index + 1}</span>
        <Button size="small" variant="tertiary" className="text-red-500" onClick={() => onRemove(question.id)}>
          Xóa câu hỏi
        </Button>
      </div>

      {/* Input cho nội dung câu hỏi */}
      <Input.TextArea
        value={question.text}
        // SỬA LỖI: Cập nhật trực tiếp và lấy e.target.value
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('text', e.target.value)}
        placeholder="Nhập nội dung câu hỏi của bạn..."
        className="my-2"
        rows={2}
      />

      <div className="flex items-center justify-between mt-2">
        {/* Dropdown chọn loại câu hỏi */}
        <Select
          label="Loại câu hỏi"
          value={question.type}
          // SỬA LỖI: Cập nhật với `value` nhận được
          onChange={(value) => handleFieldChange('type', value)}
        >
          <Select.Option value={QuestionType.SHORT_ANSWER} title="Trả lời ngắn" />
          <Select.Option value={QuestionType.SINGLE_CHOICE} title="Trắc nghiệm (chọn 1)" />
          <Select.Option value={QuestionType.MULTIPLE_CHOICE} title="Trắc nghiệm (chọn nhiều)" />
        </Select>

        {/* Toggle cho câu hỏi bắt buộc */}
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-600">Bắt buộc</label>
          <Switch 
            checked={question.isRequired} 
            onChange={(checked) => handleFieldChange('isRequired', checked)} 
          />
        </div>
      </div>
      
      {/* Hiển thị editor cho các lựa chọn nếu là câu hỏi trắc nghiệm */}
      {(question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) && (
        <OptionEditor
          options={question.options || []}
          onChange={(newOptions) => handleFieldChange('options', newOptions)}
        />
      )}
    </Box>
  );
};

export default QuestionEditor;