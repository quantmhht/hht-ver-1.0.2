import React, { FC } from "react";
import { Box, Text, Button } from "zmp-ui";
import { useStore } from "@store";
import { useNavigate } from "react-router-dom";
import { NewsList } from "./NewsList";
import { getUserRole } from "@utils/auth";
import styled from "styled-components";
import tw from "twin.macro";

const SectionContainer = styled(Box)`
  ${tw`bg-white p-4 mt-2`}
`;

export const NewsSection: FC = () => {
  const { news, loadingNews, user } = useStore();
  const navigate = useNavigate();
  
  // ✅ Sử dụng getUserRole với fallback thay vì check trực tiếp array
  const userRole = getUserRole(user?.idByOA, user?.id);
  const isAuthorized = userRole === 'admin' || userRole === 'mod';

  return (
    <SectionContainer>
      <Box flex justifyContent="space-between" alignItems="center">
        <Text.Title size="small">Tin tức</Text.Title>
        {isAuthorized && (
          <Button size="small" variant="tertiary" onClick={() => navigate("/manage-news")}>
            Quản lý
          </Button>
        )}
        
        {/* ✅ Debug info trong development */}
        {import.meta.env.DEV && user && (
          <Box className="ml-4">
            <Text size="xSmall" className="font-mono text-gray-500">
              Role: {userRole} | Auth: {isAuthorized ? 'YES' : 'NO'}
            </Text>
          </Box>
        )}
      </Box>
      <Box mt={4}>
        <NewsList news={news.slice(0, 5)} loading={loadingNews} />
      </Box>
      {news.length > 5 && (
        <Box mt={4} className="text-center">
          <Button
            size="small"
            variant="secondary"
            onClick={() => navigate("/news")}
          >
            Xem tất cả
          </Button>
        </Box>
      )}
    </SectionContainer>
  );
};