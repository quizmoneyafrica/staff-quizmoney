import React, { useState, useRef } from 'react';
import { ArrowLeft, CloudUpload } from 'lucide-react';

interface Question {
  question: string;
  answer: string;
}

export default function JSONUploadPreview() {
  const [jsonContent, setJsonContent] = useState<Question[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file && file.type === 'application/json') {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setJsonContent(json);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadQuestions = () => {};

  const handleGoBack = () => {};

  return (
    <div className="mx-auto max-w-7xl">
      <button
        onClick={handleGoBack}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:text-gray-900 sm:mb-8 sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 sm:h-5 sm:w-5" />
        <span>Go Back</span>
      </button>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        className={`mb-6 cursor-pointer rounded-2xl border-2 border-dashed bg-white px-6 py-12 transition-all duration-300 sm:mb-8 sm:px-8 sm:py-16 lg:px-12 lg:py-20 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          <div className="rounded-full bg-gray-100 p-3 transition-all duration-300 group-hover:bg-blue-100 sm:p-4">
            <CloudUpload className="h-8 w-8 text-gray-600 transition-colors duration-300 group-hover:text-blue-600 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg lg:text-xl">
            Upload File
          </h3>
          <p className="text-xs text-red-500 sm:text-sm">
            Only JSON file supported
          </p>
          {fileName && (
            <p className="mt-2 text-xs text-green-600 sm:text-sm">
              Selected: {fileName}
            </p>
          )}
        </div>
      </div>

      {/* JSON Preview */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl lg:text-2xl">
          JSON Preview
        </h2>
        <div className="overflow-hidden rounded-2xl border-2 border-gray-300 bg-white">
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-800 sm:p-6 sm:text-sm lg:p-8 lg:text-base">
            {jsonContent.length > 0 ? (
              <code className="font-mono">
                {JSON.stringify(jsonContent, null, 2)}
              </code>
            ) : (
              <code className="font-mono text-gray-400">
                {`[\n  {\n    "question": "The Pacific Ocean is the largest ocean in the world.",\n    "answer": "True"\n  },\n  {\n    "question": "Mount Kilimanjaro is located in Kenya.",\n    "answer": "False"\n  },\n  {\n    "question": "Mount Kilimanjaro is located in Kenya.",\n    "answer": "False"\n  }\n]`}
              </code>
            )}
          </pre>
        </div>
      </div>

      <button
        onClick={handleUploadQuestions}
        disabled={jsonContent.length === 0}
        className="group relative overflow-hidden rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#1d4ed8] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none sm:px-8 sm:py-3.5 sm:text-base lg:px-10 lg:py-4"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <CloudUpload className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-5 sm:w-5" />
          Upload questions
        </span>
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    </div>
  );
}
