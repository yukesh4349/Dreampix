import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import Button from './Button';

interface PromptBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (prompt: string) => void;
  language: Language;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ isOpen, onClose, onApply, language }) => {
  const t = (key: any) => getTranslation(language, key);

  // Builder State - Using arrays for multiple selections
  const [subject, setSubject] = useState('');
  const [action, setAction] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedLighting, setSelectedLighting] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setAction('');
      setSelectedStyles([]);
      setSelectedLighting([]);
      setSelectedMoods([]);
      setSelectedCameras([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Data Options
  const styles = ['Photorealistic', 'Cyberpunk', 'Anime', 'Oil Painting', 'Watercolor', '3D Render', 'Sketch', 'Pop Art', 'Cinematic', 'Minimalist'];
  const lighting = ['Golden Hour', 'Cinematic Lighting', 'Neon Lights', 'Natural Light', 'Studio Lighting', 'Dark & Moody', 'Bioluminescent', 'Soft Focus'];
  const moods = ['Epic', 'Mysterious', 'Serene', 'Cheerful', 'Chaotic', 'Melancholic', 'Dreamy', 'Futuristic'];
  const cameras = ['Wide Angle', 'Macro', 'Drone View', 'Fish-eye', 'Bokeh', 'Portrait', 'Long Exposure'];

  // Helper to toggle selection in array
  const toggleSelection = (item: string, currentList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const constructPrompt = () => {
    const parts = [
      subject.trim(),
      action.trim(),
      ...selectedStyles,
      ...selectedLighting,
      ...selectedMoods,
      ...selectedCameras
    ].filter(s => s && s.trim().length > 0); // Remove empty strings
    return parts.join(', ');
  };

  const currentPreview = constructPrompt();

  const handleApply = () => {
    onApply(currentPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {t('builder_title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('builder_subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Core Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t('builder_subject_label')}</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('builder_subject_placeholder')}
                className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t('builder_action_label')}</label>
              <input 
                type="text" 
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder={t('builder_action_placeholder')}
                className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-slate-700"></div>

          {/* Selectable Categories */}
          <div className="space-y-4">
            
            {/* Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">{t('builder_style_label')}</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSelection(s, selectedStyles, setSelectedStyles)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedStyles.includes(s) 
                      ? 'bg-primary text-white border-primary shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">{t('builder_lighting_label')}</label>
              <div className="flex flex-wrap gap-2">
                {lighting.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleSelection(l, selectedLighting, setSelectedLighting)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedLighting.includes(l) 
                      ? 'bg-secondary text-white border-secondary shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-secondary/50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

             {/* Mood */}
             <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">{t('builder_mood_label')}</label>
              <div className="flex flex-wrap gap-2">
                {moods.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleSelection(m, selectedMoods, setSelectedMoods)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedMoods.includes(m) 
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-pink-500/50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">{t('builder_camera_label')}</label>
              <div className="flex flex-wrap gap-2">
                {cameras.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleSelection(c, selectedCameras, setSelectedCameras)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedCameras.includes(c) 
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-indigo-500/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer / Preview */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30">
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">{t('builder_preview')}</label>
            <div className="mt-2 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 min-h-[3rem] italic">
              {currentPreview || <span className="text-gray-400 dark:text-slate-600 opacity-50">Select options to build prompt...</span>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <Button 
              variant="ghost" 
              onClick={() => {
                setSubject('');
                setAction('');
                setSelectedStyles([]);
                setSelectedLighting([]);
                setSelectedMoods([]);
                setSelectedCameras([]);
              }}
            >
              {t('builder_clear')}
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={!currentPreview.trim()}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              }
            >
              {t('builder_use')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PromptBuilder;
