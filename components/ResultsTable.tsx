import React from 'react';
import { ProcessingItem } from '../types';
import { CheckCircle, XCircle, Loader2, MapPin, Flower } from 'lucide-react';

interface ResultsTableProps {
  items: ProcessingItem[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ items }) => {
  // Show only the last 5 items or relevant ones to keep UI clean, or show all in a scrollable area
  // We will show a scrollable list of all items.
  
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Analysis Results ({items.length})</h3>
      </div>
      
      <div className="overflow-y-auto flex-1 p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10 text-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">File Name</th>
              <th className="px-4 py-3">Flower Type</th>
              <th className="px-4 py-3">Region</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {item.status === 'completed' && <CheckCircle className="text-emerald-500" size={18} />}
                  {item.status === 'error' && <XCircle className="text-red-500" size={18} />}
                  {item.status === 'processing' && <Loader2 className="text-blue-500 animate-spin" size={18} />}
                  {item.status === 'pending' && <span className="w-4 h-4 block rounded-full border-2 border-gray-200"></span>}
                </td>
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-700 truncate max-w-[150px]" title={item.file.name}>
                  {item.file.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.result ? (
                    <span className="flex items-center">
                      <Flower size={14} className="mr-1 text-pink-400" />
                      {item.result.flowerName}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.result ? (
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1 text-blue-400" />
                      {item.result.geographicArea}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;