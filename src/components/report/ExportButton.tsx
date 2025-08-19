import React, { useState } from 'react';
import { Button, Modal, List, useSnackbar, Box, Text, Checkbox, Input, Icon } from 'zmp-ui';
import { Report } from '../../types/report';
import { excelExportService } from '../../service/excelExportService';
import styled from 'styled-components';
import tw from 'twin.macro';

// 🎨 Styled components
import { Download, FileText, BarChart2, Users, List as ListIcon, ChevronRight, Search, Filter } from 'lucide-react';

const ExportModal = styled(Modal)`
  .zaui-modal-content {
    ${tw`max-h-[80vh] overflow-y-auto`}
  }
`;

const ExportOption = styled(List.Item)`
  ${tw`cursor-pointer hover:bg-gray-50`}
  .zaui-list-item-content {
    ${tw`py-3`}
  }
`;

const ReportSelectionModal = styled(Modal)`
  .zaui-modal-content {
    ${tw`max-h-[70vh] overflow-y-auto`}
  }
`;

const ReportItem = styled.div`
  ${tw`flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50`}
`;

const SearchContainer = styled(Box)`
  ${tw`sticky top-0 bg-white z-10 border-b border-gray-200 p-4`}
`;

const FilterStats = styled(Box)`
  ${tw`sticky top-0 bg-blue-50 z-50 p-3 border-b border-blue-200`}
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
  tdpName?: string;
  className?: string;
}

export interface ExportOption {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  allowSelection?: boolean; // 🆕 Cho phép chọn báo cáo
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
  const [reportSelectionVisible, setReportSelectionVisible] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentExportType, setCurrentExportType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const { openSnackbar } = useSnackbar();

  // 🔍 Filter reports theo tdpName và search term
  const baseFilteredReports = reports.filter(r => !tdpName || r.assignedTo.tdpName === tdpName);
  const searchFilteredReports = baseFilteredReports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.assignedTo.tdpName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // 🆕 Xử lý xuất với báo cáo được chọn
  const handleSelectiveExport = (exportType: string) => {
    setCurrentExportType(exportType);
    setSelectedReports([]);
    setSearchTerm('');
    setReportSelectionVisible(true);
    setModalVisible(false);
  };

  // 🆕 Thực hiện xuất với báo cáo đã chọn
  const executeSelectiveExport = async () => {
    if (selectedReports.length === 0) {
      openSnackbar({ text: 'Vui lòng chọn ít nhất một báo cáo!', type: 'error' });
      return;
    }

    const reportsToExport = reports.filter(r => selectedReports.includes(r.id));
    
    try {
      setExporting(true);
      setReportSelectionVisible(false);

      // 🐛 Debug: Log dữ liệu trước khi xuất
      console.log('🔍 Exporting reports:', reportsToExport.length);
      reportsToExport.forEach((report, index) => {
        console.log(`📋 Report ${index + 1}:`, {
          id: report.id,
          title: report.title,
          questionsCount: report.questions?.length || 0,
          answersCount: report.submittedAnswers?.length || 0,
          questions: report.questions?.map(q => ({ id: q.id, text: q.text })),
          answers: report.submittedAnswers?.map(a => ({ questionId: a.questionId, value: a.value }))
        });
      });

      switch (currentExportType) {
        case 'summary':
          await excelExportService.exportReportSummary(reportsToExport);
          break;
        case 'details':
          await excelExportService.exportReportDetails(reportsToExport);
          break;
        case 'stats':
          await excelExportService.exportReportStats(reportsToExport);
          break;
        default:
          throw new Error('Loại xuất không hợp lệ');
      }

      openSnackbar({
        text: `Xuất ${selectedReports.length} báo cáo thành công!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Selective export error:', error);
      openSnackbar({
        text: `Lỗi khi xuất báo cáo: ${(error as Error).message}`,
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
      allowSelection: true,
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
      allowSelection: true,
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
      allowSelection: true,
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
      allowSelection: false,
    });
  }

  const filteredReports = baseFilteredReports.filter(r => !tdpName || r.assignedTo.tdpName === tdpName);

  if (filteredReports.length === 0) {
    return (
      <Button 
        variant={variant}
        size={size === 'small' ? 'medium' : size}
        fullWidth={fullWidth}
        disabled={true}
        className={className}
      >
        Không có dữ liệu
      </Button>
    );
  }

  // 🆕 Toggle chọn tất cả báo cáo
  const toggleSelectAll = () => {
    if (selectedReports.length === searchFilteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(searchFilteredReports.map(r => r.id));
    }
  };

  // 🆕 Toggle chọn một báo cáo
  const toggleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  return (
    <>
      <Button
        variant={variant}
        size={size === 'small' ? 'medium' : size}
        fullWidth={fullWidth}
        disabled={disabled || exporting}
        loading={exporting}
        onClick={() => setModalVisible(true)}
        className={className}
      >
        {exporting ? 'Đang xuất...' : 'Xuất Excel'}
      </Button>

      {/* 📋 Main Export Options Modal */}
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
              <Box key={option.key} className="mb-4">
                {/* 🆕 Filter button ở đầu mỗi option */}
                {option.allowSelection && (
                  <Box className="mb-2 pl-4">
                    <Button
                      size="small"
                      variant="tertiary"
                      onClick={() => handleSelectiveExport(option.key)}
                      icon={<Filter className="w-4 h-4" />}
                    >
                      Chọn báo cáo cụ thể
                    </Button>
                  </Box>
                )}
                
                {/* Nút xuất tất cả */}
                <ExportOption
                  onClick={option.action}
                  prefix={option.icon}
                  suffix={<ChevronRight className="w-5 h-5 text-gray-400" />}
                >
                  <Box>
                    <Text className="font-semibold">{option.title}</Text>
                    <DescriptionText>{option.description}</DescriptionText>
                  </Box>
                </ExportOption>
              </Box>
            ))}
          </List>

          {/* Info box */}
          <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text size="xSmall" className="text-blue-700">
              💡 <strong>Mẹo:</strong> File Excel sẽ được tải xuống tự động và có thể mở bằng Microsoft Excel, Google Sheets hoặc LibreOffice Calc.
            </Text>
          </Box>
        </Box>
      </ExportModal>

      {/* 🆕 Report Selection Modal */}
      <ReportSelectionModal
        visible={reportSelectionVisible}
        title={`Chọn báo cáo để xuất`}
        onClose={() => setReportSelectionVisible(false)}
      >
        {/* Search và Filter Header */}
        <SearchContainer>
          <Input
            placeholder="Tìm kiếm theo tiêu đề hoặc TDP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            className="mb-3"
          />
          
          <Box className="flex items-center justify-between">
            <Checkbox
              checked={selectedReports.length === searchFilteredReports.length && searchFilteredReports.length > 0}
              onChange={toggleSelectAll}
              value="select-all"
            >
              Chọn tất cả ({searchFilteredReports.length})
            </Checkbox>
            
            <Text size="small" className="text-gray-600">
              Đã chọn: {selectedReports.length}/{searchFilteredReports.length}
            </Text>
          </Box>
        </SearchContainer>

        {/* Selected Count */}
        {selectedReports.length > 0 && (
          <FilterStats>
            <Text size="small" className="text-blue-700 font-medium">
              ✅ Đã chọn {selectedReports.length} báo cáo để xuất
            </Text>
          </FilterStats>
        )}

        {/* Report List */}
        <Box p={2}>
          {searchFilteredReports.length === 0 ? (
            <Box className="text-center py-8">
              <Text className="text-gray-500">Không tìm thấy báo cáo nào</Text>
            </Box>
          ) : (
            searchFilteredReports.map((report) => (
              <ReportItem key={report.id}>
                <Checkbox
                  checked={selectedReports.includes(report.id)}
                  onChange={() => toggleSelectReport(report.id)}
                  value={report.id}
                />
                <Box className="flex-1">
                  <Text className="font-semibold text-sm">{report.title}</Text>
                  <Text size="xSmall" className="text-gray-600 mt-1">
                    TDP: {report.assignedTo.tdpName} • 
                    Trạng thái: {report.status} • 
                    Câu hỏi: {report.questions?.length || 0} • 
                    Câu trả lời: {report.submittedAnswers?.length || 0}
                  </Text>
                </Box>
              </ReportItem>
            ))
          )}
        </Box>

        {/* Footer Actions */}
        <Box className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => setReportSelectionVisible(false)}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={executeSelectiveExport}
            disabled={selectedReports.length === 0}
            loading={exporting}
          >
            Xuất {selectedReports.length} báo cáo
          </Button>
        </Box>
      </ReportSelectionModal>
    </>
  );
};

export default ExportButton;