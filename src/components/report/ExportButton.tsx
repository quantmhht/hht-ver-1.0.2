import React, { useState } from 'react';
import { Button, Modal, List, useSnackbar, Box, Text } from 'zmp-ui';
import { Report } from '../../types/report';
import { excelExportService } from '../../service/excelExportService';
import styled from 'styled-components';
import tw from 'twin.macro';

// 🎨 icon mới từ lucide-react
import { Download, FileText, BarChart2, Users, List as ListIcon, ChevronRight } from 'lucide-react';

const ExportModal = styled(Modal)`
  .zaui-modal-content {
    ${tw`max-h-[70vh] overflow-y-auto`}
  }
`;

const ExportOption = styled(List.Item)`
  ${tw`cursor-pointer hover:bg-gray-50`}
  .zaui-list-item-content {
    ${tw`py-3`}
  }
`;

const DescriptionText = styled(Text)`
  ${tw`text-gray-600 text-sm mt-1`}
`;

export interface ExportButtonProps {
  reports: Report[];
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  tdpName?: string; // Nếu xuất cho TDP cụ thể
  className?: string;
}

export interface ExportOption {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode; // ⚡ chuyển từ string → ReactNode
  action: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  reports,
  variant = 'secondary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  tdpName,
  className,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { openSnackbar } = useSnackbar();

  const handleExport = async (exportFn: () => void, optionName: string) => {
    try {
      setExporting(true);
      setModalVisible(false);

      await exportFn();

      openSnackbar({
        text: `Xuất ${optionName} thành công!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      openSnackbar({
        text: `Lỗi khi xuất ${optionName}: ${(error as Error).message}`,
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  };

  const exportOptions: ExportOption[] = [
    {
      key: 'summary',
      title: 'Báo cáo tổng quan',
      description: 'Xuất danh sách báo cáo với thông tin cơ bản (trạng thái, thời gian, TDP)',
      icon: <ListIcon className="w-5 h-5 text-blue-600" />,
      action: () => handleExport(
        () => excelExportService.exportReportSummary(reports),
        'báo cáo tổng quan'
      ),
    },
    {
      key: 'details',
      title: 'Báo cáo chi tiết',
      description: 'Xuất chi tiết tất cả câu hỏi và câu trả lời trong báo cáo',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      action: () => handleExport(
        () => excelExportService.exportReportDetails(reports),
        'báo cáo chi tiết'
      ),
    },
    {
      key: 'stats',
      title: 'Thống kê báo cáo',
      description: 'Xuất thống kê tổng quan, theo TDP và theo trạng thái (3 sheet)',
      icon: <BarChart2 className="w-5 h-5 text-blue-600" />,
      action: () => handleExport(
        () => excelExportService.exportReportStats(reports),
        'thống kê báo cáo'
      ),
    },
  ];

  // Nếu có tdpName, thêm option xuất riêng cho TDP
  if (tdpName) {
    exportOptions.unshift({
      key: 'tdp-specific',
      title: `Báo cáo ${tdpName}`,
      description: `Xuất tất cả báo cáo của ${tdpName}`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      action: () => handleExport(
        () => excelExportService.exportTDPReport(reports, tdpName),
        `báo cáo ${tdpName}`
      ),
    });
  }

  const filteredReports = reports.filter(r => !tdpName || r.assignedTo.tdpName === tdpName);

  if (filteredReports.length === 0) {
    return (
      <Button 
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={true}
        className={className}
      >
        <Download className="w-4 h-4 mr-2" /> Không có dữ liệu
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled || exporting}
        loading={exporting}
        onClick={() => setModalVisible(true)}
        className={className}
      >
        <Download className="w-4 h-4 mr-2" />
        {exporting ? 'Đang xuất...' : 'Xuất Excel'}
      </Button>

      <ExportModal
        visible={modalVisible}
        title="Chọn định dạng xuất Excel"
        onClose={() => setModalVisible(false)}
      >
        <Box p={4}>
          <Text className="text-gray-600 mb-4">
            Tìm thấy {filteredReports.length} báo cáo. Chọn định dạng xuất phù hợp:
          </Text>
          
          <List>
            {exportOptions.map((option) => (
              <ExportOption
                key={option.key}
                onClick={option.action}
                prefix={option.icon}
                suffix={<ChevronRight className="w-5 h-5 text-gray-400" />}
              >
                <Box>
                  <Text className="font-semibold">{option.title}</Text>
                  <DescriptionText>{option.description}</DescriptionText>
                </Box>
              </ExportOption>
            ))}
          </List>

          {/* Thông tin bổ sung */}
          <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text size="xSmall" className="text-blue-700">
              💡 <strong>Mẹo:</strong> File Excel sẽ được tải xuống tự động và có thể mở bằng Microsoft Excel, Google Sheets hoặc LibreOffice Calc.
            </Text>
          </Box>
        </Box>
      </ExportModal>
    </>
  );
};

export default ExportButton;
