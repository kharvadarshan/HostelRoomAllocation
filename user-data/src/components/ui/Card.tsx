import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return (
    <div className={`rounded-lg bg-white shadow-md dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300 ${className || ''}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }: CardProps) => {
  return <div className={`p-6 transition-colors duration-300 ${className || ''}`}>{children}</div>;
};

export const CardTitle = ({ className, children }: CardProps) => {
  return <h2 className={`text-xl font-bold transition-colors duration-300 ${className || ''}`}>{children}</h2>;
};

export const CardContent = ({ className, children }: CardProps) => {
  return <div className={`p-6 transition-colors duration-300 ${className || ''}`}>{children}</div>;
};

export const CardFooter = ({ className, children }: CardProps) => {
  return <div className={`p-6 border-t dark:border-gray-700 transition-colors duration-300 ${className || ''}`}>{children}</div>;
}; 