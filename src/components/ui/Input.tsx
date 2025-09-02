import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  prefix,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 font-medium transition-all duration-200 text-base ${
            prefix ? 'pl-12' : ''
          } hover:border-gray-300 focus:shadow-lg`}
          style={{ minHeight: '56px' }} // Ensure minimum touch target size
        />
      </div>
    </div>
  );
};