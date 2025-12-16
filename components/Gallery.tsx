
import React, { useEffect, useState } from 'react';
import { GeneratedImage, User, Language } from '../types';
import { storageService } from '../services/storageService';
import { getTranslation } from '../utils/translations';
import ImageResult from './ImageResult';
import Button from './Button';

interface GalleryProps {
  user: User | null;
  onLoginClick: () => void;
  language: Language;
}

const Gallery: React.FC<GalleryProps> = ({ user, onLoginClick, language }) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  
  const t = (key: any) => getTranslation(language, key);

  useEffect(() => {
    if (user) {
      loadImages(user.id);
    } else {
      setImages([]);
    }
  }, [user]);

  const loadImages = async (userId: string) => {
    setLoading(true);
    try {
      const stored = await storageService.getUserImages(userId);
      setImages(stored);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this image?")) {
        await storageService.deleteImage(id);
        setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('gallery_restricted_title')}</h3>
        <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-8">{t('gallery_restricted_msg')}</p>
        <Button onClick={onLoginClick}>{t('login')}</Button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500 dark:text-slate-400">Loading gallery...</div>;
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 dark:text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('no_images')}</h3>
        <p className="text-gray-500 dark:text-slate-400">{t('start_generating')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((img) => (
        <div key={img.id} className="relative group">
            <ImageResult image={img} title={img.isCollage ? "Collage" : undefined} />
            <button 
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Delete Image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
