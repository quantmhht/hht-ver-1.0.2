import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Box, Text, Button, useSnackbar } from "zmp-ui";
import dayjs from "dayjs";
import PageLayout from "@components/layout/PageLayout"; // ✅ Dùng layout chung

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { reports, fetchReports, updateReportStatus, loading } = useStore();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const foundReport = reports.find((r) => r.id === id);
    setReport(foundReport || null);
  }, [reports, id]);

  const handleApprove = async () => {
    if (report) {
      await updateReportStatus(report.id, "approved", "Báo cáo đã được duyệt");
      openSnackbar({ text: "Duyệt báo cáo thành công!", type: "success" });
      navigate(-1);
    }
  };

  const handleReject = async () => {
    if (report) {
      await updateReportStatus(report.id, "rejected", "Báo cáo bị từ chối");
      openSnackbar({ text: "Từ chối báo cáo thành công!", type: "success" });
      navigate(-1);
    }
  };

  if (!report) {
    return (
      <PageLayout title="Chi tiết Báo cáo" id="report-detail">
        <Box className="flex items-center justify-center h-screen">
          <Text>Đang tải dữ liệu...</Text>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Chi tiết Báo cáo" id="report-detail">
      <Box className="flex-1 overflow-auto bg-gray-100 p-4">
        <Box className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text.Title>{report.title}</Text.Title>
          <Text className="text-gray-600 mb-2">
            Hạn nộp: {dayjs(report.dueDate).format("DD/MM/YYYY")}
          </Text>
          <Text className="text-gray-600 mb-2">Trạng thái: {report.status}</Text>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow-sm">
          <Text.Title size="small">Câu hỏi</Text.Title>
          {report.questions.map((q: any, index: number) => (
            <Box key={index} className="mt-2">
              <Text className="font-semibold">{q.text}</Text>
              {q.answer && <Text className="text-gray-600">Trả lời: {q.answer}</Text>}
            </Box>
          ))}
        </Box>
      </Box>
      <Box className="p-4 bg-white shadow-top flex justify-end space-x-2">
        <Button
          className="bg-red-500 text-white"
          loading={loading}
          onClick={handleReject}
        >
          Từ chối
        </Button>
        <Button
          className="bg-green-500 text-white"
          loading={loading}
          onClick={handleApprove}
        >
          Duyệt
        </Button>
      </Box>
    </PageLayout>
  );
};

export default ReportDetailPage;
