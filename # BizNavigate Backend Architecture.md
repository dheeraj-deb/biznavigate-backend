# BizNavigate Backend Architecture

## 📁 Folder Structure

```
biznavigate-backend/
├── 📁 dist/                           # Compiled output
├── 📁 generated/                      # Generated files (Prisma client, etc.)
├── 📁 node_modules/                   # Dependencies
├── 📁 prisma/                         # Database schema and migrations
│   ├── 📁 migrations/                 # Database migration files
│   └── 📄 schema.prisma               # Prisma database schema
├── 📁 scripts/                        # Utility scripts
│   └── 📄 cleanup-old-files.js        # Migration cleanup script
├── 📁 test/                           # Test files (mirrors src structure)
│   ├── 📁 features/
│   │   └── 📁 users/
│   │       ├── 📁 domain/
│   │       │   └── 📁 entities/
│   │       │       └── 📄 user.entity.spec.ts
│   │       └── 📁 application/
│   │           └── 📄 users.service.spec.ts
│   └── 📄 jest-e2e.json
├── 📁 src/                            # Source code
│   ├── 📄 app.module.ts               # Root application module
│   ├── 📄 main.ts                     # Application entry point
│   │
│   ├── 📁 common/                     # Shared utilities and components
│   │   ├── 📁 constants/              # Application constants
│   │   ├── 📁 decorators/             # Custom decorators
│   │   ├── 📁 dto/                    # Common DTOs
│   │   │   └── 📄 pagination.dto.ts   # Pagination DTO
│   │   ├── 📁 exceptions/             # Custom exception classes
│   │   │   └── 📄 base.exception.ts   # Base exception definitions
│   │   └── 📁 filters/                # Exception filters
│   │       └── 📄 global-exception.filter.ts
│   │
│   ├── 📁 config/                     # Configuration files
│   │   ├── 📄 app.config.ts           # Application configuration
│   │   ├── 📄 twilio.config.ts        # Twilio configuration
│   │   └── 📄 zoho.config.ts          # Zoho CRM configuration
│   │
│   ├── 📁 core/                       # Core infrastructure services
│   │   ├── 📁 config/                 # Configuration module
│   │   │   └── 📄 config.module.ts    # Global configuration module
│   │   ├── 📁 logging/                # Logging services
│   │   │   ├── 📄 logger.service.ts   # Custom logger service
│   │   │   └── 📄 logger.module.ts    # Logger module
│   │   └── 📁 prisma/                 # Database connection
│   │       ├── 📄 prisma.service.ts   # Prisma database service
│   │       └── 📄 prisma.module.ts    # Prisma module
│   │
│   ├── 📁 features/                   # Business feature modules
│   │   ├── 📁 users/                  # User management feature
│   │   │   ├── 📁 application/        # Application layer (business logic)
│   │   │   │   ├── 📁 dto/            # Data Transfer Objects
│   │   │   │   │   ├── 📄 create-user.dto.ts
│   │   │   │   │   ├── 📄 update-user.dto.ts
│   │   │   │   │   └── 📄 user-response.dto.ts
│   │   │   │   └── 📄 users.service.ts # Business logic service
│   │   │   ├── 📁 domain/             # Domain layer (business entities)
│   │   │   │   ├── 📁 entities/       # Domain entities
│   │   │   │   │   └── 📄 user.entity.ts
│   │   │   │   └── 📁 repositories/   # Repository interfaces
│   │   │   │       └── 📄 user.repository.ts
│   │   │   ├── 📁 infrastructure/     # Infrastructure layer (external concerns)
│   │   │   │   ├── 📄 users.controller.ts    # HTTP controllers
│   │   │   │   └── 📄 users.repository.prisma.ts # Database implementation
│   │   │   └── 📄 users.module.ts     # Feature module definition
│   │   │
│   │   ├── 📁 business-users/         # Business user management
│   │   │   └── (follows same structure as users)
│   │   ├── 📁 orders/                 # Order management
│   │   │   └── (follows same structure as users)
│   │   └── 📁 products/               # Product management
│   │       └── (follows same structure as users)
│   │
│   └── 📁 integrations/               # Third-party service integrations
│       ├── 📁 crm/                    # CRM integrations
│       │   ├── 📄 crm.module.ts       # CRM integration module
│       │   └── 📁 zoho/               # Zoho CRM specific
│       │       ├── 📁 dto/            # Zoho-specific DTOs
│       │       │   ├── 📄 zoho-contact.dto.ts    # Contact DTOs
│       │       │   ├── 📄 zoho-currency.dto.ts   # Currency DTOs
│       │       │   └── 📄 zoho-salesorder.dto.ts # Sales order DTOs
│       │       ├── 📁 interfaces/     # Zoho API interfaces
│       │       │   └── 📄 zoho.interface.ts # Zoho API contracts
│       │       ├── 📄 zoho.service.ts # Zoho service implementation
│       │       └── 📄 zoho.module.ts  # Zoho module
│       └── 📁 whatsapp/               # WhatsApp integration
│           ├── 📄 whatsapp.controller.ts # WhatsApp endpoints
│           ├── 📄 whatsapp.service.ts    # WhatsApp business logic
│           └── 📄 whatsapp.module.ts     # WhatsApp module
│
├── 📄 .env                            # Environment variables
├── 📄 .env.example                    # Environment template
├── 📄 .gitignore                      # Git ignore rules
├── 📄 nest-cli.json                   # NestJS CLI configuration
├── 📄 package.json                    # Dependencies and scripts
├── 📄 README.md                       # Project documentation
├── 📄 tsconfig.build.json             # TypeScript build configuration
└── 📄 tsconfig.json                   # TypeScript configuration
```

## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles with **Feature-Based Organization**, providing clear separation of concerns and high maintainability.

### 🎯 Core Principles

1. **Independence of Frameworks**: Business logic doesn't depend on external frameworks
2. **Testability**: Each layer can be tested independently
3. **Independence of UI**: Controllers are just delivery mechanisms
4. **Independence of Database**: Business logic doesn't depend on database specifics
5. **Independence of External Services**: Business logic doesn't depend on external APIs

### 📚 Layer Architecture

Each feature follows a **3-layer architecture**:

#### 🔵 Domain Layer (innermost)
- **Location**: `src/features/{feature}/domain/`
- **Purpose**: Contains pure business logic and rules
- **Dependencies**: None (completely independent)
- **Contents**:
  - **Entities**: Core business objects with behavior
  - **Repository Interfaces**: Abstract contracts for data access
  - **Value Objects**: Immutable objects representing business concepts
  - **Domain Services**: Complex business logic that doesn't belong to entities

#### 🟡 Application Layer (middle)
- **Location**: `src/features/{feature}/application/`
- **Purpose**: Orchestrates domain objects to fulfill use cases
- **Dependencies**: Only depends on Domain layer
- **Contents**:
  - **Services**: Use case implementations (business workflows)
  - **DTOs**: Data transfer objects for API contracts
  - **Interfaces**: Application-specific contracts

#### 🔴 Infrastructure Layer (outermost)
- **Location**: `src/features/{feature}/infrastructure/`
- **Purpose**: Implements external concerns and technical details
- **Dependencies**: Can depend on all layers and external libraries
- **Contents**:
  - **Controllers**: HTTP request/response handling
  - **Repository Implementations**: Database access implementations
  - **External Service Adapters**: Third-party API integrations

## 🚀 Getting Started

### 1. Adding a New Feature

When adding a new feature (e.g., "orders"), follow this structure:

```
src/features/orders/
├── application/
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   ├── update-order.dto.ts
│   │   └── order-response.dto.ts
│   └── orders.service.ts
├── domain/
│   ├── entities/
│   │   └── order.entity.ts
│   └── repositories/
│       └── order.repository.ts
├── infrastructure/
│   ├── orders.controller.ts
│   └── orders.repository.prisma.ts
└── orders.module.ts
```

### 2. Development Workflow

1. **Start with Domain**: Define entities and repository interfaces
2. **Implement Application**: Create services and DTOs
3. **Add Infrastructure**: Implement controllers and repository implementations
4. **Write Tests**: Add tests for each layer
5. **Integration**: Wire everything together in the module

### 3. Testing Strategy

- **Unit Tests**: Test domain entities and application services
- **Integration Tests**: Test repository implementations with database
- **E2E Tests**: Test complete user workflows through controllers

## 📋 Code Guidelines

### ✅ Do's

- Keep domain entities pure (no external dependencies)
- Use dependency injection for loose coupling
- Write comprehensive tests for business logic
- Use DTOs for API boundaries
- Handle errors with custom exceptions
- Log important business events
- Validate inputs at application boundaries

### ❌ Don'ts

- Don't put business logic in controllers
- Don't access database directly from services (use repositories)
- Don't import infrastructure code into domain layer
- Don't skip input validation
- Don't return database entities directly from APIs
- Don't ignore error handling

## 🔧 Configuration Management

### Environment-Specific Configuration
- **Development**: Full logging, Swagger docs, relaxed CORS
- **Production**: Minimal logging, strict CORS, no debug info

### Configuration Files
- `app.config.ts`: General application settings
- `twilio.config.ts`: Twilio API configuration
- `zoho.config.ts`: Zoho CRM configuration

## 📊 Monitoring & Logging

### Structured Logging
- Context-aware logging with request IDs
- Business event logging
- Error tracking with stack traces
- Performance monitoring

### Health Checks
- Database connectivity
- External service availability
- Application metrics

## 🔄 Data Flow

```
HTTP Request → Controller → Service → Repository → Database
     ↓            ↓          ↓          ↓
   Validate → Transform → Process → Persist
     ↓            ↓          ↓          ↓
  Response ← DTO ← Entity ← Database Model
```

## 🎨 Benefits of This Architecture

1. **Scalability**: Easy to add new features without affecting existing ones
2. **Maintainability**: Clear separation of concerns makes code easier to understand
3. **Testability**: Each layer can be tested independently
4. **Flexibility**: Easy to swap implementations (e.g., change from Prisma to TypeORM)
5. **Team Collaboration**: Clear boundaries allow multiple developers to work simultaneously
6. **Code Reusability**: Domain logic can be reused across different interfaces

## 🔮 Future Enhancements

- **Event Sourcing**: For audit trails and complex business workflows
- **CQRS**: Separate read/write models for complex queries
- **Microservices**: Split features into separate services as needed
- **GraphQL**: Alternative API layer for flexible data fetching
- **Real-time Features**: WebSocket integration for live updates

This architecture provides a solid foundation that will scale with your business needs while maintaining code