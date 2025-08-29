'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from '@tanstack/react-query';
import { Avatar, Table } from '@radix-ui/themes';
import { Search, Loader2 } from 'lucide-react';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import CategoryDropdown from '@/app/components/ui/CategoryDropdown';

import Pagination from '../leaderboard/Pagination';
import { formatDateTime } from '@/app/utils/utils';
import { useDebounce } from '@/app/hooks/useDebounce';
import { TotalMissesIcon } from '@/app/icons/icons';

import { Button } from '../ui/button';

interface MissedQuestionResponse {
  id: string;
  questionText: string;
  correctAnswer: string;
  missCount: number;
  missPercentage: number;
  category?: string;
  difficulty?: string;
  createdAt: string;
}

interface TopMissedQuestionTableProps {
  onDataChange?: () => void;
}

const TopMissedQuestionTable: React.FC<TopMissedQuestionTableProps> = ({
  onDataChange,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const queryClient = useQueryClient();

  const debouncedSearchTerm = useDebounce(searchTerm);
  const itemsPerPage = 10;

  const mockQuestions: MissedQuestionResponse[] = [
    {
      id: '1',
      questionText: 'What is the capital of France?',
      correctAnswer: 'Paris',
      missCount: 245,
      missPercentage: 45,
      category: 'Geography',
      difficulty: 'Easy',
      createdAt: '2024-02-21T09:00:00Z',
    },
    {
      id: '2',
      questionText: 'Which planet is known as the Red Planet?',
      correctAnswer: 'Mars',
      missCount: 145,
      missPercentage: 45,
      category: 'Science',
      difficulty: 'Medium',
      createdAt: '2024-02-21T09:00:00Z',
    },
    {
      id: '3',
      questionText: 'What is the chemical symbol for gold?',
      correctAnswer: 'Au',
      missCount: 150,
      missPercentage: 45,
      category: 'Science',
      difficulty: 'Medium',
      createdAt: '2024-02-21T09:00:00Z',
    },
    {
      id: '4',
      questionText: 'Who painted the Mona Lisa?',
      correctAnswer: 'Leonardo da Vinci',
      missCount: 245,
      missPercentage: 45,
      category: 'Art',
      difficulty: 'Easy',
      createdAt: '2024-02-21T09:00:00Z',
    },
    {
      id: '5',
      questionText: 'What is the largest mammal in the world?',
      correctAnswer: 'Blue Whale',
      missCount: 245,
      missPercentage: 45,
      category: 'Biology',
      difficulty: 'Easy',
      createdAt: '2024-02-21T09:00:00Z',
    },
  ];

  const categories = ['All', 'History'];

  const { data, isLoading, error, refetch } = useQuery<
    {
      success: boolean;
      code: string;
      message: string;
      data: {
        content: MissedQuestionResponse[];
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    },
    Error
  >({
    queryKey: [
      'topMissedQuestions',
      currentPage,
      debouncedSearchTerm,
      selectedCategory,
      selectedDateRange,
      customDateRange,
      itemsPerPage,
    ],
    queryFn: async () => {
      const filteredQuestions = mockQuestions.filter((question) => {
        const searchMatch =
          !debouncedSearchTerm ||
          question.questionText
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          question.correctAnswer
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase());

        const categoryMatch = selectedCategory === 'All';

        return searchMatch && categoryMatch;
      });

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

      return {
        success: true,
        code: '200',
        message: 'Success',
        data: {
          content: paginatedQuestions,
          pageNo: currentPage,
          pageSize: itemsPerPage,
          totalElements: filteredQuestions.length,
          totalPages: Math.ceil(filteredQuestions.length / itemsPerPage),
          last:
            currentPage >= Math.ceil(filteredQuestions.length / itemsPerPage),
        },
      };
    },
    placeholderData: keepPreviousData,
  });

  const questions = data?.data?.content || [];
  const pagination = data?.data;
  const totalCount = pagination?.totalElements || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleViewDetailsClick = (question: MissedQuestionResponse) => {
    router.push(`/top-missed-question/details?id=${question.id}`);
  };

  const handleExportCSV = () => {};

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-600">Failed to load missed questions</p>
        <button
          onClick={() => refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search Question"
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
            />
          </div>

          <TimeRangeDropdown
            options={['All Time', 'This Week', 'Last 30 days', 'Custom']}
            selected={selectedDateRange}
            onSelect={setSelectedDateRange}
            customDateRange={customDateRange}
            onCustomDateChange={setCustomDateRange}
          />

          <CategoryDropdown
            selected={selectedCategory}
            options={categories}
            onSelect={handleCategorySelect}
          />
        </div>

        <Button
          onClick={handleExportCSV}
          className="rounded-full bg-blue-900 px-6 py-2 text-white hover:bg-blue-700"
        >
          Export CSV
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <Table.Root variant="ghost" className="w-full min-w-[800px] text-sm">
            <Table.Header className="bg-gray-50">
              <Table.Row>
                <Table.Cell className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  S/N
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Question
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Misses
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Correct answer
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Action
                </Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body className="bg-white">
              {questions.length > 0 ? (
                questions.map((question, index) => {
                  const serialNumber =
                    (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <Table.Row
                      key={question.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <Table.Cell className="px-4 py-4 font-medium text-gray-900">
                        {serialNumber}
                      </Table.Cell>

                      <Table.Cell className="max-w-md px-4 py-4">
                        <p className="line-clamp-2 text-gray-900">
                          {question.questionText}
                        </p>
                        <div className="h-6"></div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <div>
                          <span className="font-semibold text-red-600">
                            {question.missCount}
                          </span>
                          <span className="ml-1 text-gray-500">
                            ({question.missPercentage}%)
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <span className="font-medium text-green-700">
                          {question.correctAnswer}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <Button
                          onClick={() => handleViewDetailsClick(question)}
                          className="rounded-full bg-blue-900 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                        >
                          View Details
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={5}
                    className="py-12 text-center font-bold text-gray-500"
                  >
                    No questions found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      )}

      {pagination && totalCount > 0 && (
        <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            Showing data 1 to {Math.min(itemsPerPage, totalCount)} of{' '}
            {totalCount} entries
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TopMissedQuestionTable;
