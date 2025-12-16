
export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

export type Language = 'en' | 'ta';

export type Theme = 'light' | 'dark';

export type ImageCount = 1 | 2 | 4;

export interface User {
  id: string;
  email: string;
  password: string; // Note: In a real app, never store raw passwords client-side
  name?: string;
}

export interface GeneratedImage {
  id: string;
  userId?: string; // Optional: Guest generated images have no userId
  prompt: string;
  enhancedPrompt?: string;
  imageData: string; // Base64
  timestamp: number;
  isEnhancedVersion?: boolean;
  aspectRatio?: AspectRatio;
  isCollage?: boolean;
}

export interface GenerationResult {
  original: GeneratedImage | GeneratedImage[]; // Can be array for multi-gen
  enhanced?: GeneratedImage | GeneratedImage[];
  explanation?: string;
  collage?: GeneratedImage; // The stitched result
}

export enum AppView {
  GENERATOR = 'GENERATOR',
  GALLERY = 'GALLERY',
  HISTORY = 'HISTORY',
}

// Global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
