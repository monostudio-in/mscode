import type { StatusBarItem } from '@/features/statusbar/store/statusBarStore';

class StatusBarRegistry {
  private items = new Map<string, StatusBarItem>();

  register(item: StatusBarItem): void {
    this.items.set(item.id, item);
  }

  unregister(id: string): void {
    this.items.delete(id);
  }

  getAll(): StatusBarItem[] {
    return Array.from(this.items.values());
  }
}

export const statusBarRegistry = new StatusBarRegistry();