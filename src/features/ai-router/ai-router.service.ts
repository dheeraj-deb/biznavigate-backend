import { Injectable } from '@nestjs/common';

export type AiBusinessDomain =
  | 'hospitality'
  | 'product_seller'
  | 'service'
  | 'education'
  | 'd2c'
  | 'generic';

export type AiOwner =
  | 'workflow_ai'
  | 'product_seller_ai'
  | 'generic_ai';

export interface AiRoute {
  domain: AiBusinessDomain;
  owner: AiOwner;
  request_business_type: string;
  result_strategy: 'workflow_result' | 'product_seller_result';
  context_flags: {
    ai_domain: AiBusinessDomain;
    ai_owner: AiOwner;
  };
}

const PRODUCT_SELLER_TYPES = new Set([
  'products',
  'product',
  'product_seller',
  'product_sellers',
  'retail',
  'ecommerce',
  'e_commerce',
  'shop',
  'store',
  'seller',
]);

const HOSPITALITY_TYPES = new Set([
  'hospitality',
  'hotel',
  'resort',
  'accommodation',
  'accomodation',
  'stay',
  'camping',
]);

const EDUCATION_TYPES = new Set(['education', 'school', 'institute']);
const D2C_TYPES = new Set(['d2c']);
const SERVICE_TYPES = new Set([
  'service',
  'services',
  'beauty',
  'restaurant',
  'clinic',
  'healthcare',
  'professional_services',
]);

@Injectable()
export class AiRouterService {
  routeForBusiness(businessType?: string | null): AiRoute {
    const normalized = this.normalizeBusinessType(businessType);

    if (PRODUCT_SELLER_TYPES.has(normalized)) {
      return {
        domain: 'product_seller',
        owner: 'product_seller_ai',
        request_business_type: 'product_seller',
        result_strategy: 'product_seller_result',
        context_flags: {
          ai_domain: 'product_seller',
          ai_owner: 'product_seller_ai',
        },
      };
    }

    if (HOSPITALITY_TYPES.has(normalized)) {
      return {
        domain: 'hospitality',
        owner: 'workflow_ai',
        request_business_type: 'hospitality',
        result_strategy: 'workflow_result',
        context_flags: {
          ai_domain: 'hospitality',
          ai_owner: 'workflow_ai',
        },
      };
    }

    if (EDUCATION_TYPES.has(normalized)) {
      return {
        domain: 'education',
        owner: 'workflow_ai',
        request_business_type: 'education',
        result_strategy: 'workflow_result',
        context_flags: {
          ai_domain: 'education',
          ai_owner: 'workflow_ai',
        },
      };
    }

    if (D2C_TYPES.has(normalized)) {
      return {
        domain: 'd2c',
        owner: 'workflow_ai',
        request_business_type: 'd2c',
        result_strategy: 'workflow_result',
        context_flags: {
          ai_domain: 'd2c',
          ai_owner: 'workflow_ai',
        },
      };
    }

    if (SERVICE_TYPES.has(normalized)) {
      return {
        domain: 'service',
        owner: 'workflow_ai',
        request_business_type: 'service',
        result_strategy: 'workflow_result',
        context_flags: {
          ai_domain: 'service',
          ai_owner: 'workflow_ai',
        },
      };
    }

    return {
      domain: 'generic',
      owner: 'generic_ai',
      request_business_type: 'service',
      result_strategy: 'workflow_result',
      context_flags: {
        ai_domain: 'generic',
        ai_owner: 'generic_ai',
      },
    };
  }

  isProductSellerRoute(route: AiRoute) {
    return route.owner === 'product_seller_ai';
  }

  private normalizeBusinessType(value?: string | null) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  }
}
