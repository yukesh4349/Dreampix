
import { GeneratedImage, User } from '../types';

const DB_NAME = 'DreampixDB';
const STORE_IMAGES = 'images';
const STORE_HISTORY = 'history';
const STORE_USERS = 'users';
const DB_VERSION = 3; // Bump version for new users store

class StorageService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Gallery Store
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          const imgStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
          imgStore.createIndex('userId', 'userId', { unique: false });
        } else {
          // Upgrade existing store if needed
          const txn = (event.target as IDBOpenDBRequest).transaction;
          const imgStore = txn?.objectStore(STORE_IMAGES);
          if (imgStore && !imgStore.indexNames.contains('userId')) {
            imgStore.createIndex('userId', 'userId', { unique: false });
          }
        }

        // History Store - New in v2
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        }

        // Users Store - New in v3
        if (!db.objectStoreNames.contains(STORE_USERS)) {
          const userStore = db.createObjectStore(STORE_USERS, { keyPath: 'email' }); // Using email as key
        }
      };
    });
  }

  // --- Auth Methods ---

  async registerUser(user: Omit<User, 'id'>): Promise<User> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_USERS], 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      
      // Check if exists
      const checkReq = store.get(user.email);
      checkReq.onsuccess = () => {
        if (checkReq.result) {
          reject(new Error("User already exists"));
          return;
        }
        
        const newUser: User = { ...user, id: Date.now().toString() };
        const addReq = store.add(newUser);
        addReq.onsuccess = () => resolve(newUser);
        addReq.onerror = () => reject(addReq.error);
      };
      checkReq.onerror = () => reject(checkReq.error);
    });
  }

  async loginUser(email: string, password: string): Promise<User> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_USERS], 'readonly');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.get(email);

      request.onsuccess = () => {
        const user = request.result as User;
        if (user && user.password === password) {
          resolve(user);
        } else {
          reject(new Error("Invalid credentials"));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- Gallery Methods ---

  async saveImage(image: GeneratedImage): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_IMAGES], 'readwrite');
      const store = transaction.objectStore(STORE_IMAGES);
      const request = store.put(image);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserImages(userId: string): Promise<GeneratedImage[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_IMAGES], 'readonly');
      const store = transaction.objectStore(STORE_IMAGES);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results = request.result as GeneratedImage[];
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllImages(): Promise<GeneratedImage[]> {
     // Kept for backward compatibility or admin view if needed
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_IMAGES], 'readonly');
      const store = transaction.objectStore(STORE_IMAGES);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as GeneratedImage[];
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_IMAGES], 'readwrite');
      const store = transaction.objectStore(STORE_IMAGES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- History Methods ---

  async addToHistory(image: GeneratedImage): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORY], 'readwrite');
      const store = transaction.objectStore(STORE_HISTORY);
      const request = store.put(image);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getHistory(): Promise<GeneratedImage[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORY], 'readonly');
      const store = transaction.objectStore(STORE_HISTORY);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as GeneratedImage[];
        // Sort by timestamp descending
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearHistory(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORY], 'readwrite');
      const store = transaction.objectStore(STORE_HISTORY);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const storageService = new StorageService();
