    import { Divider } from "@components";
    import AppCheckbox from "@components/customized/Checkbox";
    import React from "react";
    import styled from "styled-components";
    import tw from "twin.macro";
    import { Box, Checkbox } from "zmp-ui";
    import { CheckboxGroupProps, CheckboxValueType } from "zmp-ui/checkbox";

    const Label = styled.div`
      ${tw`font-medium py-2`}
    `;
    const FeedbackGroup = styled(Checkbox.Group)`
      ${tw`flex flex-col gap-4 mt-2 text-[#767A7F]`}
    `;
    const FormItem = styled.div``;

    export interface SelectFeedbackTypeProps extends Omit<CheckboxGroupProps, "onChange" | "value"> {
      onChange?: (id: string) => void;
      value?: CheckboxValueType;
      readOnly?: boolean; // <-- Thêm dòng này

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
      readOnly,
    }) => {
      const onChangeType = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      };

      return (
        <FormItem>
          <Label>Mục phản ánh*</Label>
          <Box my={4}><Divider /></Box>
          <FeedbackGroup value={value ? [value] : []}>
            {feedbackTypes.map((type) => (
              <AppCheckbox
                onChange={onChangeType}
                value={type.id.toString()}
                key={`fb-type-${type.id}`}
                label={type.title}
                checked={value === type.id.toString()}
              />
            ))}
          </FeedbackGroup>
        </FormItem>
      );
    };

    export default SelectFeedbackType;
    