import React, { useEffect, useState } from "react";
import { HomeHeader, Utinities, NewsSection } from "@components";
import PageLayout from "@components/layout/PageLayout";
import { APP_UTINITIES } from "@constants/utinities";
import { useStore } from "@store";
import { Text, Button, Box, Modal, List, Icon } from "zmp-ui";
import { getUserRole } from "@utils/auth";
import { useNavigate } from "react-router-dom";
import { openPhone } from "zmp-sdk";

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
    // ✅ Sử dụng getUserRole với fallback
    const currentRole = getUserRole(currentUser?.idByOA, currentUser?.id);

    return (
        <Box p={4} className="bg-yellow-100 border-b-2 border-yellow-300">
            <Text.Title size="small">Bảng điều khiển DEV</Text.Title>
            <Text size="xSmall" className="text-gray-600 mb-2">
                Vai trò hiện tại: <span className="font-bold">{currentRole}</span>
                {currentUser?.name && (
                    <span className="ml-2">({currentUser.name})</span>
                )}
            </Text>
            {/* ✅ Hiển thị ID để debug */}
            <Text size="xSmall" className="text-gray-500 mb-2">
                IDs: idByOA={currentUser?.idByOA}, id={currentUser?.id}
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
  const navigate = useNavigate();
  const { organization, getNews } = useStore((state) => ({
    organization: state.organization,
    getNews: state.getNews,
  }));

  // State cho Directory Modal
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);

  // Danh sách số điện thoại chuyên môn
  const directoryOptions = [
    {
      key: "security",
      title: "SĐT tiếp nhận thông tin về an ninh",
      phoneNumber: "0914537789",
    },
    {
      key: "construction",
      title: "SĐT tiếp nhận thông tin về xây dựng, đất đai", 
      phoneNumber: "0919654433",
    },
    {
      key: "culture",
      title: "SĐT tiếp nhận thông tin về văn hóa, xã hội",
      phoneNumber: "0945386703", 
    },
    {
      key: "administration",
      title: "SĐT tiếp nhận thông tin về hành chính công",
      phoneNumber: "0931372255",
    },
    {
      key: "directory_page",
      title: "Danh bạ phường Hà Huy Tập",
      phoneNumber: null,
    }
  ];

  // Hàm xử lý click vào item directory
  const handleDirectoryClick = () => {
    setDirectoryModalVisible(true);
  };

  // Hàm xử lý click vào từng option trong modal
  const handleDirectoryOptionClick = (option: {
    key: string;
    title: string;
    phoneNumber: string | null;
    icon: React.ReactElement;
  }) => {
    setDirectoryModalVisible(false);
    
    if (option.phoneNumber) {
      // Gọi điện thoại
      try {
        openPhone({
          phoneNumber: option.phoneNumber,
          success: () => {
            // eslint-disable-next-line no-console
            console.log(`Gọi thành công đến ${option.phoneNumber}`);
          },
          fail: (error) => {
            // eslint-disable-next-line no-console
            console.error("Lỗi khi gọi điện:", error);
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Lỗi khi thực hiện cuộc gọi:", error);
      }
    } else {
      // Chuyển đến trang danh bạ lãnh đạo phường
      navigate("/directory");
    }
  };

  // Tùy chỉnh APP_UTINITIES với handler onClick cho directory
  const customUtinities = APP_UTINITIES.map(utility => {
    if (utility.key === "directory") {
      return {
        ...utility,
        onClick: handleDirectoryClick
      };
    }
    return utility;
  });

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
      <RoleSwitcher />
      <Utinities utinities={customUtinities} />
      <NewsSection />

      {/* Directory Modal */}
      <Modal
        visible={directoryModalVisible}
        title="Danh bạ liên hệ"
        onClose={() => setDirectoryModalVisible(false)}
      >
        <List>
          {directoryOptions.map((option) => (
            <List.Item
              key={option.key}
              title={option.title}
              subTitle={option.phoneNumber || "Xem danh sách lãnh đạo phường"}
              prefix={option.icon}
              suffix={
                option.phoneNumber ? (
                  <Icon icon="zi-call" className="text-blue-600" />
                ) : (
                  <Icon icon="zi-chevron-right" className="text-gray-400" />
                )
              }
              onClick={() => handleDirectoryOptionClick(option)}
            />
          ))}
        </List>
        
        <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text size="xSmall" className="text-blue-700">
            💡 <strong>Ghi chú:</strong> Nhấn vào số điện thoại để gọi trực tiếp. 
            Chọn &quot;Danh bạ phường Hà Huy Tập&quot; để xem thông tin lãnh đạo phường.
          </Text>
        </Box>
      </Modal>
    </PageLayout>
  );
};

export default HomePage;