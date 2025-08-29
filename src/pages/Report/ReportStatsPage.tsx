import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, Button, Tabs, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import PageLayout from "@components/layout/PageLayout";
import styled from "styled-components";
import tw from "twin.macro";
import dayjs from "dayjs";
import { excelExportService } from "../../service/excelExportService";
import ExportButton from "../../components/report/ExportButton";
import { useStore } from "../../store";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4560'];

const StatsCard = styled(Box)`
  ${tw`bg-white p-4 rounded-lg shadow-sm text-center`}
`;

const ChartContainer = styled(Box)`
  ${tw`bg-white p-4 rounded-lg shadow-sm`}
`;

const ExportToolbar = styled(Box)`
  ${tw`bg-gray-50 p-4 border-b flex items-center justify-between`}
`;

const QuickStatsGrid = styled(Box)`
  ${tw`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6`}
`;

// 🔧 MOVED: Khai báo functions trước khi sử dụng
const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Chờ làm',
    'in_progress': 'Đang làm',
    'submitted': 'Chờ duyệt',
    'approved': 'Đã duyệt',
    'rejected': 'Bị từ chối',
    'overdue': 'Quá hạn'
  };
  return statusMap[status] || status;
};

const getRankingBadgeClass = (index: number): string => {
  if (index === 0) return 'bg-yellow-500';
  if (index === 1) return 'bg-gray-400';
  if (index === 2) return 'bg-orange-500';
  return 'bg-blue-500';
};

const ReportStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports, fetchReports, getReportStats } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      await fetchReports();
      getReportStats();
    };
    fetchData();
  }, []);

  // Tính toán các thống kê chi tiết
  const detailedStats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'approved').length;
    const pending = reports.filter(r => ['pending', 'in_progress'].includes(r.status)).length;
    const submitted = reports.filter(r => r.status === 'submitted').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    const overdue = reports.filter(r => 
      dayjs().isAfter(dayjs(r.dueDate)) && r.status !== 'approved'
    ).length;

    return { total, completed, pending, submitted, rejected, overdue };
  }, [reports]);

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = useMemo(() => {
    const statuses = reports.reduce((acc, report) => {
      const statusText = getStatusText(report.status);
      acc[statusText] = (acc[statusText] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Dữ liệu cho biểu đồ cột (theo TDP)
  const tdpChartData = useMemo(() => {
    const tdpMap = new Map<string, any>();

    reports.forEach(report => {
      const {tdpName} = report.assignedTo;
      if (!tdpMap.has(tdpName)) {
        tdpMap.set(tdpName, {
          name: tdpName,
          total: 0,
          completed: 0,
          pending: 0,
        });
      }

      const stats = tdpMap.get(tdpName);
      stats.total += 1;
      if (report.status === 'approved') stats.completed += 1;
      if (['pending', 'in_progress'].includes(report.status)) stats.pending += 1;
    });

    return Array.from(tdpMap.values());
  }, [reports]);

  // Dữ liệu cho biểu đồ theo tháng
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, any>();
    const last6Months = Array.from({ length: 6 }, (_, i) => 
      dayjs().subtract(i, 'month').format('MM/YYYY')
    ).reverse();

    last6Months.forEach(month => {
      monthMap.set(month, { month, total: 0, completed: 0 });
    });

    reports.forEach(report => {
      const createdMonth = dayjs(report.history[0]?.timestamp || report.dueDate).format('MM/YYYY');
      if (monthMap.has(createdMonth)) {
        const stats = monthMap.get(createdMonth);
        stats.total += 1;
        if (report.status === 'approved') stats.completed += 1;
      }
    });

    return Array.from(monthMap.values());
  }, [reports]);

  return (
    <PageLayout title="Thống kê Báo cáo" id="report-stats">
      {/* Export Toolbar */}
      <ExportToolbar>
        <Box>
          <Text.Title size="small">Thống kê và Báo cáo</Text.Title>
          <Text size="xSmall" className="text-gray-600">
            Tổng cộng {reports.length} báo cáo • Cập nhật lần cuối: {dayjs().format('DD/MM/YYYY HH:mm')}
          </Text>
        </Box>
        <Box className="flex gap-2">
          <Button
            size="small"
            variant="tertiary"
            onClick={() => navigate("/report")}
            icon={<Icon icon="zi-arrow-left" />}
          >
            Quay lại
          </Button>
          <ExportButton 
            reports={reports}
            variant="primary"
            size="small"
          />
        </Box>
      </ExportToolbar>

      <Box className="p-4">
        {/* Quick Stats Cards */}
        <QuickStatsGrid>
          <StatsCard>
            <Text className="text-3xl font-bold text-blue-600">{detailedStats.total}</Text>
            <Text className="text-gray-600">Tổng cộng</Text>
          </StatsCard>
          <StatsCard>
            <Text className="text-3xl font-bold text-green-600">{detailedStats.completed}</Text>
            <Text className="text-gray-600">Hoàn thành</Text>
          </StatsCard>
          <StatsCard>
            <Text className="text-3xl font-bold text-orange-600">{detailedStats.pending}</Text>
            <Text className="text-gray-600">Chờ xử lý</Text>
          </StatsCard>
          <StatsCard>
            <Text className="text-3xl font-bold text-red-600">{detailedStats.overdue}</Text>
            <Text className="text-gray-600">Quá hạn</Text>
          </StatsCard>
        </QuickStatsGrid>

        {/* Tabs for different views */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.Tab key="overview" label="Tổng quan">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Pie Chart - Phân bổ trạng thái */}
              <ChartContainer>
                <Text.Title size="small" className="mb-4">Phân bổ theo trạng thái</Text.Title>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Bar Chart - Theo tháng */}
              <ChartContainer>
                <Text.Title size="small" className="mb-4">Xu hướng 6 tháng gần đây</Text.Title>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Tổng số" />
                    <Bar dataKey="completed" fill="#82ca9d" name="Hoàn thành" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Box>
          </Tabs.Tab>

          <Tabs.Tab key="tdp" label="Theo TDP">
            <ChartContainer className="mt-4">
              <Box className="flex justify-between items-center mb-4">
                <Text.Title size="small">Thống kê theo Tổ dân phố</Text.Title>
                <Button
                  size="small"
                  variant="tertiary"
                  onClick={() => {
                    try {
                      excelExportService.exportReportStats(reports);
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      console.error('Export error:', error);
                    }
                  }}
                >
                  <Icon icon="zi-download" /> Xuất chi tiết TDP
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tdpChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Tổng số" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Hoàn thành" />
                  <Bar dataKey="pending" fill="#ffc658" name="Chờ xử lý" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Tabs.Tab>

          <Tabs.Tab key="performance" label="Hiệu suất">
            <Box className="mt-4 space-y-4">
              {/* Performance metrics */}
              <ChartContainer>
                <Text.Title size="small" className="mb-4">Chỉ số hiệu suất</Text.Title>
                <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Box className="text-center p-3 bg-blue-50 rounded">
                    <Text className="text-2xl font-bold text-blue-600">
                      {detailedStats.total > 0 ? ((detailedStats.completed / detailedStats.total) * 100).toFixed(1) : 0}%
                    </Text>
                    <Text size="xSmall" className="text-gray-600">Tỷ lệ hoàn thành</Text>
                  </Box>
                  <Box className="text-center p-3 bg-green-50 rounded">
                    <Text className="text-2xl font-bold text-green-600">
                      {detailedStats.total > 0 ? ((detailedStats.submitted / detailedStats.total) * 100).toFixed(1) : 0}%
                    </Text>
                    <Text size="xSmall" className="text-gray-600">Tỷ lệ chờ duyệt</Text>
                  </Box>
                  <Box className="text-center p-3 bg-orange-50 rounded">
                    <Text className="text-2xl font-bold text-orange-600">
                      {detailedStats.total > 0 ? ((detailedStats.pending / detailedStats.total) * 100).toFixed(1) : 0}%
                    </Text>
                    <Text size="xSmall" className="text-gray-600">Tỷ lệ chờ xử lý</Text>
                  </Box>
                  <Box className="text-center p-3 bg-red-50 rounded">
                    <Text className="text-2xl font-bold text-red-600">
                      {detailedStats.total > 0 ? ((detailedStats.overdue / detailedStats.total) * 100).toFixed(1) : 0}%
                    </Text>
                    <Text size="xSmall" className="text-gray-600">Tỷ lệ quá hạn</Text>
                  </Box>
                </Box>
              </ChartContainer>

              {/* TDP Performance Ranking */}
              <ChartContainer>
                <Text.Title size="small" className="mb-4">Xếp hạng hiệu suất TDP</Text.Title>
                <Box className="space-y-2">
                  {tdpChartData
                    .sort((a, b) => (b.completed / b.total) - (a.completed / a.total))
                    .map((tdp, index) => {
                      const completionRate = (tdp.completed / tdp.total) * 100;
                      return (
                        <Box key={tdp.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <Box className="flex items-center gap-3">
                            <Box className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              getRankingBadgeClass(index)
                            }`}>
                              {index + 1}
                            </Box>
                            <Text className="font-semibold">{tdp.name}</Text>
                          </Box>
                          <Box className="text-right">
                            <Text className="font-bold">{completionRate.toFixed(1)}%</Text>
                            <Text size="xSmall" className="text-gray-600">
                              {tdp.completed}/{tdp.total} báo cáo
                            </Text>
                          </Box>
                        </Box>
                      );
                    })}
                </Box>
              </ChartContainer>
            </Box>
          </Tabs.Tab>
        </Tabs>

        {/* Quick Export Actions */}
        <Box className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Text.Title size="small" className="mb-3">Xuất báo cáo nhanh</Text.Title>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                try {
                  excelExportService.exportReportSummary(reports);
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('Export error:', error);
                }
              }}
            >
              <Icon icon="zi-list-1" /> Xuất tổng quan
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                try {
                  excelExportService.exportReportDetails(reports);
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('Export error:', error);
                }
              }}
            >
              <Icon icon="zi-note" /> Xuất chi tiết
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                try {
                  excelExportService.exportReportStats(reports);
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('Export error:', error);
                }
              }}
            >
              <Icon icon="zi-poll" /> Xuất thống kê
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ReportStatsPage;