'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Target, Clock, Eraser } from 'lucide-react';

interface AnswerOption {
  option: string;
  answerText: string;
  responses: number;
  percentage: number;
}

interface QuestionAnalytics {
  totalAttempts: number;
  missedRate: number;
  averageTimeSpent: string;
  eraserUsed: number;
}

interface QuestionDetailsProps {
  questionId?: string;
}

const QuestionDetailsPage: React.FC<QuestionDetailsProps> = () => {
  const params = useParams();
  const router = useRouter();
  const questionId = params?.id as string;

  const questionData = {
    id: questionId,
    title: 'Question 1',
    question: 'What is the capital of France?',
    answers: [
      { option: 'A', answerText: 'Paris', responses: 823, percentage: 60 },
      { option: 'B', answerText: 'lagos', responses: 150, percentage: 24 },
      { option: 'C', answerText: 'Cameroon', responses: 80, percentage: 6 },
      { option: 'D', answerText: 'England', responses: 100, percentage: 10 },
    ] as AnswerOption[],
    analytics: {
      totalAttempts: 1300,
      missedRate: 40,
      averageTimeSpent: '00:05:00 sec',
      eraserUsed: 400,
    } as QuestionAnalytics,
  };

  const getBarWidth = (percentage: number) => {
    return `${percentage}%`;
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 20) return 'bg-blue-500';
    if (percentage >= 10) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Missed Questions
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Question Details</h1>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 p-6">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {questionData.title}
        </h2>
        <p className="text-lg text-gray-700">{questionData.question}</p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Answer Options
        </h3>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="grid grid-cols-4 gap-4 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
            <div>Option</div>
            <div>Answer Text</div>
            <div>Responses</div>
            <div>Percentage</div>
          </div>

          {questionData.answers.map((answer, index) => (
            <div
              key={answer.option}
              className={`grid grid-cols-4 items-center gap-4 border-t border-gray-200 px-6 py-4 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="font-medium text-gray-900">{answer.option}</div>
              <div className="text-gray-700">{answer.answerText}</div>
              <div className="font-semibold text-gray-900">
                {answer.responses}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                      answer.percentage,
                    )}`}
                    style={{ width: getBarWidth(answer.percentage) }}
                  />
                </div>
                <span className="min-w-[3rem] text-right font-semibold text-gray-900">
                  {answer.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">
          Analytics Summary
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-base text-gray-500">Total Attempts</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {questionData.analytics.totalAttempts.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-600">
                  <span className="text-sm font-bold text-red-600">?</span>
                </div>
              </div>
              <span className="text-base text-gray-500">Missed Rate</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {questionData.analytics.missedRate}%
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-base text-gray-500">
                Average Time spent
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {questionData.analytics.averageTimeSpent}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-2">
                <Eraser className="h-6 w-6 text-cyan-600" />
              </div>
              <span className="text-base text-gray-500">Eraser Used</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {questionData.analytics.eraserUsed}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailsPage;
