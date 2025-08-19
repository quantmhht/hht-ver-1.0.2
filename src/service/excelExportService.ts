import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { Report, Answer, Question, QuestionType } from '../types/report';

// Interfaces cho các loại export
export interface ExportData {
  fileName: string;
  sheets: ExportSheet[];
}

export interface ExportSheet {
  name: string;
  data: any[];
  headers?: string[];
}

export interface ReportSummaryData {
  reportId: string;
  title: string;
  tdpName: string;
  leaderName: string;
  assignedBy: string;
  status: string;
  priority: string;
  dueDate: string;
  submittedAt?: string;
  completionTime?: string;
  questionsCount: number; // 🆕 Thêm số lượng câu hỏi
  answersCount: number;   // 🆕 Thêm số lượng câu trả lời
}

export interface ReportDetailData {
  reportId: string;
  reportTitle: string;
  tdpName: string;
  questionIndex: number;  // 🆕 Thêm số thứ tự câu hỏi
  questionId: string;     // 🆕 Thêm ID câu hỏi để debug
  questionText: string;
  questionType: string;
  isRequired: string;
  answerValue: string;
  submittedAt: string;
}

class ExcelExportService {
  /**
   * 📊 Xuất báo cáo tổng quan
   */
  exportReportSummary(reports: Report[]): void {
    console.log('📊 Exporting summary for', reports.length, 'reports');
    
    const summaryData: ReportSummaryData[] = reports.map(report => {
      const questionsCount = report.questions?.length || 0;
      const answersCount = report.submittedAnswers?.length || 0;
      
      console.log(`📋 Report ${report.id}: ${questionsCount} questions, ${answersCount} answers`);
      
      return {
        reportId: report.id,
        title: report.title,
        tdpName: report.assignedTo.tdpName,
        leaderName: this.getLeaderNameFromReport(report),
        assignedBy: report.assignedBy.name,
        status: this.getStatusText(report.status),
        priority: this.getPriorityText(report.priority),
        dueDate: dayjs(report.dueDate).format('DD/MM/YYYY HH:mm'),
        submittedAt: report.submittedAt ? dayjs(report.submittedAt).format('DD/MM/YYYY HH:mm') : '',
        completionTime: this.calculateCompletionTime(report),
        questionsCount,
        answersCount,
      };
    });

    const exportData: ExportData = {
      fileName: `BaoCao_TongQuan_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`,
      sheets: [
        {
          name: 'Tổng quan báo cáo',
          data: summaryData,
          headers: [
            'Mã báo cáo',
            'Tiêu đề', 
            'Tổ dân phố',
            'Tổ trưởng',
            'Người giao',
            'Trạng thái',
            'Ưu tiên',
            'Hạn nộp',
            'Thời gian nộp',
            'Thời gian hoàn thành',
            'Số câu hỏi',
            'Số câu trả lời',
          ]
        }
      ]
    };

    this.generateExcel(exportData);
  }

