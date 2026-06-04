import { Module } from '@nestjs/common';
import { S3Module } from '../../s3/s3.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { BusinessesModule } from './business/business.module';
import { BusinessSettingsModule } from './business-settings/business-settings.module';
import { RolesModule } from './roles/role.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/user.module';

/**
 * Platform boundary module.
 *
 * Owns cross-cutting SaaS/platform concerns: identity, tenancy, business
 * ownership, roles, billing, audit, settings, and object storage wiring.
 */
@Module({
  imports: [
    AuthModule,
    TenantsModule,
    BusinessesModule,
    RolesModule,
    UsersModule,
    BillingModule,
    AuditLogModule,
    BusinessSettingsModule,
    S3Module,
  ],
  exports: [
    AuthModule,
    TenantsModule,
    BusinessesModule,
    RolesModule,
    UsersModule,
    BillingModule,
    AuditLogModule,
    BusinessSettingsModule,
    S3Module,
  ],
})
export class PlatformModule {}
