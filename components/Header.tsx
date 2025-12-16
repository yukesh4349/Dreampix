
import React from 'react';
import { AppView, Language, Theme, User } from '../types';
import { getTranslation } from '../utils/translations';
import Button from './Button';

interface HeaderProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onChangeView, 
  language, 
  setLanguage, 
  theme, 
  toggleTheme,
  user,
  onLoginClick,
  onLogoutClick
}) => {
  const t = (key: any) => getTranslation(language, key);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-3 md:py-0 gap-4 md:gap-0">
          <div className="flex items-center cursor-pointer" onClick={() => onChangeView(AppView.GENERATOR)}>
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg mr-3 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-slate-400">
              Dreampix
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
             <nav className="flex bg-gray-100 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                <button
                onClick={() => onChangeView(AppView.GENERATOR)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === AppView.GENERATOR ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                >
                {t('nav_generate')}
                </button>
                <button
                onClick={() => onChangeView(AppView.GALLERY)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === AppView.GALLERY ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                >
                {t('nav_gallery')}
                </button>
                <button
                onClick={() => onChangeView(AppView.HISTORY)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === AppView.HISTORY ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                >
                {t('nav_history')}
                </button>
            </nav>

            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>

            <div className="flex items-center gap-2">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none transition-colors"
                >
                    <option value="en">EN</option>
                    <option value="ta">தமிழ்</option>
                </select>

                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                    )}
                </button>

                {user ? (
                   <div className="flex items-center gap-2 ml-2">
                     <span className="text-sm font-medium text-gray-700 dark:text-slate-300 hidden md:block">
                        {user.name || t('guest_welcome')}
                     </span>
                     <Button variant="outline" onClick={onLogoutClick} className="px-3 py-1.5 text-xs h-9">
                        {t('logout')}
                     </Button>
                   </div>
                ) : (
                   <Button variant="primary" onClick={onLoginClick} className="px-3 py-1.5 text-xs ml-2 h-9 shadow-none">
                      {t('login')}
                   </Button>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
