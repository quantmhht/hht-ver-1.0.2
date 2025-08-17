import React from 'react';
import { Box, Button, Input } from 'zmp-ui';
import { QuestionOption } from '../../../types/report';

interface OptionEditorProps {
  options: QuestionOption[];
  // Hàm callback này sẽ được gọi mỗi khi có thay đổi (thêm, sửa, xóa)
  onChange: (newOptions: QuestionOption[]) => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({ options, onChange }) => {
  // Hàm xử lý khi người dùng thay đổi nội dung của một lựa chọn
  const handleOptionTextChange = (optionId: string, newText: string) => {
    const updatedOptions = options.map((opt) =>
      opt.id === optionId ? { ...opt, value: newText } : opt
    );
    onChange(updatedOptions);
  };

  // Hàm thêm một lựa chọn mới
  const handleAddOption = () => {
    const newOption: QuestionOption = {
      id: Date.now().toString(), // Dùng timestamp làm ID tạm thời
      value: `Lựa chọn ${options.length + 1}`,
    };
    onChange([...options, newOption]);
  };

  // Hàm xóa một lựa chọn
  const handleRemoveOption = (optionId: string) => {
    const filteredOptions = options.filter((opt) => opt.id !== optionId);
    onChange(filteredOptions);
  };

  return (
    <Box mt={2} pl={4} className="border-l-2 border-gray-200">
      {options.map((option, index) => (
        <Box key={option.id} className="flex items-center space-x-2 mb-2">
          <span className="text-gray-500">{index + 1}.</span>
          <Input
            type="text"
            value={option.value}
            onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
            placeholder="Nội dung lựa chọn"
          />
          {/* Chỉ cho phép xóa khi có nhiều hơn 1 lựa chọn */}
          {options.length > 1 && (
            <Button
              size="small"
              variant="tertiary"
              onClick={() => handleRemoveOption(option.id)}
              className='text-red-500'
            >
              Xóa
            </Button>
          )}
        </Box>
      ))}
      <Button
        size="small"
        variant="secondary"
        onClick={handleAddOption}
      >
        Thêm lựa chọn
      </Button>
    </Box>
  );
};

export default OptionEditor;