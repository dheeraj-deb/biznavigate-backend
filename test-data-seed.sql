-- BizNavigate Test Data Seed Script
-- This script creates sample data for testing the Lead Management API

-- 1. Create Test Tenant
INSERT INTO tenants (tenant_id, tenant_name, email, phone_number, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Tenant Inc', 'admin@testtenant.com', '9999999999', NOW(), NOW())
ON CONFLICT (tenant_id) DO NOTHING;

-- 2. Create Test Subscription Plan
INSERT INTO subscription_plans (subscription_plan_id, plan_name, price, duration_in_days, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Premium Plan', 9999.00, 365, NOW())
ON CONFLICT (subscription_plan_id) DO NOTHING;

-- 3. Create Test Business
INSERT INTO businesses (business_id, tenant_id, business_name, business_type, subscription_plan_id, whatsapp_number, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Test Business', 'Retail', '22222222-2222-2222-2222-222222222222', '9876543210', NOW(), NOW())
ON CONFLICT (business_id) DO NOTHING;

-- 4. Create Test Role
INSERT INTO roles (role_id, role_name, permissions, created_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Sales Agent', '{"can_view_leads": true, "can_edit_leads": true}'::jsonb, NOW())
ON CONFLICT (role_id) DO NOTHING;

-- 5. Create Test Users (Agents)
INSERT INTO users (user_id, business_id, email, name, is_active, role_id, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'agent1@test.com', 'John Agent', true, '44444444-4444-4444-4444-444444444444', NOW()),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'agent2@test.com', 'Jane Agent', true, '44444444-4444-4444-4444-444444444444', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 6. Create Test Tags
INSERT INTO tags (tag_id, business_id, tenant_id, tag_name, tag_category, tag_color, is_system, created_at)
VALUES
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'VIP', 'priority', '#FFD700', false, NOW()),
  ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Urgent', 'priority', '#FF0000', false, NOW()),
  ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Follow-up Required', 'status', '#FFA500', false, NOW())
ON CONFLICT (tag_id) DO NOTHING;

-- Display created data
SELECT 'Created Test Data:' as message;
SELECT 'Tenant:' as type, tenant_name, email FROM tenants WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT 'Business:' as type, business_name, business_type FROM businesses WHERE business_id = '33333333-3333-3333-3333-333333333333';
SELECT 'Users:' as type, name, email FROM users WHERE business_id = '33333333-3333-3333-3333-333333333333';
SELECT 'Tags:' as type, tag_name, tag_color FROM tags WHERE business_id = '33333333-3333-3333-3333-333333333333';
