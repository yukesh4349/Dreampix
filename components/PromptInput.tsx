import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { AspectRatio, ImageCount, Language } from '../types';
import { getTranslation } from '../utils/translations';
import PromptBuilder from './PromptBuilder';

interface PromptInputProps {
  onGenerate: (prompt: string, enhance: boolean, aspectRatio: AspectRatio, count: ImageCount, imageInput?: string) => void;
  isGenerating: boolean;
  language: Language;
  initialPrompt?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating, language, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isListening, setIsListening] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageCount, setImageCount] = useState<ImageCount>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (enhance: boolean) => {
    if (!prompt.trim()) return;
    onGenerate(prompt, enhance, aspectRatio, imageCount, selectedImage || undefined);
  };

  const handleBuilderApply = (builtPrompt: string) => {
    setPrompt(builtPrompt);
  };

  const t = (key: any) => getTranslation(language, key);

  const ratios: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
    { value: '1:1', label: '1:1', icon: <div className="w-4 h-4 border-2 border-current rounded-sm" /> },
    { value: '16:9', label: '16:9', icon: <div className="w-5 h-3 border-2 border-current rounded-sm" /> },
    { value: '9:16', label: '9:16', icon: <div className="w-3 h-5 border-2 border-current rounded-sm" /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      <PromptBuilder 
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onApply={handleBuilderApply}
        language={language}
      />

      <div className="relative group">
         {/* Subtle Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
        
        <div className="relative bg-white dark:bg-slate-900 rounded-xl flex flex-col shadow-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden transition-colors">
          <div className="flex flex-col md:flex-row">
            {selectedImage && (
              <div className="relative w-full md:w-32 h-32 md:h-auto border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-black/20 group/img">
                <img 
                  src={`data:image/png;base64,${selectedImage}`} 
                  alt="Reference" 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                   Ref Image
                </div>
              </div>
            )}
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('prompt_placeholder')}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 p-4 outline-none resize-none h-32 md:h-24 text-lg font-light"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(false);
                }
              }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-200 dark:border-slate-800 gap-3 sm:gap-0">
            <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
              
              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider hidden md:inline-block">{t('ratio')}</span>
                <div className="flex bg-gray-200 dark:bg-slate-800 rounded-lg p-0.5">
                  {ratios.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        aspectRatio === ratio.value 
                          ? 'bg-white dark:bg-slate-600 text-primary dark:text-white shadow-sm' 
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title={ratio.label}
                    >
                      {ratio.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Count Selector */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-300 dark:border-slate-700">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider hidden md:inline-block">Count</span>
                <div className="flex bg-gray-200 dark:bg-slate-800 rounded-lg p-0.5">
                   {[1, 2, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setImageCount(n as ImageCount)}
                        className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                            imageCount === n
                            ? 'bg-white dark:bg-slate-600 text-primary dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {n}
                      </button>
                   ))}
                </div>
              </div>

            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Prompt Builder Button */}
                <button
                    onClick={() => setIsBuilderOpen(true)}
                    className="p-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20"
                    title="Open Prompt Builder"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="hidden md:inline">{t('builder_title')}</span>
                </button>

                {/* Image Upload Button */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white`}
                    title="Upload Reference Image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <span className="hidden md:inline">Edit Image</span>
                </button>

                <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs font-medium ${
                    isListening 
                    ? 'bg-red-500/20 text-red-500 animate-pulse' 
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Use Voice Input"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a3 3 0 00-3 3v4.5a3 3 0 006 0v-4.5a3 3 0 00-3-3z" />
                </svg>
                <span className="hidden md:inline">{isListening ? t('listening') : t('voice')}</span>
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button 
          variant="secondary"
          onClick={() => handleSubmit(false)}
          isLoading={isGenerating}
          disabled={!prompt.trim()}
          className="shadow-sm"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          }
        >
          {t('quick_gen')}
        </Button>
        <Button 
          variant="primary" 
          onClick={() => handleSubmit(true)}
          isLoading={isGenerating}
          disabled={!prompt.trim()}
          className="shadow-lg shadow-primary/25"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        >
          {t('enhance_gen')}
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;
