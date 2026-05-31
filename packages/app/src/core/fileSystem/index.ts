// src/core/fileSystem/index.ts

import { Capacitor } from '@capacitor/core';
import type { IFileSystem } from './IFileSystem';
import { WebFileSystem } from '@/platforms/web/FileSystem';
import { AndroidFileSystem } from '@/platforms/android/FileSystem';

// Platform Check
const getFileSystem = (): IFileSystem => {
  if (Capacitor.isNativePlatform()) {
    //  Android (Native) : return -> AndroidFileSystem
    return new AndroidFileSystem();
  } else {
    // Web / browser :  WebFileSystem
    return new WebFileSystem();
  }
};

// Exported global index
export const fs = getFileSystem();