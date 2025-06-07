import { FileQuestion } from 'lucide-react';

export function NoQuestions() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-lg bg-white p-8">
      <FileQuestion />
      <p>No Questions added yet</p>
    </div>
  );
}
