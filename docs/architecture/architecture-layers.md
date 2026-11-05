
# API Sentinel — Clean and Hexagonal Architecture

## 1. Purpose

This document explains how API Sentinel organizes business logic, application operations, external integrations and presentation components.

## 2. Architectural Approaches

API Sentinel will use three complementary architectural approaches.

### Domain-Driven Design

Used to model the business domain through entities, value objects, aggregates, bounded contexts and domain events.

### Clean Architecture

Used to organize application responsibilities and enforce dependency direction.

### Hexagonal Architecture

Used to isolate the application core from external systems through ports and adapters.

## 3. Application Layers

### 3.1 Domain Layer

Contains business concepts and rules.

Examples:

- Entities
- Value Objects
- Aggregate Roots
- Domain Services
- Domain Events
- Domain Invariants

The Domain Layer must not depend on NestJS, Prisma, Redis or other infrastructure frameworks.

### 3.2 Application Layer

Contains application use cases and orchestration logic.

Examples:

- CreateProject
- CreateTestCase
- ActivateTestCase
- ExecuteTestSuite
- ApproveBaseline
- DetectRegression

The Application Layer coordinates domain objects and interacts with external capabilities through ports.

### 3.3 Infrastructure Layer

Contains implementations of technical dependencies.

Examples:

- Prisma repositories
- PostgreSQL integration
- Redis integration
- BullMQ adapters
- REST execution adapters
- GraphQL execution adapters
- gRPC execution adapters
- External AI provider integrations

### 3.4 Presentation Layer

Handles communication with external consumers.

Examples:

- NestJS REST controllers
- GraphQL resolvers, if exposed
- Request DTOs
- Response mapping
- Authentication guards

Presentation components should delegate business operations to application use cases.

## 4. Dependency Rule

Dependencies should point inward toward the business logic.

- Domain must not depend on Application or Infrastructure.
- Application may depend on Domain and its own port abstractions.
- Infrastructure implements the ports required by Application.
- Presentation invokes Application use cases.

The application core must not depend directly on technical implementation details.

## 5. Hexagonal Architecture

Hexagonal Architecture uses ports and adapters.

### Ports

Ports define capabilities required by or exposed by the application core.

Examples:

- TestRunRepository
- ExecutionQueue
- TestExecutor
- ExecuteTestSuite

### Adapters

Adapters connect ports to concrete technologies or external consumers.

Examples:

- PrismaTestRunRepository
- BullMQExecutionQueue
- RestTestExecutor
- GraphQLTestExecutor
- GrpcTestExecutor
- NestJS REST Controller

### Driving Adapters

Driving adapters invoke application operations.

Examples:

- REST controllers
- GraphQL resolvers
- Background worker job handlers

### Driven Adapters

Driven adapters implement capabilities required by the application.

Examples:

- Database repositories
- Queue implementations
- Protocol clients
- External provider integrations

## 6. Example: Test Case Activation

1. A client sends an activation request.
2. A NestJS controller receives the request.
3. The controller invokes the ActivateTestCase use case.
4. The use case loads the TestCase through a repository port.
5. The TestCase domain entity validates its business rules.
6. The use case persists the updated entity through the repository port.
7. An appropriate event may be published.
8. The controller returns the response.

## 7. Example: Test Execution

1. The frontend requests execution.
2. The controller invokes the ExecuteTestSuite use case.
3. The application validates project and environment context.
4. A TestRun is created.
5. An ExecutionQueue port is used to submit the background job.
6. The BullMQ adapter submits the job to Redis.
7. A worker consumes the job.
8. The worker invokes the appropriate protocol execution adapter.
9. Results are persisted through repository ports.
10. Completion events are published for downstream processing.

## 8. Architectural Principles

- Business rules remain independent of frameworks.
- Application use cases coordinate domain operations.
- External dependencies are accessed through explicit abstractions.
- Infrastructure implements outbound ports.
- Controllers do not own business logic.
- Protocol execution is isolated behind protocol-specific adapters.
- Architectural abstractions should be introduced where they provide meaningful boundaries.

## 9. Implementation Strategy

API Sentinel will use a pragmatic layered structure inside its business modules.

The application will begin as a modular monolith with a separate background worker process.

The architecture will evolve based on actual requirements rather than introducing premature distributed-system complexity.
