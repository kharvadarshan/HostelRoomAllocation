import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { FiLoader } from 'react-icons/fi';

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon,
  onClick,
  type = 'button',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define variants
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    outline: 'bg-transparent border border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  // Define sizes
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md',
    md: 'text-sm px-4 py-2 rounded-lg',
    lg: 'text-base px-6 py-3 rounded-lg',
    xl: 'text-lg px-8 py-4 rounded-lg',
  };

  return (
    <motion.button
      type={type}
      className={cn(
        'relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-70 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {isLoading && (
        <FiLoader className="mr-2 h-4 w-4 animate-spin" />
      )}
      {icon && !isLoading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      
      {/* Hover animation */}
      {isHovered && !disabled && !isLoading && (
        <motion.span
          layoutId="hoverBg"
          className="absolute inset-0 -z-10 rounded-lg bg-black/5 dark:bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  );
};

export { Button }; 