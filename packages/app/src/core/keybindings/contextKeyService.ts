// src/core/keybindings/contextKeyService.ts

import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useTabStore } from '@/store/tabStore';

/**
 * Encapsulates an isolated state variable bound within the context system.
 * Acts as a fluent wrapper around the central service engine for direct property mutations.
 */
export class ContextKey<T> {
  private service: ContextKeyService;
  private key: string;

  constructor(service: ContextKeyService, key: string, defaultValue: T) {
    this.service = service;
    this.key = key;
    this.service.setContext(key, defaultValue);
  }

  /** Overwrites the runtime value of the current bound key */
  set(value: T): void {
    this.service.setContext(this.key, value);
  }

  /** Resolves the active state of the tracking property */
  get(): T {
    return this.service.getContext(this.key);
  }

  /** Erases the key registration out of memory storage pools */
  reset(): void {
    this.service.removeContext(this.key);
  }
}

/**
 * ContextKeyService Subsystem Engine
 * Centralizes environmental focus flags, application settings, and structural flags.
 * Evaluates complex conditional execution statements (like VS Code 'when' clauses) 
 * using deterministic recursive string routing rather than unsafe evaluation sandboxes.
 */
class ContextKeyService {
  /** Internal memory registry tracking localized state assignments */
  private contexts = new Map<string, any>();

  /**
   * Spawns a tracked context parameter initialization wrapper.
   * 
   * @param key Distinct property string label identifier.
   * @param defaultValue Baseline state assignment enforced upon registration.
   */
  createKey<T>(key: string, defaultValue: T): ContextKey<T> {
    return new ContextKey(this, key, defaultValue);
  }

  setContext(key: string, value: any): void {
    this.contexts.set(key, value);
  }

  /**
   * Resolves context state targets across localized registries, global 
   * document editor tabs, or external reactive application settings stores.
   * 
   * @param key Target reference lookup string indicator.
   */
  getContext(key: string): any {
    // ── TIER 1: DYNAMIC CONFIG RESOLUTION ──
    // Intercepts global setting keywords, mapping them downstream to state slices
    if (key.startsWith('config.')) {
      const settingKey = key.replace('config.', '');
      return useSettingsStore.getState().settings[settingKey];
    }

    // ── TIER 2: REACTIVE WORKSPACE FOCUS ROUTING ──
    if (key === 'editorTextFocus') {
      const { activeTabId, tabs } = useTabStore.getState();
      const activeTab = tabs.find(t => t.id === activeTabId);
      return activeTab?.type === 'code';
    }

    if (key === 'terminalFocus') {
      const { activeTabId, tabs } = useTabStore.getState();
      const activeTab = tabs.find(t => t.id === activeTabId);
      return activeTab?.type === 'termis';
    }

    return this.contexts.get(key);
  }

  removeContext(key: string): void {
    this.contexts.delete(key);
  }

  /**
   * Assesses structural boolean truth states for keybinding conditional execution blocks.
   * Empty declarations are treated as implicitly valid.
   * 
   * @param when Conditional syntax expression string statement mapping constraints.
   */
  evaluate(when?: string): boolean {
    if (!when) return true;
    return this.evaluateExpression(when);
  }

  /**
   * Parses compound logical expressions using custom token separation logic.
   * Enforces sequence priorities recursively (OR yields to AND, which yields to Equivalence checks).
   */
  private evaluateExpression(expr: string): boolean {
    expr = expr.trim();

    // 1. Structural Layer: Logical OR (||) Split Processing
    if (expr.includes('||')) {
      const parts = expr.split('||');
      return parts.some(part => this.evaluateExpression(part));
    }

    // 2. Structural Layer: Logical AND (&&) Split Processing
    if (expr.includes('&&')) {
      const parts = expr.split('&&');
      return parts.every(part => this.evaluateExpression(part));
    }

    // 3. Structural Layer: Equivalence & Comparison Operations
    const match = expr.match(/(.+?)(!==|!=|===|==)(.+)/);
    if (match) {
      const leftKey = match[1].trim();
      const operator = match[2];
      let rightVal: any = match[3].trim();

      // Normalize string wrap bounds or primitive keywords back into native configurations
      if ((rightVal.startsWith("'") && rightVal.endsWith("'")) ||
          (rightVal.startsWith('"') && rightVal.endsWith('"'))) {
        rightVal = rightVal.slice(1, -1);
      } else if (rightVal === 'true') {
        rightVal = true;
      } else if (rightVal === 'false') {
        rightVal = false;
      }

      const leftVal = this.getContext(leftKey);

      if (operator === '==' || operator === '===') return leftVal == rightVal;
      if (operator === '!=' || operator === '!==') return leftVal != rightVal;
    }

    // 4. Structural Layer: Unary Negation (!) Operators
    if (expr.startsWith('!')) {
      const key = expr.slice(1).trim();
      return !this.getContext(key);
    }

    // 5. Baseline Layer: Direct Truthy Verification
    return !!this.getContext(expr);
  }
}

/**
 * Shared central singleton engine processing application status values, context priorities, 
 * and operational criteria routing loops.
 */
export const contextKeyService = new ContextKeyService();