  /**
   * 📋 Xuất báo cáo chi tiết (bao gồm câu trả lời) - FIXED VERSION
   */
  exportReportDetails(reports: Report[]): void {
    console.log('📋 Exporting details for', reports.length, 'reports');
    
    const detailData: ReportDetailData[] = [];
    
    reports.forEach((report, reportIndex) => {
      console.log(`\n🔍 Processing Report ${reportIndex + 1}:`, {
        id: report.id,
        title: report.title,
        questionsCount: report.questions?.length || 0,
        answersCount: report.submittedAnswers?.length || 0,
        hasSubmittedAnswers: !!report.submittedAnswers
      });

      // 🐛 FIX: Kiểm tra cả submittedAnswers và questions
      if (!report.questions || report.questions.length === 0) {
        console.warn(`⚠️ Report ${report.id} has no questions`);
        return;
      }

      // 🔥 LOG: Chi tiết questions và answers
      console.log('📝 Questions:', report.questions.map(q => ({ id: q.id, text: q.text.substring(0, 50) + '...' })));
      if (report.submittedAnswers) {
        console.log('💬 Answers:', report.submittedAnswers.map(a => ({ 
          questionId: a.questionId, 
          value: typeof a.value === 'string' ? a.value.substring(0, 50) + '...' : a.value 
        })));
      }

      // 🆕 IMPROVED: Lặp qua TẤT CẢ questions, không chỉ những có answer
      report.questions.forEach((question, questionIndex) => {
        console.log(`  📝 Processing Question ${questionIndex + 1}:`, {
          questionId: question.id,
          text: question.text.substring(0, 30) + '...',
          type: question.type
        });

        // Tìm answer tương ứng
        const answer = report.submittedAnswers?.find(a => a.questionId === question.id);
        
        console.log(`    💬 Answer found:`, !!answer, answer ? {
          value: typeof answer.value === 'string' ? answer.value.substring(0, 30) + '...' : answer.value
        } : 'No answer');

        const answerValue = this.formatAnswerValue(question, answer);
        
        detailData.push({
          reportId: report.id,
          reportTitle: report.title,
          tdpName: report.assignedTo.tdpName,
          questionIndex: questionIndex + 1,
          questionId: question.id,
          questionText: question.text,
          questionType: this.getQuestionTypeText(question.type),
          isRequired: question.isRequired ? 'Có' : 'Không',
          answerValue: answerValue,
          submittedAt: report.submittedAt ? dayjs(report.submittedAt).format('DD/MM/YYYY HH:mm') : '',
        });

        console.log(`    ✅ Added to export: ${answerValue}`);
      });
    });

    console.log(`📊 Total detail rows to export: ${detailData.length}`);

    // 🆕 Group by report to verify data
    const groupedData = detailData.reduce((acc, row) => {
      if (!acc[row.reportId]) acc[row.reportId] = [];
      acc[row.reportId].push(row);
      return acc;
    }, {} as Record<string, ReportDetailData[]>);

    console.log('📊 Grouped data summary:');
    Object.entries(groupedData).forEach(([reportId, rows]) => {
      console.log(`  📋 ${reportId}: ${rows.length} questions`);
    });

    const exportData: ExportData = {
      fileName: `BaoCao_ChiTiet_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`,
      sheets: [
        {
          name: 'Chi tiết báo cáo',
          data: detailData,
          headers: [
            'Mã báo cáo',
            'Tiêu đề báo cáo',
            'Tổ dân phố',
            'STT câu hỏi',
            'ID câu hỏi',
            'Câu hỏi',
            'Loại câu hỏi',
            'Bắt buộc',
            'Câu trả lời',
            'Thời gian nộp',
          ]
        }
      ]
    };

    this.generateExcel(exportData);
  }

  /**
   * 📊 Xuất thống kê báo cáo
   */
  exportReportStats(reports: Report[]): void {
    console.log('📊 Exporting stats for', reports.length, 'reports');
    
    // Sheet 1: Thống kê tổng quan
    const statsData = this.generateStatsData(reports);
    
    // Sheet 2: Thống kê theo TDP
    const tdpStatsData = this.generateTDPStatsData(reports);
    
    // Sheet 3: Thống kê theo trạng thái
    const statusStatsData = this.generateStatusStatsData(reports);

    const exportData: ExportData = {
      fileName: `ThongKe_BaoCao_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`,
      sheets: [
        {
          name: 'Thống kê tổng quan',
          data: statsData,
          headers: ['Chỉ số', 'Giá trị', 'Ghi chú']
        },
        {
          name: 'Thống kê theo TDP',
          data: tdpStatsData,
          headers: ['Tổ dân phố', 'Tổng số', 'Hoàn thành', 'Chờ xử lý', 'Quá hạn', 'Tỷ lệ hoàn thành (%)']
        },
        {
          name: 'Thống kê theo trạng thái',
          data: statusStatsData,
          headers: ['Trạng thái', 'Số lượng', 'Tỷ lệ (%)']
        }
      ]
    };

    this.generateExcel(exportData);
  }

  /**
   * 📋 Xuất báo cáo của một TDP cụ thể
   */
  exportTDPReport(reports: Report[], tdpName: string): void {
    const tdpReports = reports.filter(r => r.assignedTo.tdpName === tdpName);
    
    console.log(`📋 Exporting TDP report for ${tdpName}:`, tdpReports.length, 'reports');
    
    if (tdpReports.length === 0) {
      throw new Error(`Không tìm thấy báo cáo nào cho TDP ${tdpName}`);
    }

    const summaryData: ReportSummaryData[] = tdpReports.map(report => ({
      reportId: report.id,
      title: report.title,
      tdpName: report.assignedTo.tdpName,
      leaderName: this.getLeaderNameFromReport(report),
      assignedBy: report.assignedBy.name,
      status: this.getStatusText(report.status),
      priority: this.getPriorityText(report.priority),
      dueDate: dayjs(report.dueDate).format('DD/MM/YYYY HH:mm'),
      submittedAt: report.submittedAt ? dayjs(report.submittedAt).format('DD/MM/YYYY HH:mm') : '',
      completionTime: this.calculateCompletionTime(report),
      questionsCount: report.questions?.length || 0,
      answersCount: report.submittedAnswers?.length || 0,
    }));

    const exportData: ExportData = {
      fileName: `BaoCao_${tdpName}_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`,
      sheets: [
        {
          name: `Báo cáo ${tdpName}`,
          data: summaryData,
          headers: [
            'Mã báo cáo',
            'Tiêu đề',
            'Người giao',
            'Trạng thái',
            'Ưu tiên',
            'Hạn nộp',
            'Thời gian nộp',
            'Thời gian hoàn thành',
            'Số câu hỏi',
            'Số câu trả lời',
          ]
        }
      ]
    };

    this.generateExcel(exportData);
  }

