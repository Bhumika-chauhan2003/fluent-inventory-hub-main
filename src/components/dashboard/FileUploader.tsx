
import React from 'react';
import SmartFileUploader from '@/components/dashboard/SmartFileUploader';
import { Product } from '@/types';

interface FileUploaderProps {
  onUploadComplete: (products: Product[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  return (
    <SmartFileUploader
      onUploadComplete={onUploadComplete}
      allowedFileTypes={['.csv', '.xlsx', '.xls']}
      maxFileSizeMB={10}
    />
  );
};

export default FileUploader;
