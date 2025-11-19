import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
    </div>
  );
};
