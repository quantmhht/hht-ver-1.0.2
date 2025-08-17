import React, { useEffect, useMemo } from "react";
import { useStore } from "../../store";
import { Box, Text } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageLayout from "@components/layout/PageLayout";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4560'];

const ReportStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports, reportStats, fetchReports, getReportStats } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      await fetchReports();
      getReportStats();
    };
    fetchData();
  }, []);

  const pieChartData = useMemo(() => {
    const statuses = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [reports]);

  return (
    <PageLayout title="Thống kê Báo cáo" id="report-stats">
      <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Tổng cộng" value={reportStats.total} />
        <StatCard label="Hoàn thành" value={reportStats.completed} />
        <StatCard label="Chờ xử lý" value={reportStats.pending} />
        <StatCard label="Quá hạn" value={reportStats.overdue} />
      </Box>

      <Box className="bg-white p-4 rounded-lg shadow-sm">
        <Text.Title size="small">Phân bổ trạng thái</Text.Title>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </PageLayout>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Box className="bg-white p-4 rounded-lg shadow text-center">
    <Text className="text-3xl font-bold text-blue-600">{value}</Text>
    <Text className="text-gray-600 mt-1">{label}</Text>
  </Box>
);

export default ReportStatsPage;
