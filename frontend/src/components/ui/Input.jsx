import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ 
  className, 
  type = 'text',
  error,
  icon: Icon,
  endIcon: EndIcon,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {Icon}
        </div>
      )}
      
      <input
        type={type}
        className={cn(
          "w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200",
          error 
            ? "border-red-500 focus:ring-red-500 text-red-500"
            : "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
          Icon && "pl-10",
          EndIcon && "pr-10",
          className
        )}
        ref={ref}
        {...props}
      />
      
      {EndIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {EndIcon}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input }; 