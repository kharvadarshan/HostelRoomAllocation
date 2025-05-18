import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = ({ 
  children, 
  className, 
  animate = true, 
  hover = true,
  ...props 
}) => {
  const baseClasses = "rounded-xl bg-white dark:bg-gray-800 shadow-md";
  
  return animate ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        baseClasses,
        hover && "hover:shadow-lg transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  ) : (
    <div 
      className={cn(
        baseClasses,
        hover && "hover:shadow-lg transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className, 
  ...props 
}) => (
  <div 
    className={cn(
      "px-6 py-4 border-b border-gray-100 dark:border-gray-700", 
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ 
  children, 
  className, 
  ...props 
}) => (
  <h3 
    className={cn(
      "text-xl font-bold text-gray-900 dark:text-white", 
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

const CardContent = ({ 
  children, 
  className, 
  ...props 
}) => (
  <div 
    className={cn(
      "px-6 py-5", 
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ 
  children, 
  className, 
  ...props 
}) => (
  <div 
    className={cn(
      "px-6 py-4 border-t border-gray-100 dark:border-gray-700", 
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter }; 