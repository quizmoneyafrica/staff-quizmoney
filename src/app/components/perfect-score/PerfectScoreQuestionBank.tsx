import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

export default function PerfectScoreQuestionBank() {
  const [questionsLeft, setQuestionsLeft] = useState(500);
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();

  const handleUploadClick = () => {
    router.push('/perfect-score/upload-questions');
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        className="border-1 transform rounded-2xl border-[#17478B] bg-white px-8 py-10 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
        style={{
          boxShadow:
            '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors duration-200">
              Perfect score Question Bank
            </h1>
            <div className="flex items-baseline space-x-2">
              <span
                className="text-primary-800 text-4xl font-bold transition-all duration-300"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {questionsLeft}
              </span>
              <span className="text-primary-800 text-base font-medium">
                Questions left
              </span>
            </div>
          </div>

          {/* Right Section */}
          <button
            onClick={handleUploadClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="border-1 group relative overflow-hidden whitespace-nowrap rounded-sm border-gray-900 bg-white px-3 py-2 text-xs font-medium text-gray-900 transition-all duration-300 hover:bg-gray-900 hover:text-white hover:shadow-lg active:scale-95"
          >
            <div className="relative z-10 flex items-center space-x-2">
              <span>Upload questions</span>
            </div>

            <div
              className="absolute inset-0 -z-0 bg-gradient-to-r from-gray-900 to-gray-800 transition-transform duration-300 ease-out"
              style={{
                transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
