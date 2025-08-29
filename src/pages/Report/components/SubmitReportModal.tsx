import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Button,
  Input,
  Radio,
  Checkbox,
  useSnackbar,
  Header,
  Text,
} from 'zmp-ui';
import { useStore } from '../../../store';
import { Report, Answer, QuestionType, Question } from '../../../types/report';

interface SubmitReportModalProps {
  report: Report | null;
  onClose: () => void;
}

const SubmitReportModal: React.FC<SubmitReportModalProps> = ({ report, onClose }) => {
  const { submitAnswers, loading, user } = useStore();
  const { openSnackbar } = useSnackbar();
  
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (report) {

      // 🆕 IMPROVED: Khởi tạo answers cho TẤT CẢ câu hỏi
      const initialAnswers = report.questions.map((q) => {
        const initialValue = q.type === QuestionType.MULTIPLE_CHOICE ? [] : '';
        
        return {
          questionId: q.id,
          value: initialValue
        };
      });
      
      setAnswers(initialAnswers);
    } else {
      setAnswers([]);
    }
  }, [report]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {

    setAnswers(prevAnswers => {
      const updatedAnswers = prevAnswers.map(ans =>
        ans.questionId === questionId ? { ...ans, value } : ans
      );
      
      
      return updatedAnswers;
    });
  };
  
  const renderQuestionInput = (question: Question) => {
    const answer = answers.find(a => a.questionId === question.id);
    

    if (!answer) {
      return null;
    }

    switch (question.type) {
      case QuestionType.SHORT_ANSWER:
        return (
          <Input.TextArea
            label={question.text}
            required={question.isRequired}
            value={answer.value as string}
            onChange={e => {
              handleAnswerChange(question.id, e.target.value);
            }}
            className="mt-2"
            placeholder="Nhập câu trả lời của bạn..."
          />
        );
        
      case QuestionType.SINGLE_CHOICE:
        return (
          <Box my={2}>
            <p className="text-gray-800 mb-2">
              {question.text} {question.isRequired && <span className="text-red-500">*</span>}
            </p>
            <Radio.Group
              value={answer.value as string}
              onChange={(val) => {
                const stringValue = String(val);
                handleAnswerChange(question.id, stringValue);
              }}
            >
              {question.options?.map(opt => (
                <Radio key={opt.id} value={opt.id}>{opt.value}</Radio>
              ))}
            </Radio.Group>
          </Box>
        );
        
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <Box my={2}>
            <p className="text-gray-800 mb-2">
              {question.text} {question.isRequired && <span className="text-red-500">*</span>}
            </p>
            <Checkbox.Group
              value={answer.value as string[]}
              onChange={(vals) => {
                const stringVals = vals.map(v => String(v));
                handleAnswerChange(question.id, stringVals);
              }}
            >
              {question.options?.map(opt => (
                <Checkbox key={opt.id} value={opt.id}>{opt.value}</Checkbox>
              ))}
            </Checkbox.Group>
          </Box>
        );
        
      default:
        // eslint-disable-next-line no-console
        console.error(`❌ Unknown question type: ${question.type}`);
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!report || !user) {
      // eslint-disable-next-line no-console
      console.error('❌ Cannot submit: missing report or user');
      return;
    }


    // 🆕 IMPROVED: Validation với detailed logging
    const requiredQuestions = report.questions.filter(q => q.isRequired);
    const invalidQuestion = requiredQuestions.find(question => {
      const answer = answers.find(a => a.questionId === question.id);
      
      if (!answer) {
        // eslint-disable-next-line no-console
        console.error(`❌ Missing answer for required question: ${question.id}`);
        return true;
      }
      
      const isEmpty = Array.isArray(answer.value) 
        ? answer.value.length === 0 
        : !answer.value || answer.value.trim() === '';
      
      if (isEmpty) {
        // eslint-disable-next-line no-console
        console.error(`❌ Empty answer for required question: ${question.id}`);
        return true;
      }
      
      return false;
    });

    if (invalidQuestion) {
      openSnackbar({ text: `Vui lòng trả lời câu hỏi: "${invalidQuestion.text}"`, type: 'error' });
      return;
    }


    try {
      await submitAnswers(report.id, answers);
      
      openSnackbar({ text: 'Nộp báo cáo thành công!', type: 'success' });
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error submitting answers:', error);
      openSnackbar({ text: 'Có lỗi xảy ra khi nộp báo cáo!', type: 'error' });
    }
  };

  if (!report) {
    return null;
  }

  return (
    <Modal
      visible={!!report}
      onClose={onClose}
      title="Nộp Báo Cáo"
    >
      <Header 
        title={report?.title || "Nộp báo cáo"} 
        showBackIcon
        onBackClick={onClose} 
      />
      <Box p={4} className="overflow-y-auto" style={{maxHeight: '70vh'}}>
        <p className="text-gray-500 mb-4">
          Vui lòng hoàn thành các nội dung dưới đây. ({report.questions.length} câu hỏi)
        </p>
        
        {/* 🆕 Debug info trong development */}
        {import.meta.env.DEV && (
          <Box className="mb-4 p-3 bg-yellow-50 rounded text-xs border border-yellow-200">
            <Text size="xSmall" className="font-mono">
              🐛 Debug: {report.questions.length} questions, {answers.length} answers initialized
            </Text>
          </Box>
        )}
        
        {report?.questions.map((q, index) => (
          <Box key={q.id} className="mb-6">
            <Text size="small" className="text-gray-500 mb-2">
              Câu hỏi {index + 1}/{report.questions.length}
              {import.meta.env.DEV && <span className="text-gray-400 ml-2">({q.id})</span>}
            </Text>
            {renderQuestionInput(q)}
          </Box>
        ))}
        
        <Button
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          className="mt-4"
        >
          Xác nhận nộp ({answers.filter(a => 
            Array.isArray(a.value) ? a.value.length > 0 : !!a.value
          ).length}/{report.questions.length})
        </Button>
      </Box>
    </Modal>
  );
};

export default SubmitReportModal;