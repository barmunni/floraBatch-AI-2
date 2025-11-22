export interface FlowerAnalysis {
  fileName: string;
  flowerName: string;
  geographicArea: string;
  confidence: number;
  timestamp: string;
}

export interface ProcessingItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: FlowerAnalysis;
  error?: string;
  previewUrl: string;
}

export interface AnalysisSummary {
  total: number;
  processed: number;
  success: number;
  failed: number;
}