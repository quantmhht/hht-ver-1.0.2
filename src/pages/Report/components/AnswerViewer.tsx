import React from 'react';
import { Box } from 'zmp-ui';
import { Answer, Question } from '../../../types/report';

interface AnswerViewerProps {
  question: Question;
  answer?: Answer;
}

const AnswerViewer: React.FC<AnswerViewerProps> = ({ question, answer }) => {
  const renderAnswerContent = () => {
    if (!answer || !answer.value || (Array.isArray(answer.value) && answer.value.length === 0)) {
      return <p className="text-gray-500 italic">Chưa có câu trả lời</p>;
    }

    switch (question.type) {
      case 'short_answer':
        return <p className="text-gray-800 bg-gray-100 p-2 rounded-md">{answer.value}</p>;

      case 'single_choice': {
        const selectedOption = question.options?.find(opt => opt.id === answer.value);
        return <p className="text-gray-800 font-semibold">- {selectedOption?.value || 'Không rõ'}</p>;
      }

      case 'multiple_choice': {
        const selectedOptions = question.options?.filter(opt =>
          (answer.value as string[]).includes(opt.id)
        );
        return (
          <ul className="list-disc list-inside">
            {selectedOptions?.map(opt => (
              <li key={opt.id} className="text-gray-800">{opt.value}</li>
            ))}
          </ul>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Box my={3} className="border-b pb-3">
      <p className="font-semibold text-gray-900">{question.text}</p>
      <Box mt={1} pl={2}>
        {renderAnswerContent()}
      </Box>
    </Box>
  );
};

export default AnswerViewer;