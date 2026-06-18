// src/core/extensionAPI/sandbox/createSandbox.ts
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import { fs } from '@/core/fileSystem';

export interface SandboxResult {
  activate:   ((context?: any) => void | Promise<void>) | undefined;
  deactivate: (() => void | Promise<void>) | undefined;
}

// ES6 Module Namespaces don't work with spread (...). We must manually map keys safely.
const createInteropModule = (name: string, mod: any) => {
  const interop: any = { __esModule: true, default: mod };
  
  // Copy all properties explicitly
  for (const key in mod) {
    interop[key] = mod[key];
  }
  
  // Hardcode React essentials just in case the JS loop misses non-enumerable getters
  if (name === 'react') {
      interop.createElement = mod.createElement || (mod.default && mod.default.createElement);
      interop.useState = mod.useState || (mod.default && mod.default.useState);
      interop.useEffect = mod.useEffect || (mod.default && mod.default.useEffect);
      interop.useRef = mod.useRef || (mod.default && mod.default.useRef);
      interop.Fragment = mod.Fragment || (mod.default && mod.default.Fragment);
  }
  
  if (name === 'react/jsx-runtime') {
      interop.jsx = mod.jsx || (mod.default && mod.default.jsx);
      interop.jsxs = mod.jsxs || (mod.default && mod.default.jsxs);
      interop.Fragment = mod.Fragment || (mod.default && mod.default.Fragment);
  }

  return interop;
};

const ALLOWED_MODULES: Record<string, unknown> = {
  'react': createInteropModule('react', React),
  'react-dom': createInteropModule('react-dom', ReactDOM),
  'react/jsx-runtime': createInteropModule('react/jsx-runtime', ReactJsxRuntime),
};

const createSafeRequire = (mscodeAPI: any, extId: string) => (mod: string): unknown => {
  // Track every require call from the extension!
  console.log(`[Sandbox:Require] 📦 Extension [${extId}] is requiring module: '${mod}'`);

  if (mod === '@mscode/api' || mod === 'mscode') return mscodeAPI;
  if (mod === '@mscode/ui') return mscodeAPI.ui;

  if (ALLOWED_MODULES[mod]) {
    console.log(`[Sandbox:Require] ✅ Successfully returning allowed module: '${mod}'`);
    return ALLOWED_MODULES[mod];
  }

  console.error(`[Sandbox:Require] 🚨 BLOCKED require('${mod}') in [${extId}]`);
  throw new Error(`[Sandbox] 🚨 require('${mod}') is not permitted. Extensions must bundle external dependencies.`);
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
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
        
        if (isBinary) {
          body = base64ToUint8Array(fileContent);
        }
        
        let contentType = 'text/plain';
        if (cleanFileName.endsWith('.json')) contentType = 'application/json';
        else if (cleanFileName.endsWith('.wasm')) contentType = 'application/wasm';
        else if (cleanFileName.endsWith('.png')) contentType = 'image/png';
        
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': contentType }
        });
      } catch (e) {
        console.error(`[Sandbox:Fetch] Internal 404 resource breakdown: ${targetPath}`, e);
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

export function executeSandboxed(
  code: string,
  mscodeAPI: unknown,
  baseUrl: string,
  storeDir: string,
  extId: string = 'Extension'
): SandboxResult {
  const moduleObj = { exports: {} as Record<string, unknown> };

  const SHADOWED = [
    'window', 'document', 'globalThis', 'self',
    'top', 'parent', 'frames', 'opener', 'XMLHttpRequest', 'localStorage', 'sessionStorage'
  ] as const;

  try {
    console.log(`[Sandbox] 🟢 Compiling bundle for extension: ${extId}`);
    
    const wrapper = new Function(
      'mscode', 'require', 'module', 'exports', 'fetch', 'console', '__dirname', '__filename',
      ...SHADOWED,
      `"use strict";\n${code}\nreturn module.exports;`,
    );

    const exported = wrapper(
      mscodeAPI,
      createSafeRequire(mscodeAPI, extId), // Passing extId for better logs
      moduleObj,
      moduleObj.exports,
      createSafeFetch(baseUrl, storeDir),
      createScopedConsole(extId),
      storeDir,                     
      `${storeDir}/extension.js`,   
      ...SHADOWED.map(() => undefined),
    ) as Record<string, unknown>;

    console.log(`[Sandbox] ✅ Successfully evaluated bundle for: ${extId}`);

    return {
      activate:   typeof exported.activate   === 'function' ? exported.activate   as any : undefined,
      deactivate: typeof exported.deactivate === 'function' ? exported.deactivate as any : undefined,
    };

  } catch (err: any) {
    // If the bundle crashes, print the exact stack trace!
    console.error(`\n[Sandbox:Fatal] 🔴 Error evaluating extension bundle for [${extId}]:`);
    console.error(err.message);
    console.error(err.stack);
    console.error(`------------------------------------------------------\n`);
    
    return { activate: undefined, deactivate: undefined };
  }
}