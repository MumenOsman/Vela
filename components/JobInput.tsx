import React from 'react';

interface JobInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const JobInput: React.FC<JobInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 px-4">
      <textarea
        className="w-full h-56 p-6 border border-vela-light-border dark:border-vela-dark-border rounded-2xl bg-white dark:bg-vela-dark-surface text-vela-light-text dark:text-vela-dark-text focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};