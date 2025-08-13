import React, { FunctionComponent } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { List, Button, Icon, Text, Box } from "zmp-ui";

import { ImageIcon } from "@components/icons";
import { Utinity } from "@dts";
import WithItemClick from "./WithItemClick";

export interface ItemProps extends Utinity {
    name?: string;
    handleClickUtinity?: ({
        inDevelopment,
        path,
        phoneNumber,
        link,
    }: {
        inDevelopment?: boolean | undefined;
        path?: string | undefined;
        phoneNumber?: string | undefined;
        link?: string | undefined;
    }) => void;
}

const StyledListItem = styled(List.Item)`
    ${tw`px-0 py-3`}
    .zaui-list-item-content {
        display: flex;
        align-items: center;
    }
    .zaui-list-item-content {
        overflow: hidden;
    }
`;

const UtinityItem: FunctionComponent<ItemProps> = props => {
    const { iconSrc, label, name, handleClickUtinity } = props;

    const handleCallClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); 
        handleClickUtinity?.(props);
    };

    return (
        <StyledListItem prefix={<ImageIcon src={iconSrc} />}>
            {/* Bọc tất cả nội dung trong một Box */}
            <Box flex flexDirection="column" className="w-full">
                {/* Dòng 1: Chức danh */}
                <Text.Title size="small" className="font-semibold">{label}</Text.Title>
                
                {/* Dòng 2: Tên và nút Gọi */}
                <Box flex justifyContent="space-between" alignItems="center" className="mt-1">
                    <Text size="small" className="text-gray-500">{name}</Text>
                    <Button 
                        size="small" 
                        icon={<Icon icon="zi-call-solid" />}
                        onClick={handleCallClick}
                    >
                        Gọi
                    </Button>
                </Box>
            </Box>
        </StyledListItem>
    );
};

export default WithItemClick(UtinityItem);
