// src/core/extensionAPI/sandbox/createSandbox.ts
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import { fs } from '@/core/fileSystem';

export interface SandboxResult {
  activate:   ((context?: any) => void | Promise<void>) | undefined;
  deactivate: (() => void | Promise<void>) | undefined;
}

// 1. REACT ESM INTEROP
const getInterop = (mod: any) => {
  if (!mod) return {};
  const interop: any = { ...mod, __esModule: true };
  interop.default = mod.default || mod;
  
  // Force attach crucial top-level functions
  if (mod.createElement || interop.default.createElement) {
      interop.createElement = mod.createElement || interop.default.createElement;
  }
  return interop;
};

const ALLOWED_MODULES: Record<string, unknown> = {
  'react': getInterop(React),
  'react-dom': getInterop(ReactDOM),
  'react/jsx-runtime': getInterop(ReactJsxRuntime),
};

const createSafeRequire = (mscodeAPI: any, extId: string) => (mod: string): unknown => {
  if (mod === '@mscode/api' || mod === 'mscode') return mscodeAPI;
  if (mod === '@mscode/ui') return mscodeAPI.ui;

  if (ALLOWED_MODULES[mod]) return ALLOWED_MODULES[mod];

  console.error(`[Sandbox] 🚨 BLOCKED module requirement: '${mod}' in [${extId}]`);
  throw new Error(`[Sandbox] require('${mod}') is not permitted.`);
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

const createSafeFetch = (baseUrl: string, storeDir: string) => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let requestUrl = typeof input === 'string' ? input : input.toString();

    if (requestUrl.startsWith('./')) {
      requestUrl = new URL(requestUrl.replace(/^\.\//, ''), baseUrl).href;
    } else if (!requestUrl.startsWith('http')) {
      requestUrl = new URL(requestUrl, baseUrl).href;
    }

    if (requestUrl.startsWith(baseUrl)) {
      const fileName = requestUrl.replace(baseUrl, '');
      const cleanFileName = fileName.startsWith('/') ? fileName.slice(1) : fileName;
      const targetPath = `ms-storage://${storeDir}/${cleanFileName}`;
    
      try {
        const fileContent = await fs.readFile(targetPath);
        const isBinary = /\.(png|jpe?g|gif|webp|ico|msxt|zip|wasm)$/i.test(cleanFileName);
        let body: any = fileContent;
        
        if (isBinary) body = base64ToUint8Array(fileContent);
        
        let contentType = 'text/plain';
        if (cleanFileName.endsWith('.json')) contentType = 'application/json';
        else if (cleanFileName.endsWith('.wasm')) contentType = 'application/wasm';
        else if (cleanFileName.endsWith('.png')) contentType = 'image/png';
        
        return new Response(body, { status: 200, headers: { 'Content-Type': contentType } });
      } catch (e) {
        return new Response('Not Found', { status: 404 });
      }
    }
    return fetch(requestUrl, init);
  };
};

const createScopedConsole = (extId: string) => ({
  ...console,
  log: (...args: any[]) => console.log(`[Ext:${extId}]`, ...args),
  warn: (...args: any[]) => console.warn(`[Ext:${extId}]`, ...args),
  error: (...args: any[]) => console.error(`[Ext:${extId}]`, ...args),
  info: (...args: any[]) => console.info(`[Ext:${extId}]`, ...args),
});


// These absorb library feature-detection calls without letting them destroy the IDE!
const mockDocument = {
  createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
};

const mockWindow = {
  document: mockDocument,
  navigator: { userAgent: 'MSCode Sandbox' },
  location: { href: 'http://localhost' },
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  setInterval: window.setInterval,
  clearInterval: window.clearInterval,
};

const mockProcess = {
  env: { NODE_ENV: 'production' },
  cwd: () => '/',
  platform: 'browser'
};

const SHADOW_MOCKS: Record<string, any> = {
  'document': mockDocument,
  'window': mockWindow,
  'globalThis': mockWindow,
  'self': mockWindow,
  'top': mockWindow,
  'parent': mockWindow,
  'frames': mockWindow,
  'opener': null,
  'XMLHttpRequest': function() {},
  'localStorage': { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  'sessionStorage': { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};

/**
 * Compiles and executes untrusted string code inside an isolated closure execution context.
 */
export function executeSandboxed(
  code: string,
  mscodeAPI: unknown,
  baseUrl: string,
  storeDir: string,
  extId: string = 'Extension'
): SandboxResult {
  const moduleObj = { exports: {} as Record<string, unknown> };

  const SHADOWED_KEYS = Object.keys(SHADOW_MOCKS);
  const SHADOWED_VALUES = Object.values(SHADOW_MOCKS);

  try {
    // Passed `process` into the wrapper arguments
    const wrapper = new Function(
      'mscode', 'require', 'module', 'exports', 'fetch', 'console', '__dirname', '__filename', 'process',
      ...SHADOWED_KEYS,
      `"use strict";\n${code}\nreturn module.exports;`,
    );

    const exported = wrapper(
      mscodeAPI,
      createSafeRequire(mscodeAPI, extId),
      moduleObj,
      moduleObj.exports,
      createSafeFetch(baseUrl, storeDir),
      createScopedConsole(extId),
      storeDir,                     
      `${storeDir}/extension.js`,
      mockProcess,
      ...SHADOWED_VALUES 
    ) as Record<string, unknown>;

    return {
      activate:   typeof exported.activate   === 'function' ? exported.activate   as any : undefined,
      deactivate: typeof exported.deactivate === 'function' ? exported.deactivate as any : undefined,
    };

  } catch (err: any) {
    console.error(`\n[Sandbox:Fatal] 🔴 Error evaluating extension bundle for [${extId}]:`);
    console.error(err.stack || err);
    console.error(`------------------------------------------------------\n`);
    return { activate: undefined, deactivate: undefined };
  }
}