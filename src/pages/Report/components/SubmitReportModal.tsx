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
      const initialAnswers = report.questions.map(q => ({
        questionId: q.id,
        value: q.type === QuestionType.MULTIPLE_CHOICE ? [] : ''
      }));
      setAnswers(initialAnswers);
    }
  }, [report]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(ans =>
        ans.questionId === questionId ? { ...ans, value } : ans
      )
    );
  };
  
  const renderQuestionInput = (question: Question) => {
    const answer = answers.find(a => a.questionId === question.id);
    if (!answer) return null;

    switch (question.type) {
      case QuestionType.SHORT_ANSWER:
        return (
          <Input.TextArea
            label={question.text}
            required={question.isRequired}
            value={answer.value as string}
            onChange={e => handleAnswerChange(question.id, e.target.value)}
            className="mt-2"
          />
        );
      case QuestionType.SINGLE_CHOICE:
        return (
          <Box my={2}>
            <p className="text-gray-800">{question.text} {question.isRequired && <span className="text-red-500">*</span>}</p>
            <Radio.Group
              value={answer.value as string}
              onChange={(val) => handleAnswerChange(question.id, String(val))}
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
            <p className="text-gray-800">{question.text} {question.isRequired && <span className="text-red-500">*</span>}</p>
            <Checkbox.Group
              value={answer.value as string[]}
              // SỬA LỖI: Chuyển đổi tất cả giá trị trong mảng thành string
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
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!report || !user) return;

    for (const question of report.questions) {
      if (question.isRequired) {
        const answer = answers.find(a => a.questionId === question.id);
        const isEmpty = !answer || (Array.isArray(answer.value) ? answer.value.length === 0 : !answer.value.trim());
        if (isEmpty) {
          openSnackbar({ text: `Vui lòng trả lời câu hỏi: "${question.text}"`, type: 'error' });
          return;
        }
      }
    }

    await submitAnswers(report.id, answers);
    openSnackbar({ text: 'Nộp báo cáo thành công!', type: 'success' });
    onClose();
  };

  return (
    <Modal
      visible={!!report}
      onClose={onClose}
      title="Nộp Báo Cáo"
    >
        <Header 
          title={report?.title || "Nộp báo cáo"} 
          showBackIcon={true}
          onBackClick={onClose} 
        />
        <Box p={4} className="overflow-y-auto" style={{maxHeight: '70vh'}}>
            <p className="text-gray-500 mb-4">Vui lòng hoàn thành các nội dung dưới đây.</p>
            {report?.questions.map(q => (
                <Box key={q.id} className="mb-4">
                    {renderQuestionInput(q)}
                </Box>
            ))}
            <Button
                fullWidth
                onClick={handleSubmit}
                loading={loading}
            >
                Xác nhận nộp
            </Button>
        </Box>
    </Modal>
  );
};

export default SubmitReportModal;