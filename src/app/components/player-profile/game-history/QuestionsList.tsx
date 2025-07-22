import React from 'react';
import QuestionCard from './QuestionCard';
import { Question } from './types';

interface QuestionsListProps {
  questions: Question[];
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions }) => {
  return (
    <div className="space-y-[18px]">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
};

export default QuestionsList;
