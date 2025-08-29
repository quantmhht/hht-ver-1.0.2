import React, { useState, useEffect } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Box, Radio, Modal, Text, Icon } from "zmp-ui";
import { RadioGroupProps, RadioValueType } from "zmp-ui/radio";
import { TDP_LIST } from "@constants/utinities";

const Label = styled.div`
  ${tw`font-medium py-2`}
`;

const AddressGroup = styled(Radio.Group)`
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

export interface SelectAddressProps extends Omit<RadioGroupProps, "onChange" | "value"> {
  onChange?: (address: string) => void;
  value?: RadioValueType;
}

const SelectAddress: React.FC<SelectAddressProps> = ({
  onChange,
  value,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState<RadioValueType>(value);
  
  // Đồng bộ tempValue khi value thay đổi từ bên ngoài
  useEffect(() => {
    setTempValue(value);
  }, [value]);
  
  const handleConfirm = () => {
    onChange?.(tempValue as string);
    setModalVisible(false);
  };
  
  const handleCancel = () => {
    setTempValue(value);
    setModalVisible(false);
  };
  
  const onChangeAddress = (selectedValue: RadioValueType) => {
    setTempValue(selectedValue);
  };

  return (
    <FormItem>
      <Label>Địa chỉ</Label>
      <Box my={2}>
        <SelectButton onClick={() => setModalVisible(true)}>
          {value ? (
            <SelectedText>{value}</SelectedText>
          ) : (
            <PlaceholderText>Chọn TDP...</PlaceholderText>
          )}
          <Icon icon="zi-chevron-right" />
        </SelectButton>
      </Box>
      
      <Modal
        visible={modalVisible}
        onClose={handleCancel}
        title="Chọn TDP"
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
          <AddressGroup value={tempValue} onChange={onChangeAddress}>
            {TDP_LIST.map((tdp) => (
              <Radio
                value={tdp}
                key={`tdp-${tdp}`}
                label={tdp}
              />
            ))}
          </AddressGroup>
        </Box>
      </Modal>
    </FormItem>
  );
};

export default SelectAddress;