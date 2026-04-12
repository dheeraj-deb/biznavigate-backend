import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId: string;
  correlationId?: string;
  businessId?: string;
}

const storage = new AsyncLocalStorage<TenantContextData>();

/**
 * TenantContext — uses Node.js AsyncLocalStorage to propagate tenant identity
 * through the entire async call stack without passing it explicitly.
 *
 * Usage:
 *   TenantContext.run({ tenantId: 'abc' }, () => { ... })
 *   TenantContext.getTenantId()   // 'abc' anywhere inside the run callback
 */
export class TenantContext {
  static run<T>(data: TenantContextData, fn: () => T): T {
    return storage.run(data, fn);
  }

  static get(): TenantContextData | undefined {
    return storage.getStore();
  }

  static getTenantId(): string | undefined {
    return storage.getStore()?.tenantId;
  }

  static getCorrelationId(): string | undefined {
    return storage.getStore()?.correlationId;
  }

  static getBusinessId(): string | undefined {
    return storage.getStore()?.businessId;
  }

  /** Set correlationId on the existing store (called by correlation middleware after tenant context is set) */
  static setCorrelationId(correlationId: string): void {
    const store = storage.getStore();
    if (store) {
      store.correlationId = correlationId;
    }
  }
}
