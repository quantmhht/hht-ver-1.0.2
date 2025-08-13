import React, { useEffect } from "react";
import { HomeHeader, Utinities, NewsSection } from "@components";
import PageLayout from "@components/layout/PageLayout";
import { APP_UTINITIES } from "@constants/utinities";
import { useStore } from "@store";
import { Text, Button, Box } from "zmp-ui";
import { getUserRole } from "@utils/auth";

const RoleSwitcher = () => {
    const { loginAs, currentUser } = useStore((state) => ({
        loginAs: state.loginAs,
        currentUser: state.user,
    }));

    // Chỉ hiển thị khi chạy ở localhost
    if (!import.meta.env.DEV) {
        return null;
    }

    const roles: ("admin" | "mod" | "leader" | "citizen")[] = ["admin", "mod", "leader", "citizen"];
    const currentRole = getUserRole(currentUser?.idByOA);

    return (
        <Box p={4} className="bg-yellow-100 border-b-2 border-yellow-300">
            <Text.Title size="small">Bảng điều khiển DEV</Text.Title>
            <Text size="xSmall" className="text-gray-600 mb-2">
                Vai trò hiện tại: <span className="font-bold">{currentRole}</span>
            </Text>
            <Box flex className="gap-2 flex-wrap">
                {roles.map((role) => (
                    <Button
                        key={role}
                        size="small"
                        variant={currentRole === role ? "primary" : "secondary"}
                        onClick={() => loginAs(role)}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};
const HomePage: React.FunctionComponent = () => {
  const { organization, getNews } = useStore((state) => ({
    organization: state.organization,
    getNews: state.getNews,
  }));

  useEffect(() => {
    getNews();
  }, [getNews]);

  return (
    <PageLayout
      id="home-page"
      customHeader={
        <HomeHeader
          title="UBND Phường Hà Huy Tập"
          name={organization?.name || "Tỉnh Hà Tĩnh"}
        />
      }
    >
      <RoleSwitcher /> {/* Giữ lại bảng điều khiển DEV nếu bạn vẫn cần */}
      <Utinities utinities={APP_UTINITIES} />
      <NewsSection />
    </PageLayout>
  );
};

export default HomePage;