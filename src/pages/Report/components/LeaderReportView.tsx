// src/pages/Report/components/LeaderReportView.tsx
import React, { useState } from 'react';
import { Box, Button, Text } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { Report } from '../../../types/report';
import SubmitReportModal from './SubmitReportModal';
import { ReportStatusBadge, PriorityBadge, TimeLeftTag } from './Badges';

interface LeaderReportViewProps {
  reports: Report[];
  onStart: (reportId: string) => void;
}

interface ReportCategoryProps {
  title: string;
  data: Report[];
  navigate: (path: string) => void;
  renderActionButtons: (report: Report) => React.ReactNode;
}

const ReportCategory: React.FC<ReportCategoryProps> = ({ title, data, navigate, renderActionButtons }) => {
  if (data.length === 0) return null;
  return (
    <Box mb={4}>
      <Text.Title size="small" className="mb-2">{title} ({data.length})</Text.Title>
      {data.map(report => (
        <Box key={report.id} className="bg-white p-3 rounded-lg shadow-sm mb-3" onClick={() => navigate(`/report/${report.id}`)}>
          <div className="flex justify-between items-start">
            <Text.Header className="font-semibold text-base flex-1 mr-2">{report.title}</Text.Header>
            <ReportStatusBadge status={report.status} />
          </div>
          <Box my={2} className="flex items-center space-x-2">
            <PriorityBadge priority={report.priority} />
            <TimeLeftTag dueDate={report.dueDate} status={report.status} />
          </Box>
          {report.status === 'rejected' && report.history.slice(-1)[0]?.notes && (
              <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">Lý do từ chối: {report.history.slice(-1)[0].notes}</p>
          )}
          <Box mt={3} className="flex justify-end">
            {renderActionButtons(report)}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Sửa lại khai báo component để nhận props
export const LeaderReportView: React.FC<LeaderReportViewProps> = ({ reports, onStart }) => {
  const [submittingReport, setSubmittingReport] = useState<Report | null>(null);
  const navigate = useNavigate();

  const renderActionButtons = (report: Report) => {
    switch (report.status) {
      case 'pending':
        return <Button size="small" onClick={(e) => { e.stopPropagation(); onStart(report.id); }}>Bắt đầu làm</Button>;
      case 'in_progress':
      case 'rejected':
        return <Button size="small" variant="primary" onClick={(e) => { e.stopPropagation(); setSubmittingReport(report); }}>Nộp báo cáo</Button>;
      default:
        return null;
    }
  };

  const categorizedReports = {
    todo: reports.filter(r => r.status === 'pending' || r.status === 'rejected'),
    in_progress: reports.filter(r => r.status === 'in_progress'),
    submitted: reports.filter(r => r.status === 'submitted'),
    approved: reports.filter(r => r.status === 'approved'),
  };

  const ReportCategory = ({ title, data }: { title: string, data: Report[] }) => {
    if (data.length === 0) return null;
    return (
      <Box mb={4}>
        <Text.Title size="small" className="mb-2">{title} ({data.length})</Text.Title>
        {data.map(report => (
          <Box key={report.id} className="bg-white p-3 rounded-lg shadow-sm mb-3" onClick={() => navigate(`/report/${report.id}`)}>
            <div className="flex justify-between items-start">
              <Text.Header className="font-semibold text-base flex-1 mr-2">{report.title}</Text.Header>
              <ReportStatusBadge status={report.status} />
            </div>
            <Box my={2} className="flex items-center space-x-2">
              <PriorityBadge priority={report.priority} />
              <TimeLeftTag dueDate={report.dueDate} status={report.status} />
            </Box>
            {report.status === 'rejected' && report.history.slice(-1)[0]?.notes && (
                <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">Lý do từ chối: {report.history.slice(-1)[0].notes}</p>
            )}
            <Box mt={3} className="flex justify-end">
              {renderActionButtons(report)}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box p={2} className="bg-gray-100 h-full">
      <ReportCategory title="Cần làm" data={categorizedReports.todo} />
      <ReportCategory title="Đang làm" data={categorizedReports.in_progress} />
      <ReportCategory title="Chờ duyệt" data={categorizedReports.submitted} />
      <ReportCategory title="Đã hoàn thành" data={categorizedReports.approved} />

      <SubmitReportModal 
        report={submittingReport}
        onClose={() => setSubmittingReport(null)}
      />
    </Box>
  );
};