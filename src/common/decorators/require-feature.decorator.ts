import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'required_feature';

/**
 * Marks a controller or route handler as requiring a specific subscription feature.
 * Works in combination with SubscriptionGuard (registered globally).
 *
 * @example
 * ```typescript
 * @RequireFeature('campaigns')
 * @Controller('campaigns')
 * export class CampaignController {}
 * ```
 */
export const RequireFeature = (feature: string) => SetMetadata(FEATURE_KEY, feature);

export const SKIP_SUBSCRIPTION_KEY = 'skip_subscription_check';

/**
 * Skips the subscription feature check for public or webhook routes.
 */
export const SkipSubscriptionCheck = () => SetMetadata(SKIP_SUBSCRIPTION_KEY, true);
