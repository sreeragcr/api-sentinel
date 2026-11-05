
# API Sentinel — Backend Module Structure

## 1. Architecture

The backend will use NestJS with a modular monolith approach.

Each business module will have clear responsibilities and dependency boundaries.

## 2. Initial Business Modules

| Module | Responsibility |
|---|---|
| Identity | Authentication and authorization |
| Workspace | Workspace and membership management |
| Project | Project management |
| API Registry | API registration and contract management |
| Environment | Environment and target configuration |
| Test Management | Test cases, suites and assertions |
| Test Execution | Execution orchestration |
| Regression | Baselines and regression detection |
| Scheduling | Scheduled test execution |

## 3. Module Structure

Each business module may contain:

- domain/
- application/
- infrastructure/
- presentation/
- module registration file

Not every module needs every directory immediately. The structure should reflect actual responsibilities.

## 4. NestJS Concepts

### Modules

Organize related application functionality and control provider visibility.

### Controllers

Receive external requests and invoke application operations.

### Providers

Represent injectable dependencies managed by NestJS.

### Dependency Injection

Allows classes to receive dependencies without manually constructing them.

## 5. Dependency Injection Strategy

The application layer defines ports where external capabilities are needed.

Infrastructure adapters implement those ports.

NestJS injection tokens connect application abstractions to infrastructure implementations.

Example:

- Port: TestCaseRepository
- Token: TEST_CASE_REPOSITORY
- Adapter: PrismaTestCaseRepository

## 6. Architectural Rules

- Domain logic should not depend on NestJS.
- Application use cases should depend on abstractions rather than infrastructure implementations.
- Infrastructure adapters should implement application ports.
- Controllers should not contain business rules.
- Modules should expose only the functionality required by other modules.
- Avoid unnecessary global providers and cross-module dependencies.

## 7. Application Processes

The monorepo will contain:

- API application: handles user-facing application requests.
- Worker application: processes background execution jobs.
- Shared packages: contain code intentionally reused by multiple applications.

Both applications must follow the same domain and application boundaries.

## 8. Current Status

This is the proposed initial backend structure. The detailed module boundaries, provider registration and dependency configuration will be established during implementation.
