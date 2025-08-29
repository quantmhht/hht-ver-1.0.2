    import React, { useState, useEffect } from "react";
    import styled from "styled-components";
    import tw from "twin.macro";
    import { Box, Radio, Modal, Text, Icon } from "zmp-ui";
    import { RadioGroupProps, RadioValueType } from "zmp-ui/radio";

    const Label = styled.div`
      ${tw`font-medium py-2`}
    `;
    const FeedbackGroup = styled(Radio.Group)`
      ${tw`flex flex-col gap-4 mt-2 text-[#767A7F]`}
    `;
    const FormItem = styled.div``;
    
    const SelectButton = styled.div`
      ${tw`border border-gray-300 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors min-h-[56px]`}
    `;
    
    const SelectedText = styled(Text)`
      ${tw`flex-1`}
    `;
    
    const PlaceholderText = styled(Text)`
      ${tw`flex-1 text-gray-400`}
    `;

    export interface SelectFeedbackTypeProps extends Omit<RadioGroupProps, "onChange" | "value"> {
      onChange?: (id: string) => void;
      value?: RadioValueType;
    }

    const feedbackTypes = [
      { id: 1, title: "An ninh trật tự đô thị" },
      { id: 2, title: "An toàn giao thông" },
      { id: 3, title: "Hạ tầng đô thị, đất đai, xây dựng" },
      { id: 4, title: "Ô nhiễm môi trường" },
      { id: 5, title: "An toàn thực phẩm" },
      { id: 6, title: "Y tế, sức khỏe" },
      { id: 7, title: "Công vụ, công chức, hành chính" },
      { id: 8, title: "Vướng mắc doanh nghiệp" },
      { id: 9, title: "Hàng hóa, tiêu dùng, dịch vụ" },
      { id: 10, title: "Phản hồi thông tin báo chí" },
      { id: 11, title: "Trẻ em, giáo dục" },
      { id: 12, title: "Các vấn đề khác" },
    ];

    const SelectFeedbackType: React.FC<SelectFeedbackTypeProps> = ({
      onChange,
      value,
    }) => {
      const [modalVisible, setModalVisible] = useState(false);
      const [tempValue, setTempValue] = useState<RadioValueType>(value);
      
      // Đồng bộ tempValue khi value thay đổi từ bên ngoài
      useEffect(() => {
        setTempValue(value);
      }, [value]);
      
      const selectedType = feedbackTypes.find(type => type.id.toString() === value);
      
      const handleConfirm = () => {
        onChange?.(tempValue as string);
        setModalVisible(false);
      };
      
      const handleCancel = () => {
        setTempValue(value);
        setModalVisible(false);
      };
      
      const onChangeType = (selectedValue: RadioValueType) => {
        setTempValue(selectedValue);
      };

      return (
        <FormItem>
          <Label>Mục phản ánh*</Label>
          <Box my={2}>
            <SelectButton onClick={() => setModalVisible(true)}>
              {selectedType ? (
                <SelectedText>{selectedType.title}</SelectedText>
              ) : (
                <PlaceholderText>Chọn mục phản ánh...</PlaceholderText>
              )}
              <Icon icon="zi-chevron-right" />
            </SelectButton>
          </Box>
          
          <Modal
            visible={modalVisible}
            onClose={handleCancel}
            title="Chọn mục phản ánh"
            actions={[
              {
                text: "Hủy",
                close: true,
                onClick: handleCancel,
              },
              {
                text: "Xác nhận",
                highLight: true,
                onClick: handleConfirm,
              },
            ]}
          >
            <Box p={4}>
              <FeedbackGroup value={tempValue} onChange={onChangeType}>
                {feedbackTypes.map((type) => (
                  <Radio
                    value={type.id.toString()}
                    key={`fb-type-${type.id}`}
                    label={type.title}
                  />
                ))}
              </FeedbackGroup>
            </Box>
          </Modal>
        </FormItem>
      );
    };

    export default SelectFeedbackType;
    