import React, { useEffect, useState } from 'react';
import { GeneratedImage, Language } from '../types';
import { storageService } from '../services/storageService';
import { getTranslation } from '../utils/translations';
import Button from './Button';

interface HistoryProps {
  language: Language;
  onReusePrompt: (prompt: string) => void;
}

const History: React.FC<HistoryProps> = ({ language, onReusePrompt }) => {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await storageService.getHistory();
      setHistory(stored);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your generation history? This cannot be undone.")) {
        await storageService.clearHistory();
        setHistory([]);
    }
  };

  const t = (key: any) => getTranslation(language, key);

  if (loading) {
    return <div className="text-center py-20 text-gray-500 dark:text-slate-400">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
         <div className="bg-gray-100 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 dark:text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('no_images')}</h3>
        <p className="text-gray-500 dark:text-slate-400">{t('start_generating')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button variant="ghost" onClick={handleClearHistory} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs py-1">
                {t('clear_history')}
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
        {history.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 rounded-xl p-4 flex gap-4 hover:border-primary/30 transition-colors shadow-sm">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-200 dark:bg-slate-900 rounded-lg overflow-hidden">
                    <img src={`data:image/png;base64,${item.imageData}`} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                             <span className="text-xs text-gray-500 dark:text-slate-500 font-mono">
                                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                             </span>
                             {item.isEnhancedVersion && (
                                <span className="bg-primary/10 dark:bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Enhanced</span>
                             )}
                             {item.isCollage && (
                                <span className="bg-secondary/10 dark:bg-secondary/20 text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Collage</span>
                             )}
                              <span className="bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{item.aspectRatio || '1:1'}</span>
                        </div>
                        <p className="text-gray-800 dark:text-slate-200 text-sm line-clamp-2 sm:line-clamp-3 mb-2">{item.prompt}</p>
                    </div>
                    
                    <div className="flex justify-end">
                         <Button 
                            variant="secondary" 
                            onClick={() => onReusePrompt(item.prompt)}
                            className="text-xs py-2 px-4 h-auto"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            }
                        >
                            {t('reuse_prompt')}
                        </Button>
                    </div>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default History;
