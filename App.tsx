
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import Tips from './components/Tips';
import ImageResult from './components/ImageResult';
import ComparisonView from './components/ComparisonView';
import Gallery from './components/Gallery';
import History from './components/History';
import Button from './components/Button';
import AuthModal from './components/AuthModal';
import { AppView, GenerationResult, GeneratedImage, AspectRatio, Language, Theme, ImageCount, User } from './types';
import { enhanceUserPrompt, generateImageFromPrompt, generateExplanation } from './services/geminiService';
import { storageService } from './services/storageService';
import { getTranslation } from './utils/translations';
import { createCollage } from './utils/imageUtils';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.GENERATOR);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [reusedPrompt, setReusedPrompt] = useState('');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initial Theme Setup & Session Check
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check for user session (simple local storage persistence for demo)
    const savedUserStr = localStorage.getItem('dreampix_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('dreampix_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dreampix_user');
    setView(AppView.GENERATOR); // Reset view to generator
  };

  const t = (key: any) => getTranslation(language, key);

  const handleGenerate = async (prompt: string, enhance: boolean, aspectRatio: AspectRatio, count: ImageCount, imageInput?: string) => {
    setIsGenerating(true);
    setCurrentResult(null);

    try {
      const timestamp = Date.now();
      const idPrefix = timestamp.toString();

      // Function to generate N images
      const generateN = async (p: string, refImage?: string): Promise<string[]> => {
        const promises = Array(count).fill(null).map(() => generateImageFromPrompt(p, aspectRatio, refImage));
        const results = await Promise.all(promises);
        return results.filter((img): img is string => img !== null);
      };

      if (!enhance) {
        // Simple Generation (Multiple)
        const images = await generateN(prompt, imageInput);
        
        if (images.length > 0) {
            const generatedImages: GeneratedImage[] = images.map((imgData, idx) => ({
                id: `${idPrefix}-orig-${idx}`,
                userId: user?.id, // Attach userId if logged in
                prompt,
                imageData: imgData,
                timestamp,
                aspectRatio
            }));

            // Create Collage if count > 1
            let collage: GeneratedImage | undefined;
            if (images.length > 1) {
                const collageData = await createCollage(images);
                collage = {
                    id: `${idPrefix}-collage`,
                    userId: user?.id,
                    prompt,
                    imageData: collageData,
                    timestamp,
                    aspectRatio: '1:1',
                    isCollage: true
                };
                // Only save to gallery if logged in
                if (user) {
                   await storageService.saveImage(collage);
                }
                // Always add to local history (though history currently syncs to DB, logically history might be ephemeral for guest, but let's keep it persistent for now or sync with logic. 
                // Requirement: "If not logged in: Allow generation but do not save images to gallery."
                // I will save to history store regardless for now, so user sees "History" tab populated for session, 
                // but Gallery is specific. Actually, let's keep history for everyone, but Gallery is protected.
                await storageService.addToHistory(collage);
            }

            const result: GenerationResult = {
                original: generatedImages, 
                collage
            };
            setCurrentResult(result);
            
            if (user) {
               // Auto-save individual images to Gallery ONLY if logged in
               await Promise.all(generatedImages.map(img => storageService.saveImage(img)));
            }
            
            // Auto-save to History (available to all)
            await Promise.all(generatedImages.map(img => storageService.addToHistory(img)));
        }
      } else {
        // Enhanced Generation
        const enhancedPrompt = await enhanceUserPrompt(prompt);
        
        const [originalImages, enhancedImages] = await Promise.all([
            generateN(prompt, imageInput),
            generateN(enhancedPrompt, imageInput)
        ]);

        if (originalImages.length > 0 && enhancedImages.length > 0) {
            const explanation = await generateExplanation(prompt, enhancedPrompt);

            const origObjs: GeneratedImage[] = originalImages.map((d, i) => ({
                id: `${idPrefix}-orig-${i}`,
                userId: user?.id,
                prompt,
                imageData: d,
                timestamp,
                aspectRatio
            }));

            const enhObjs: GeneratedImage[] = enhancedImages.map((d, i) => ({
                id: `${idPrefix}-enh-${i}`,
                userId: user?.id,
                prompt,
                enhancedPrompt,
                imageData: d,
                timestamp,
                isEnhancedVersion: true,
                aspectRatio
            }));

            let collage: GeneratedImage | undefined;
            if (enhancedImages.length > 1) {
                const collageData = await createCollage(enhancedImages);
                collage = {
                    id: `${idPrefix}-collage-enh`,
                    userId: user?.id,
                    prompt: enhancedPrompt,
                    imageData: collageData,
                    timestamp,
                    aspectRatio: '1:1',
                    isCollage: true,
                    isEnhancedVersion: true
                };
                if (user) await storageService.saveImage(collage);
                await storageService.addToHistory(collage);
            }

            const result: GenerationResult = {
                original: origObjs,
                enhanced: enhObjs,
                explanation,
                collage
            };
            setCurrentResult(result);

             if (user) {
                // Auto-save to Gallery if logged in
                await Promise.all([...origObjs, ...enhObjs].map(img => storageService.saveImage(img)));
             }
             // Auto-save to History
            await Promise.all([...origObjs, ...enhObjs].map(img => storageService.addToHistory(img)));
        }
      }
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReusePrompt = (prompt: string) => {
    setReusedPrompt(prompt);
    setView(AppView.GENERATOR);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (view) {
        case AppView.GENERATOR:
            return (
                <div className="space-y-12 pb-20">
                    <div className="text-center space-y-4 max-w-2xl mx-auto pt-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient tracking-tight">
                        {t('title_main')}
                    </h1>
                    <p className="text-gray-600 dark:text-slate-400 text-lg font-light leading-relaxed">
                        {t('subtitle_main')}
                    </p>
                    </div>

                    <PromptInput 
                        onGenerate={handleGenerate} 
                        isGenerating={isGenerating} 
                        language={language}
                        initialPrompt={reusedPrompt}
                    />
                    
                    <Tips language={language} />

                    <div className="min-h-[400px]">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="relative w-24 h-24">
                              <div className="absolute inset-0 border-4 border-gray-200 dark:border-slate-800 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                            </div>
                            <p className="text-primary font-medium animate-pulse text-lg">{t('loading')}</p>
                        </div>
                    ) : currentResult ? (
                        currentResult.enhanced ? (
                            <ComparisonView result={currentResult} onReusePrompt={handleReusePrompt} />
                        ) : (
                            <div className="animate-fade-in-up space-y-8">
                                {Array.isArray(currentResult.original) ? (
                                    <div className={`grid gap-6 ${currentResult.original.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
                                        {currentResult.original.map((img) => (
                                            <ImageResult key={img.id} image={img} onReusePrompt={handleReusePrompt} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="max-w-xl mx-auto">
                                        <ImageResult image={currentResult.original} onReusePrompt={handleReusePrompt} />
                                    </div>
                                )}
                                
                                {currentResult.collage && (
                                     <div className="max-w-xl mx-auto pt-8 border-t border-gray-200 dark:border-slate-800">
                                        <h3 className="text-center text-xl font-bold mb-6 text-gray-800 dark:text-white">Collage Result</h3>
                                        <ImageResult image={currentResult.collage} onReusePrompt={handleReusePrompt} />
                                     </div>
                                )}
                            </div>
                        )
                    ) : null}
                    </div>
                </div>
            );
        case AppView.GALLERY:
            return (
                <div className="animate-fade-in-up py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('gallery_title')}</h2>
                            <p className="text-gray-500 dark:text-slate-400">{t('gallery_subtitle')}</p>
                        </div>
                        <Button 
                            variant="secondary" 
                            onClick={() => setView(AppView.GENERATOR)}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            }
                        >
                            {t('back_to_gen')}
                        </Button>
                    </div>
                    <Gallery user={user} onLoginClick={() => setIsAuthOpen(true)} language={language} />
                </div>
            );
        case AppView.HISTORY:
            return (
                <div className="animate-fade-in-up py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('history_title')}</h2>
                            <p className="text-gray-500 dark:text-slate-400">{t('history_subtitle')}</p>
                        </div>
                        <Button 
                            variant="secondary" 
                            onClick={() => setView(AppView.GENERATOR)}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            }
                        >
                            {t('back_to_gen')}
                        </Button>
                    </div>
                    <History language={language} onReusePrompt={handleReusePrompt} />
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLogin}
        language={language}
      />
      
      <Header 
        currentView={view} 
        onChangeView={setView} 
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
