import React, { useRef, ChangeEvent } from 'react';
import { FolderUp, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface BatchUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const BatchUploader: React.FC<BatchUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelection = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const validFiles: File[] = [];
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

      // Explicitly type the iterator variable to File to prevent 'unknown' type errors
      Array.from(event.target.files).forEach((file: File) => {
        if (validTypes.includes(file.type)) {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      } else {
        alert("No valid image files found in the selected folder.");
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
          ${isProcessing 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50' 
            : 'border-emerald-400 bg-white hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow-md'
          }
        `}
        onClick={!isProcessing ? handleButtonClick : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFolderSelection}
          className="hidden"
          // Use casting to support non-standard webkitdirectory attributes without module augmentation issues
          {...({ webkitdirectory: "true", directory: "true" } as any)}
          multiple
          accept="image/*"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isProcessing ? 'bg-gray-200' : 'bg-emerald-100 text-emerald-600'}`}>
            <FolderUp size={40} strokeWidth={1.5} />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {isProcessing ? 'Processing Started...' : 'Select Image Folder'}
            </h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Click to select a folder containing flower images. We will analyze all images inside automatically.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-4">
            <span className="flex items-center"><ImageIcon size={14} className="mr-1" /> JPEG, PNG, WEBP</span>
            <span className="flex items-center"><AlertCircle size={14} className="mr-1" /> Directories Supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchUploader;