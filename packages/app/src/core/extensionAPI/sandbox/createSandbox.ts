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
    if (requestUrl.startsWith('./')) requestUrl = new URL(requestUrl.replace(/^\.\//, ''), baseUrl).href;
    else if (!requestUrl.startsWith('http')) requestUrl = new URL(requestUrl, baseUrl).href;

    if (requestUrl.startsWith(baseUrl)) {
      const cleanFileName = requestUrl.replace(baseUrl, '').replace(/^\//, '');
      const targetPath = `ms-storage://${storeDir}/${cleanFileName}`;
      try {
        const fileContent = await fs.readFile(targetPath);
        const isBinary = /\.(png|jpe?g|gif|webp|ico|msxt|zip|wasm)$/i.test(cleanFileName);
        const body = isBinary ? base64ToUint8Array(fileContent) : fileContent;
        
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


const createProtectedDOM = (extId: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { mockWindow: {}, mockDocument: {} };
  }

  let fakeBody = document.getElementById(`ms-sandbox-${extId}`);
  if (!fakeBody) {
    fakeBody = document.createElement('div');
    fakeBody.id = `ms-sandbox-${extId}`;
    fakeBody.style.display = 'none';
    document.body.appendChild(fakeBody);
  }

  const mockDocument = new Proxy(document, {
    get(target, prop) {
      if (prop === 'body' || prop === 'documentElement') return fakeBody;
      if (prop === 'head') return document.head;

      // Let libraries query elements in the sandbox first, then fallback to real DOM
      if (prop === 'getElementById') {
        return (id: string) => fakeBody?.querySelector(`[id="${CSS.escape(id)}"]`) || document.getElementById(id);
      }
      if (prop === 'querySelector') {
        return (sel: string) => {
          try { return fakeBody?.querySelector(sel) || document.querySelector(sel); } catch { return null; }
        };
      }
      if (prop === 'querySelectorAll') {
        return (sel: string) => {
          try { return fakeBody?.querySelectorAll(sel) || document.querySelectorAll(sel); } catch { return []; }
        };
      }

      if (prop === 'cookie') return '';

      const value = (target as any)[prop];
      if (typeof value === 'function') return value.bind(target);
      return value;
    },
    set() { return true; } 
  });

  const mockWindow = new Proxy(window, {
    get(target, prop) {
      if (prop === 'document') return mockDocument;
      if (prop === 'top' || prop === 'parent' || prop === 'frames' || prop === 'self' || prop === 'window' || prop === 'globalThis') return mockWindow;
      if (prop === 'location') return { href: 'http://localhost', origin: 'http://localhost' };

      const value = (target as any)[prop];
      if (typeof value === 'function') return value.bind(target);
      return value;
    },
    set() { return true; }
  });

  return { mockWindow, mockDocument };
};


export function executeSandboxed(
  code: string,
  mscodeAPI: unknown,
  baseUrl: string,
  storeDir: string,
  extId: string = 'Extension'
): SandboxResult {
  const moduleObj = { exports: {} as Record<string, unknown> };
  const mockProcess = { env: { NODE_ENV: 'production' }, cwd: () => '/', platform: 'browser' };

  const { mockWindow, mockDocument } = createProtectedDOM(extId);

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
    'localStorage': (mockWindow as any).localStorage,
    'sessionStorage': (mockWindow as any).sessionStorage,
  };

  const SHADOWED_KEYS = Object.keys(SHADOW_MOCKS);
  const SHADOWED_VALUES = Object.values(SHADOW_MOCKS);

  try {
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