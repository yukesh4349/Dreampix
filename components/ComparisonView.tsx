import React from 'react';
import { GenerationResult } from '../types';
import ImageResult from './ImageResult';

interface ComparisonViewProps {
  result: GenerationResult;
  onReusePrompt: (prompt: string) => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, onReusePrompt }) => {
  if (!result.enhanced) return null;

  const originalImages = Array.isArray(result.original) ? result.original : [result.original];
  const enhancedImages = Array.isArray(result.enhanced) ? result.enhanced : [result.enhanced];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
           <h3 className="text-center font-bold text-gray-700 dark:text-slate-300">Original Prompt Results</h3>
           <div className={`grid gap-4 ${originalImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
             {originalImages.map((img) => (
               <ImageResult key={img.id} image={img} onReusePrompt={onReusePrompt} />
             ))}
           </div>
        </div>
        
        <div className="space-y-4 relative">
           <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg animate-bounce-slow">
             Enhanced AI
           </div>
           <h3 className="text-center font-bold text-gray-700 dark:text-slate-300">Enhanced Prompt Results</h3>
           <div className={`grid gap-4 ${enhancedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
             {enhancedImages.map((img) => (
               <ImageResult key={img.id} image={img} onReusePrompt={onReusePrompt} />
             ))}
           </div>
        </div>
      </div>

      {result.collage && (
         <div className="max-w-xl mx-auto pt-8 border-t border-gray-200 dark:border-slate-800">
            <h3 className="text-center text-xl font-bold mb-6 text-gray-800 dark:text-white">Enhanced Collage</h3>
            <ImageResult image={result.collage} onReusePrompt={onReusePrompt} />
         </div>
      )}

      {result.explanation && (
        <div className="bg-white dark:bg-slate-800/60 border border-primary/20 p-6 rounded-2xl backdrop-blur-sm shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.45l7.5 7.432A9 9 0 013 16.5c0-4.86 3.868-8.818 8.625-9.125L13.5 11.25H12zM3.75 7.5h6M3.75 12h1.5m-1.5 4.5h1.5M3.75 3h1.5M16.5 3.75H21m-4.5 4.5H21m-4.5 4.5H21" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Prompt Optimization Guidance</h3>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
