import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface TipsProps {
  language: Language;
}

const Tips: React.FC<TipsProps> = ({ language }) => {
  const t = (key: any) => getTranslation(language, key);

  const tips = [
    { 
      title: t('tip_specific_title'), 
      text: t('tip_specific_text'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
        </svg>
      )
    },
    { 
      title: t('tip_style_title'), 
      text: t('tip_style_text'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      )
    },
    { 
      title: t('tip_light_title'), 
      text: t('tip_light_text'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )
    },
    { 
      title: t('tip_mood_title'), 
      text: t('tip_mood_text'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      )
    },
  ];

  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-700 to-transparent flex-1"></div>
        <span className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest px-2">{t('prompt_guide')}</span>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-700 to-transparent flex-1"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tips.map((tip, index) => (
          <div key={index} className="group relative bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 p-6 rounded-xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-primary/20">
                  {tip.icon}
                </div>
              </div>
              <h3 className="text-gray-900 dark:text-slate-200 font-semibold mb-2 group-hover:text-primary transition-colors">{tip.title}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tips;
