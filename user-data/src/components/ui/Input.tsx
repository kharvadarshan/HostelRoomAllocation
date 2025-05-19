import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
}

export const Input = ({ 
  icon,
  endIcon, 
  className,
  ...props 
}: InputProps) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {icon}
        </div>
      )}
      <input
        className={`w-full rounded-md border border-gray-300 py-2 px-4 
          ${icon ? 'pl-10' : ''}
          ${endIcon ? 'pr-10' : ''}
          focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
          dark:focus:border-green-500 dark:focus:ring-green-500
          transition-colors duration-300
          ${className || ''}`}
        {...props}
      />
      {endIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {endIcon}
        </div>
      )}
    </div>
  );
}; 