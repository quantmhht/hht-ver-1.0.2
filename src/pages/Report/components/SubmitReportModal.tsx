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
      console.log('🔄 Initializing answers for report:', {
        reportId: report.id,
        questionsCount: report.questions?.length || 0,
        questions: report.questions?.map(q => ({ id: q.id, text: q.text.substring(0, 50) + '...' }))
      });

      // 🆕 IMPROVED: Khởi tạo answers cho TẤT CẢ câu hỏi
      const initialAnswers = report.questions.map((q, index) => {
        const initialValue = q.type === QuestionType.MULTIPLE_CHOICE ? [] : '';
        console.log(`  📝 Question ${index + 1} (${q.id}): type=${q.type}, initialValue=`, initialValue);
        
        return {
          questionId: q.id,
          value: initialValue
        };
      });
      
      console.log('✅ Initial answers created:', initialAnswers);
      setAnswers(initialAnswers);
    } else {
      setAnswers([]);
    }
  }, [report]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    console.log('📝 Answer changed:', {
      questionId,
      value,
      valueType: typeof value,
      isArray: Array.isArray(value)
    });

    setAnswers(prevAnswers => {
      const updatedAnswers = prevAnswers.map(ans =>
        ans.questionId === questionId ? { ...ans, value } : ans
      );
      
      console.log('🔄 Updated answers state:', updatedAnswers.map(a => ({
        questionId: a.questionId,
        value: a.value,
        hasValue: !!a.value && (Array.isArray(a.value) ? a.value.length > 0 : a.value.trim().length > 0)
      })));
      
      return updatedAnswers;
    });
  };
  
  const renderQuestionInput = (question: Question) => {
    const answer = answers.find(a => a.questionId === question.id);
    
    console.log(`🎨 Rendering question ${question.id}:`, {
      questionType: question.type,
      hasAnswer: !!answer,
      currentValue: answer?.value
    });

    if (!answer) {
      console.warn(`⚠️ No answer found for question ${question.id}`);
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
              console.log(`📝 Short answer change for ${question.id}:`, e.target.value);
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
                console.log(`📝 Single choice change for ${question.id}:`, stringValue);
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
                console.log(`📝 Multiple choice change for ${question.id}:`, stringVals);
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
        console.error(`❌ Unknown question type: ${question.type}`);
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!report || !user) {
      console.error('❌ Cannot submit: missing report or user');
      return;
    }

    console.log('🚀 Starting submission validation...');
    console.log('📋 Report questions:', report.questions.length);
    console.log('💬 Current answers:', answers.length);

    // 🆕 IMPROVED: Validation với detailed logging
    for (const question of report.questions) {
      console.log(`🔍 Validating question ${question.id} (required: ${question.isRequired})`);
      
      if (question.isRequired) {
        const answer = answers.find(a => a.questionId === question.id);
        
        if (!answer) {
          console.error(`❌ Missing answer for required question: ${question.id}`);
          openSnackbar({ text: `Vui lòng trả lời câu hỏi: "${question.text}"`, type: 'error' });
          return;
        }
        
        const isEmpty = Array.isArray(answer.value) 
          ? answer.value.length === 0 
          : !answer.value || answer.value.trim() === '';
        
        console.log(`  📝 Answer validation:`, {
          questionId: question.id,
          answerValue: answer.value,
          isEmpty,
          isArray: Array.isArray(answer.value)
        });
        
        if (isEmpty) {
          console.error(`❌ Empty answer for required question: ${question.id}`);
          openSnackbar({ text: `Vui lòng trả lời câu hỏi: "${question.text}"`, type: 'error' });
          return;
        }
      }
    }

    // 🐛 DEBUG: Log final answers before submission
    console.log('✅ Validation passed. Final answers to submit:');
    answers.forEach((answer, index) => {
      console.log(`  ${index + 1}. Question ${answer.questionId}:`, {
        value: answer.value,
        type: typeof answer.value,
        isEmpty: Array.isArray(answer.value) ? answer.value.length === 0 : !answer.value
      });
    });

    try {
      console.log('🚀 Submitting answers to store...');
      await submitAnswers(report.id, answers);
      
      console.log('✅ Answers submitted successfully');
      openSnackbar({ text: 'Nộp báo cáo thành công!', type: 'success' });
      onClose();
    } catch (error) {
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
        showBackIcon={true}
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