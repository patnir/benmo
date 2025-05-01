import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  inputMode?: 'decimal' | 'text' | 'numeric';
  suffix?: ReactNode;
  className?: string;
}

export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  inputMode,
  suffix,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative rounded-xl shadow-sm">
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          className={`
            block w-full rounded-xl px-4 py-3
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            bg-white dark:bg-gray-700
            border-2 transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
            }
            ${suffix ? 'pr-12' : ''}
          `}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
} 