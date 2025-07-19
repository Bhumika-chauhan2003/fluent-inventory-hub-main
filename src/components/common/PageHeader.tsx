
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn("mb-6 flex flex-col md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
        {description && (
          <p className="mt-1 text-gray-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
