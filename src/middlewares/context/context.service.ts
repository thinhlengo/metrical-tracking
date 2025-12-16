import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  getContext(key: string) {
    const store = this.asyncLocalStorage.getStore();
    return store?.get(key) ?? uuidv4();
  }

  setContext(key: string, value: any) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  run<T>(callback: () => T) {
    return this.asyncLocalStorage.run(new Map<string, any>(), callback);
  }
}