  /**
   * 🏗️ Generate Excel file
   */
  private generateExcel(exportData: ExportData): void {
    console.log('🏗️ Generating Excel file:', exportData.fileName);
    
    const workbook = XLSX.utils.book_new();

    exportData.sheets.forEach((sheet, sheetIndex) => {
      console.log(`📝 Processing sheet ${sheetIndex + 1}: ${sheet.name} (${sheet.data.length} rows)`);
      
      let worksheet: XLSX.WorkSheet;

      if (sheet.headers && sheet.data.length > 0) {
        // Tạo worksheet với headers
        const dataWithHeaders = [sheet.headers, ...sheet.data.map(row => 
          sheet.headers!.map(header => {
            const key = this.getKeyFromHeader(header, sheet.data[0]);
            const value = row[key];
            return value !== undefined ? value : '';
          })
        )];
        worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
        
        console.log(`  📊 Sheet data preview:`, {
          headers: sheet.headers,
          sampleRow: sheet.data[0],
          totalRows: dataWithHeaders.length
        });
      } else {
        // Tạo worksheet từ object
        worksheet = XLSX.utils.json_to_sheet(sheet.data);
      }

      // Styling cho worksheet
      this.styleWorksheet(worksheet, sheet.data.length + (sheet.headers ? 1 : 0));

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    // Tạo và download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, exportData.fileName);
    
    console.log('✅ Excel file generated and downloaded successfully');
  }

  /**
   * 🎨 Styling cho worksheet
   */
  private styleWorksheet(worksheet: XLSX.WorkSheet, rowCount: number): void {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Auto-fit columns
    const colWidths: number[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          maxWidth = Math.max(maxWidth, cellLength);
        }
      }
      colWidths[C] = Math.min(maxWidth + 2, 50); // Max width 50
    }
    worksheet['!cols'] = colWidths.map(width => ({ width }));
  }

  /**
   * 🔄 Helper methods
   */
  private getKeyFromHeader(header: string, sampleData: any): string {
    const headerMap: { [key: string]: string } = {
      'Mã báo cáo': 'reportId',
      'Tiêu đề': 'title',
      'Tiêu đề báo cáo': 'reportTitle',
      'Tổ dân phố': 'tdpName',
      'Tổ trưởng': 'leaderName',
      'Người giao': 'assignedBy',
      'Trạng thái': 'status',
      'Ưu tiên': 'priority',
      'Hạn nộp': 'dueDate',
      'Thời gian nộp': 'submittedAt',
      'Thời gian hoàn thành': 'completionTime',
      'Số câu hỏi': 'questionsCount',
      'Số câu trả lời': 'answersCount',
      'STT câu hỏi': 'questionIndex',
      'ID câu hỏi': 'questionId',
      'Câu hỏi': 'questionText',
      'Loại câu hỏi': 'questionType',
      'Bắt buộc': 'isRequired',
      'Câu trả lời': 'answerValue',
    };
    
    return headerMap[header] || Object.keys(sampleData)[0];
  }

