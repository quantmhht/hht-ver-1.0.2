import React, { useEffect, useMemo } from "react";
import { useStore } from "../../store";
import { Box, Text, Button, Icon } from "zmp-ui";
import { getUserRole, canAccessReports } from "../../utils/auth";
import { AdminReportView } from "./components/AdminReportView";
import { LeaderReportView } from "./components/LeaderReportView";
import ExportButton from "../../components/report/ExportButton";
import { excelExportService } from "../../service/excelExportService";
import styled from "styled-components";
import tw from "twin.macro";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import PageLayout from "@components/layout/PageLayout";

const WelcomeContainer = styled(Box)`
  ${tw`p-6 text-white`}
`;

const StatsContainer = styled(Box)`
  ${tw`p-4 bg-white mx-4 -mt-10 rounded-lg shadow-lg relative z-10`}
`;

const StatLabel = styled(Text)`
  ${tw`text-sm text-gray-600 mt-1`}
`;

const QuickActions = styled(Box)`
  ${tw`grid grid-cols-2 gap-3 p-4`}
`;

const ActionButton = styled(Button)`
  ${tw`h-16 text-sm`}
`;

const NotificationBadge = styled.div`
  ${tw`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center`}
`;

const ExportSection = styled(Box)`
  ${tw`p-4 bg-gray-50 border-t`}
`;

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, reports, fetchReports, updateReportStatus } = useStore((state) => state);

  const handleStartReport = (reportId: string) => {
    if (user) {
      updateReportStatus(reportId, 'in_progress', 'Bắt đầu xử lý báo cáo');
    }
  };

  const userRole = getUserRole(user?.idByOA, user?.id);
  const hasAccess = canAccessReports(user?.idByOA, user?.id);

  useEffect(() => {
    if (hasAccess) {
      fetchReports();
    }
  }, [user?.idByOA, user?.id, hasAccess]);

  const reportStats = useMemo(() => {
    const relevantReports = reports;
    const totalReports = relevantReports.length;
    const completedReports = relevantReports.filter(r => r.status === "approved").length;
    const pendingReports = relevantReports.filter(r =>
      ["pending", "in_progress", "submitted", "rejected"].includes(r.status)
    ).length;
    const overdueReports = relevantReports.filter(r =>
      dayjs().isAfter(dayjs(r.dueDate)) && r.status !== "approved"
    ).length;
    const pendingReviewCount = reports.filter(r => r.status === 'submitted').length;

    return {
      totalReports,
      completedReports,
      pendingReports,
      overdueReports,
      completionRate: totalReports > 0 ? (completedReports / totalReports) * 100 : 0,
      pendingReviewCount,
    };
  }, [reports]);

  // Lấy tên TDP nếu user là leader
  const userTDPName = useMemo(() => {
    if (userRole === 'leader' && user) {
      const userReport = reports.find(r => 
        r.assignedTo.zaloId === user.idByOA || r.assignedTo.zaloId === user.id
      );
      return userReport?.assignedTo.tdpName;
    }
    return undefined;
  }, [userRole, user, reports]);

  if (!user) {
    return (
      <PageLayout title="Báo cáo Tổ dân phố" id="reports">
        <Box flex justifyContent="center" alignItems="center" className="h-screen">
          <Text>Đang kiểm tra quyền truy cập...</Text>
        </Box>
      </PageLayout>
    );
  }

  if (!hasAccess) {
    return (
      <PageLayout title="Không có quyền truy cập" id="reports">
        <Box className="flex-1 overflow-auto bg-gray-100 p-4">
          <Box className="p-6 text-center bg-white rounded-lg shadow-sm">
            <Icon icon="zi-lock" size={48} className="text-gray-400 mb-4" />
            <Text.Title size="normal" className="mb-2">
              Không có quyền truy cập
            </Text.Title>
            <Text className="text-gray-600">
              Đây là mục dành riêng cho UBND phường và các tổ trưởng tổ dân phố.
            </Text>
            {import.meta.env.DEV && (
              <Box className="mt-4 p-3 bg-gray-100 rounded text-left">
                <Text size="xSmall" className="font-mono">
                  Debug: idByOA={user?.idByOA}, id={user?.id}, role={userRole}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </PageLayout>
    );
  }

  const renderUserSpecificView = () => {
    switch (userRole) {
      case "admin":
      case "mod":
        return <AdminReportView reports={reports} />;
      case "leader":
        return <LeaderReportView reports={reports} onStart={handleStartReport} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout title="Báo cáo Tổ dân phố" id="reports">
      <WelcomeContainer>
        <Text.Title className="text-blue-600 mb-1">
          Xin chào, {user?.name || 'Guest'}!
        </Text.Title>
        <Text className="text-blue-100">
          {userRole === "leader"
            ? "Quản lý báo cáo của tổ dân phố"
            : "Theo dõi tiến độ báo cáo các TDP"}
        </Text>
        {import.meta.env.DEV && (
          <Text className="text-blue-200 text-xs mt-1">
            Role: {userRole} | IDs: {user?.idByOA || 'N/A'}, {user?.id || 'N/A'}
          </Text>
        )}
      </WelcomeContainer>

      <StatsContainer>
        <Box className="grid grid-cols-2 gap-4">
          <Box className="text-center">
            <StatLabel>Tổng báo cáo</StatLabel>
            <Text className="text-2xl font-bold text-blue-600">{reportStats.totalReports}</Text>
          </Box>
          <Box className="text-center">
            <StatLabel>Hoàn thành</StatLabel>
            <Text className="text-2xl font-bold text-green-600">{reportStats.completedReports}</Text>
          </Box>
        </Box>
        <Box className="grid grid-cols-2 gap-4 mt-4">
          <Box className="text-center">
            <StatLabel>Chờ xử lý</StatLabel>
            <Text className="text-2xl font-bold text-orange-600">{reportStats.pendingReports}</Text>
          </Box>
          <Box className="text-center">
            <StatLabel>Quá hạn</StatLabel>
            <Text className="text-2xl font-bold text-red-600">{reportStats.overdueReports}</Text>
          </Box>
        </Box>
        <Box className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Text className="text-sm text-gray-600">Tỷ lệ hoàn thành:</Text>
          <Text className="text-lg font-bold text-blue-600">
            {reportStats.completionRate.toFixed(1)}%
          </Text>
        </Box>
      </StatsContainer>

      {(userRole === "admin" || userRole === "mod") && (
        <QuickActions>
          <ActionButton variant="secondary" onClick={() => navigate("/report/create")}>
            <Box className="flex flex-col items-center">
              <Icon icon="zi-plus" className="mb-1" />
              <Text className="text-xs">Tạo báo cáo</Text>
            </Box>
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => navigate("/report/stats")}>
            <Box className="flex flex-col items-center">
              <Icon icon="zi-poll" className="mb-1" />
              <Text className="text-xs">Thống kê</Text>
            </Box>
          </ActionButton>
          <ActionButton variant="secondary" className="relative" onClick={() => {}}>
            <Box className="flex flex-col items-center">
              <Icon icon="zi-clock-2" className="mb-1" />
              <Text className="text-xs">Chờ duyệt</Text>
              {reportStats.pendingReviewCount > 0 && (
                <NotificationBadge>{reportStats.pendingReviewCount}</NotificationBadge>
              )}
            </Box>
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => navigate("/report/manage-tdp")}>
            <Box className="flex flex-col items-center">
              <Icon icon="zi-group" className="mb-1" />
              <Text className="text-xs">Quản lý TDP</Text>
            </Box>
          </ActionButton>
        </QuickActions>
      )}

      <Box className="mt-4 px-4">
        {renderUserSpecificView()}
      </Box>

      {/* ✅ Export Section */}
      {reportStats.totalReports > 0 && (
        <ExportSection>
          <Box className="flex items-center justify-between mb-3">
            <Box>
              <Text.Title size="small">Xuất báo cáo Excel</Text.Title>
              <Text size="xSmall" className="text-gray-600">
                {userRole === 'leader' && userTDPName 
                  ? `Xuất báo cáo của ${userTDPName}`
                  : `Xuất ${reportStats.totalReports} báo cáo`
                }
              </Text>
            </Box>
            <ExportButton 
              reports={reports}
              tdpName={userTDPName}
              variant="primary"
              size="medium"
            />
          </Box>
          
          {/* Quick export buttons cho admin/mod */}
          {(userRole === "admin" || userRole === "mod") && (
            <Box className="grid grid-cols-3 gap-2">
              <Button
                size="small"
                variant="tertiary"
                onClick={() => {
                  try {
                    excelExportService.exportReportSummary(reports);
                  } catch (error) {
                    console.error('Quick export error:', error);
                  }
                }}
              >
                <Icon icon="zi-list-1" /> Tổng quan
              </Button>
              <Button
                size="small"
                variant="tertiary"
                onClick={() => {
                  try {
                    excelExportService.exportReportDetails(reports);
                  } catch (error) {
                    console.error('Quick export error:', error);
                  }
                }}
              >
                <Icon icon="zi-note" /> Chi tiết
              </Button>
              <Button
                size="small"
                variant="tertiary"
                onClick={() => {
                  try {
                    excelExportService.exportReportStats(reports);
                  } catch (error) {
                    console.error('Quick export error:', error);
                  }
                }}
              >
                <Icon icon="zi-poll" /> Thống kê
              </Button>
            </Box>
          )}
        </ExportSection>
      )}
    </PageLayout>
  );
};

export default ReportPage;