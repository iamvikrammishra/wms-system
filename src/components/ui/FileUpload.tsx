import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../../types';

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  acceptedFileTypes = '.csv, .xlsx, .xls',
  maxFileSize = 10, // 10MB
  multiple = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = Array.from(fileList).map((file) => {
        // Check file size
        const isValidSize = file.size <= maxFileSize * 1024 * 1024;
        
        // Create upload file object
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: file.size,
          type: file.type,
          status: isValidSize ? 'uploading' : 'error',
          progress: 0,
          error: isValidSize ? undefined : `File exceeds ${maxFileSize}MB limit`,
        };

        // Simulate upload progress for valid files
        if (isValidSize) {
          const interval = setInterval(() => {
            setFiles((prevFiles) => {
              return prevFiles.map((f) => {
                if (f.id === uploadedFile.id) {
                  const newProgress = Math.min(f.progress + 10, 100);
                  const newStatus = newProgress === 100 ? 'success' : 'uploading';
                  
                  if (newProgress === 100) {
                    clearInterval(interval);
                  }
                  
                  return {
                    ...f,
                    progress: newProgress,
                    status: newStatus,
                  };
                }
                return f;
              });
            });
          }, 300);
        }
        
        return uploadedFile;
      });

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      if (onFilesUploaded) {
        onFilesUploaded(newFiles);
      }
    },
    [maxFileSize, onFilesUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  }, []);

  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } flex flex-col items-center justify-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />
        
        <div className="p-3 rounded-full bg-blue-100 mb-3">
          <Upload className="h-6 w-6 text-blue-600" />
        </div>
        
        <p className="text-sm font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        
        <p className="text-xs text-gray-500 mb-2">or click to browse</p>
        
        <p className="text-xs text-gray-500 text-center">
          Accepted file types: {acceptedFileTypes}
          <br />
          Max file size: {maxFileSize}MB
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Uploaded Files</p>
          
          {files.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center">
              <div className="p-2 bg-gray-100 rounded-md mr-3">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                
                <div className="flex items-center text-xs text-gray-500">
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  
                  {file.status === 'uploading' && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Uploading {file.progress}%</span>
                    </>
                  )}
                </div>
                
                {file.status === 'uploading' && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                
                {file.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </div>
              
              <div className="ml-2 flex-shrink-0">
                {file.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;