  private getLeaderNameFromReport(report: Report): string {
    // TODO: Có thể lấy từ TDP mapping hoặc từ dữ liệu có sẵn
    return 'Tổ trưởng'; // Placeholder - có thể cải thiện sau
  }

  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ làm',
      'in_progress': 'Đang làm', 
      'submitted': 'Chờ duyệt',
      'approved': 'Đã duyệt',
      'rejected': 'Bị từ chối',
      'overdue': 'Quá hạn'
    };
    return statusMap[status] || status;
  }

  private getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'Thấp',
      'medium': 'Trung bình',
      'high': 'Cao'
    };
    return priorityMap[priority] || priority;
  }

  private getQuestionTypeText(type: QuestionType): string {
    const typeMap: { [key: string]: string } = {
      [QuestionType.SHORT_ANSWER]: 'Trả lời ngắn',
      [QuestionType.SINGLE_CHOICE]: 'Trắc nghiệm (chọn 1)',
      [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm (chọn nhiều)'
    };
    return typeMap[type] || type;
  }

  /**
   * 🔧 IMPROVED: Format answer value với debug logging
   */
  private formatAnswerValue(question: Question, answer?: Answer): string {
    if (!answer || !answer.value) {
      console.log(`    ⚠️ No answer for question ${question.id}`);
      return 'Chưa trả lời';
    }

    console.log(`    🔧 Formatting answer:`, {
      questionType: question.type,
      answerValue: answer.value,
      answerType: typeof answer.value,
      isArray: Array.isArray(answer.value)
    });

    if (question.type === QuestionType.SHORT_ANSWER) {
      const result = answer.value as string;
      console.log(`    ✅ Short answer result: "${result}"`);
      return result;
    }

    if (question.type === QuestionType.SINGLE_CHOICE) {
      const option = question.options?.find(opt => opt.id === answer.value);
      const result = option?.value || 'Không rõ';
      console.log(`    ✅ Single choice result: "${result}" (option ID: ${answer.value})`);
      return result;
    }

    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      const selectedValues = answer.value as string[];
      const selectedOptions = question.options?.filter(opt => 
        selectedValues.includes(opt.id)
      );
      const result = selectedOptions?.map(opt => opt.value).join(', ') || 'Không rõ';
      console.log(`    ✅ Multiple choice result: "${result}" (selected IDs: ${selectedValues.join(', ')})`);
      return result;
    }

    console.log(`    ❓ Unknown question type: ${question.type}`);
    return 'Không rõ';
  }

  private calculateCompletionTime(report: Report): string {
    if (!report.submittedAt) return '';
    
    const created = dayjs(report.history[0]?.timestamp || report.dueDate);
    const submitted = dayjs(report.submittedAt);
    const diffDays = submitted.diff(created, 'day');
    const diffHours = submitted.diff(created, 'hour') % 24;
    
    if (diffDays > 0) {
      return `${diffDays} ngày ${diffHours} giờ`;
    }
    return `${diffHours} giờ`;
  }

  private generateStatsData(reports: Report[]): any[] {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'approved').length;
    const pending = reports.filter(r => ['pending', 'in_progress'].includes(r.status)).length;
    const submitted = reports.filter(r => r.status === 'submitted').length;
    const overdue = reports.filter(r => 
      dayjs().isAfter(dayjs(r.dueDate)) && r.status !== 'approved'
    ).length;

    return [
      { key: 'Tổng số báo cáo', value: total, note: '' },
      { key: 'Đã hoàn thành', value: completed, note: `${((completed/total)*100).toFixed(1)}%` },
      { key: 'Đang xử lý', value: pending, note: `${((pending/total)*100).toFixed(1)}%` },
      { key: 'Chờ duyệt', value: submitted, note: `${((submitted/total)*100).toFixed(1)}%` },
      { key: 'Quá hạn', value: overdue, note: `${((overdue/total)*100).toFixed(1)}%` },
    ];
  }

  private generateTDPStatsData(reports: Report[]): any[] {
    const tdpMap = new Map<string, any>();

    reports.forEach(report => {
      const tdpName = report.assignedTo.tdpName;
      if (!tdpMap.has(tdpName)) {
        tdpMap.set(tdpName, {
          name: tdpName,
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0
        });
      }

      const tdpStats = tdpMap.get(tdpName);
      tdpStats.total++;
      
      if (report.status === 'approved') tdpStats.completed++;
      if (['pending', 'in_progress'].includes(report.status)) tdpStats.pending++;
      if (dayjs().isAfter(dayjs(report.dueDate)) && report.status !== 'approved') {
        tdpStats.overdue++;
      }
    });

    return Array.from(tdpMap.values()).map(stats => ({
      tdpName: stats.name,
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      overdue: stats.overdue,
      completionRate: ((stats.completed / stats.total) * 100).toFixed(1)
    }));
  }

  private generateStatusStatsData(reports: Report[]): any[] {
    const statusMap = new Map<string, number>();
    
    reports.forEach(report => {
      const status = this.getStatusText(report.status);
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = reports.length;
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }));
  }
}

export const excelExportService = new ExcelExportService();