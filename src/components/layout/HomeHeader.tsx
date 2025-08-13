import { TextItemSkeleton } from "@components/skeleton";
import { useStore } from "@store";
import React, { FC } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { Box, Text } from "zmp-ui";
import Logo from "@assets/logo.png";
import Background from "@assets/header-background.png";

const HeaderContainer = styled.div`
  ${tw`fixed top-0 left-0 w-full flex items-center p-4 gap-4`}
  z-index: 10;
  /* Chiều cao 96px (h-24) + chiều cao của status bar */
  height: calc(60px + var(--zaui-safe-area-inset-top, 0px));
  /* Đẩy nội dung bên trong header xuống để không bị che bởi status bar */
  padding-top: calc(1rem + var(--zaui-safe-area-inset-top, 0px));
  background: url(${Background});
  background-size: cover;
  background-position: center;
`;
const LogoWrapper = styled.div`
  ${tw`w-12 h-12 rounded-full overflow-hidden flex-shrink-0`}
`;
const Title = styled(Text.Title)`
  ${tw`text-red-800 text-lg font-bold`}
`;
const StyledText = styled(Text)`
  ${tw`text-black opacity-80`}
`;

export interface HomeHeaderProps {
  title?: string;
  name?: string;
}

const HomeHeader: FC<HomeHeaderProps> = (props) => {
  const { name } = props;
  // Sửa lỗi: Lấy trực tiếp `loading` state từ store
   const { loading } = useStore((state) => ({
    loading: (state.organization as any)?.loading || false
}));

  return (
    <HeaderContainer>
      <LogoWrapper>
        <img src={Logo} alt="UBND Phường Hà Huy Tập" />
      </LogoWrapper>
      <Box flex flexDirection="column">
        <Title>UBND Phường Hà Huy Tập</Title>
        {loading ? (
          <TextItemSkeleton
            color="rgba(255,255,255,0.2)"
            height={16}
            width={180}
          />
        ) : (
          <StyledText>{name || "Tỉnh Hà Tĩnh"}</StyledText>
        )}
      </Box>
    </HeaderContainer>
  );
};

export default HomeHeader;
