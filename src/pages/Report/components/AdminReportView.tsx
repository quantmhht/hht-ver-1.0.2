import React, { useState } from 'react';
import { Box, Text, Tabs, Spinner } from 'zmp-ui';
import styled from 'styled-components';
import tw from 'twin.macro';
import { useNavigate } from 'react-router-dom';
import { Report, ReportStatus } from '../../../types/report';

const TabContent = styled(Box)`
  ${tw`p-4`}
`;

const ReportCard = styled.div`
  ${tw`border rounded-lg p-3 mb-3 cursor-pointer transition-shadow hover:shadow-md`}
`;

interface AdminReportViewProps {
  reports: Report[];
}

export const AdminReportView: React.FC<AdminReportViewProps> = ({ reports }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReportStatus | 'overdue'>('submitted');

  const getFilteredReports = (status: ReportStatus | 'overdue') => {
    if (status === 'overdue') {
      return reports.filter(r => new Date(r.dueDate) < new Date() && r.status !== 'approved');
    }
    return reports.filter(r => r.status === status);
  };

  const TABS: { key: ReportStatus | 'overdue', label: string }[] = [
    { key: 'submitted', label: 'Chờ duyệt' },
    { key: 'pending', label: 'Chờ làm' },
    { key: 'overdue', label: 'Quá hạn' },
    { key: 'approved', label: 'Đã duyệt' },
  ];

  // SỬA LỖI: Tạo hàm handler mới với kiểu dữ liệu chính xác
  const handleTabChange = (newActiveKey: string) => {
    setActiveTab(newActiveKey as ReportStatus | 'overdue');
  };

  return (
    <Box className="bg-white mx-4 rounded-lg shadow-sm">
      <Tabs id="admin-report-tabs" activeKey={activeTab} onChange={handleTabChange}>
        {TABS.map(tab => (
          <Tabs.Tab key={tab.key} label={`${tab.label} (${getFilteredReports(tab.key).length})`}>
            <TabContent>
              {getFilteredReports(tab.key).length > 0 ? (
                getFilteredReports(tab.key).map(report => (
                  <ReportCard key={report.id} onClick={() => navigate(`/report/${report.id}`)}>
                    <Text className="font-semibold">{report.title}</Text>
                    <Text size="xSmall" className="text-gray-600 mt-1">
                      Tổ dân phố: {report.assignedTo.tdpName}
                    </Text>
                  </ReportCard>
                ))
              ) : (
                <Text className="text-center text-gray-500 py-8">Không có báo cáo nào.</Text>
              )}
            </TabContent>
          </Tabs.Tab>
        ))}
      </Tabs>
    </Box>
  );
};