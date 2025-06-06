import { FileQuestion } from "lucide-react";

export function NoQuestions() {
  return (
    <div className="flex flex-col gap-5 bg-white items-center justify-center p-8 rounded-lg">
      <FileQuestion />
      <p>No Questions added yet</p>
    </div>
  );
}
