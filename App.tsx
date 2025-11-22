import React, { useState, useCallback } from 'react';
import { ProcessingItem, AnalysisSummary } from './types';
import { analyzeFlowerImage } from './services/geminiService';
import BatchUploader from './components/BatchUploader';
import ResultsTable from './components/ResultsTable';
import { downloadCSV } from './utils/csvExport';
import { FileSpreadsheet, Sprout, Zap, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<ProcessingItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<AnalysisSummary>({ total: 0, processed: 0, success: 0, failed: 0 });

  // Helper to create a processing item from a file
  const createProcessingItem = (file: File): ProcessingItem => ({
    id: Math.random().toString(36).substring(2, 15),
    file,
    status: 'pending',
    previewUrl: URL.createObjectURL(file),
  });

  const processQueue = async (queue: ProcessingItem[]) => {
    // Process files sequentially to ensure stability and avoid rate limits,
    // though Gemini 2.5 Flash is fast. We update state after each one.
    for (const item of queue) {
      // Update status to processing
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));

      try {
        const result = await analyzeFlowerImage(item.file);
        
        setItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'completed', result } : i
        ));
        setSummary(prev => ({ ...prev, processed: prev.processed + 1, success: prev.success + 1 }));
        
      } catch (error) {
        setItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'error', error: (error as Error).message } : i
        ));
        setSummary(prev => ({ ...prev, processed: prev.processed + 1, failed: prev.failed + 1 }));
      }
    }
    setIsProcessing(false);
  };

  const handleFilesSelected = (files: File[]) => {
    // Reset state for new batch
    const newItems = files.map(createProcessingItem);
    setItems(newItems);
    setSummary({ total: newItems.length, processed: 0, success: 0, failed: 0 });
    setIsProcessing(true);
    
    // Start processing
    processQueue(newItems);
  };

  const handleExport = () => {
    const completedResults = items
      .filter(i => i.status === 'completed' && i.result)
      .map(i => i.result!);
    
    if (completedResults.length > 0) {
      downloadCSV(completedResults);
    } else {
      alert("No results to export yet.");
    }
  };

  // Calculate progress percentage
  const progress = summary.total > 0 ? (summary.processed / summary.total) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Sprout className="text-emerald-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">FloraBatch AI</h1>
              <p className="text-xs text-gray-500">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          
          {summary.success > 0 && !isProcessing && (
             <button
             onClick={handleExport}
             className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm text-sm font-medium"
           >
             <FileSpreadsheet size={18} className="mr-2" />
             Download CSV Report
           </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Introduction / Uploader */}
        {items.length === 0 && (
          <div className="mt-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Automated Flower Identification
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload an entire folder of images. Our AI agent will identify the species, 
                determine the native region, and generate a spreadsheet report for you.
              </p>
            </div>
            <BatchUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
          </div>
        )}

        {/* Progress Dashboard */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            
            {/* Left Panel: Stats & Actions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Progress Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Batch Progress</h3>
                  {isProcessing ? (
                     <span className="flex items-center text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                       <Loader2 className="animate-spin mr-1" size={12} /> Processing
                     </span>
                  ) : (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{summary.processed} / {summary.total} images</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Current Status Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="font-semibold text-gray-800 mb-4">Analysis Stats</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="block text-2xl font-bold text-green-700">{summary.success}</span>
                      <span className="text-xs text-green-600">Identified</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <span className="block text-2xl font-bold text-red-700">{summary.failed}</span>
                      <span className="text-xs text-red-600">Failed</span>
                    </div>
                 </div>
              </div>

              {/* Reset Action */}
              {!isProcessing && (
                <button 
                  onClick={() => setItems([])}
                  className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Start New Batch
                </button>
              )}
            </div>

            {/* Right Panel: Results Table */}
            <div className="lg:col-span-2 h-full overflow-hidden">
              <ResultsTable items={items} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;