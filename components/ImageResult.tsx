import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { storageService } from '../services/storageService';
import Button from './Button';

interface ImageResultProps {
  image: GeneratedImage;
  title?: string;
  onReusePrompt?: (prompt: string) => void;
}

const ImageResult: React.FC<ImageResultProps> = ({ image, title, onReusePrompt }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    try {
      await storageService.saveImage(image);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000); // Reset feedback
    } catch (e) {
      console.error("Failed to save", e);
      alert("Could not save to gallery. Storage might be full.");
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.imageData}`;
    link.download = `dreampix-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const promptText = image.enhancedPrompt || image.prompt;

  return (
    <div className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col h-full transition-colors">
      {title && <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 font-semibold text-center text-gray-700 dark:text-slate-200">{title}</div>}
      
      <div className="relative aspect-square bg-gray-100 dark:bg-slate-900 group">
        <img 
          src={`data:image/png;base64,${image.imageData}`} 
          alt={image.prompt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
             <p className="text-white text-sm px-4 text-center line-clamp-2">{promptText}</p>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
             <p className="text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">Prompt Used</p>
             {onReusePrompt && (
                <button 
                  onClick={() => onReusePrompt(promptText)}
                  className="text-xs text-primary hover:text-secondary font-medium transition-colors flex items-center gap-1"
                  title="Use this prompt"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                   </svg>
                   Use
                </button>
             )}
          </div>
          <p 
            className={`text-sm text-gray-800 dark:text-slate-300 line-clamp-3 ${onReusePrompt ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded p-1 -m-1 transition-colors' : ''}`}
            onClick={() => onReusePrompt && onReusePrompt(promptText)}
            title={onReusePrompt ? "Click to use this prompt" : ""}
          >
            {promptText}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="secondary" 
            onClick={handleDownload} 
            className="flex-1 py-2 text-sm"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3" />
              </svg>
            }
          >
            Download
          </Button>
          <Button 
            variant={isSaved ? "ghost" : "outline"}
            onClick={handleSave} 
            className={`flex-1 py-2 text-sm ${isSaved ? 'text-green-600 dark:text-green-400' : ''}`}
            disabled={isSaved}
            icon={
              isSaved ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )
            }
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageResult;
